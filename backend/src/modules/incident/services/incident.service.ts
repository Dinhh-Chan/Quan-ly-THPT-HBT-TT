import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FilterItemDto } from "@common/dto/filter-item.dto";
import { Configuration } from "@config/configuration";
import { ApiError } from "@config/exception/api-error";
import { ViewBaseService } from "@config/service/view-base.service";
import { FileScope } from "@module/file/common/constant";
import { FileService } from "@module/file/file.service";
import { IncidentPhotoService } from "@module/incident-photo/services/incident-photo.service";
import { IncidentStudentService } from "@module/incident-student/services/incident-student.service";
import { IncidentStatus } from "@module/incident/common/constant";
import { CreateIncidentStudentItemDto } from "@module/incident/dto/create-incident-student-item.dto";
import { IncidentRepository } from "@module/incident/repositories/incident-repository.interface";
import { Incident } from "@module/incident/entities/incident.entity";
import { LookupService } from "@module/lookup/lookup.service";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

type IncidentExtra = {
    students?: CreateIncidentStudentItemDto[];
    fileIds?: string[];
};

/** Ai thực hiện bước nào khi đổi trạng thái */
const STATUS_ACTOR: Partial<Record<IncidentStatus, keyof Incident>> = {
    [IncidentStatus.DA_TIEP_NHAN]: "receivedById",
    [IncidentStatus.DA_XAC_MINH]: "verifiedById",
    [IncidentStatus.DA_XU_LY]: "handledById",
};

@Injectable()
export class IncidentService extends ViewBaseService<
    Incident,
    IncidentRepository,
    IncidentExtra
> {
    constructor(
        @InjectRepository(Entity.INCIDENT)
        private readonly incidentRepository: IncidentRepository,
        private readonly incidentStudentService: IncidentStudentService,
        private readonly incidentPhotoService: IncidentPhotoService,
        private readonly lookupService: LookupService,
        private readonly fileService: FileService,
        private readonly configService: ConfigService<Configuration>,
    ) {
        super(incidentRepository);
    }

    /**
     * Bảng Incident không có cột lớp: lớp nằm ở IncidentStudent.classId.
     * Đổi filter "classIds" (eq/in) thành "_id in (sự việc có học sinh thuộc các lớp đó)".
     */
    protected async mapFilters(filters?: FilterItemDto<Incident>[]) {
        if (!filters?.length) {
            return filters;
        }
        return Promise.all(
            filters.map(async (f) => {
                if ((f.field as string) !== "classIds") {
                    return f;
                }
                const classIds = (f.values || []).map(String);
                const links = classIds.length
                    ? await this.incidentStudentService.getMany(null, {
                          classId: { $in: classIds },
                      })
                    : [];
                const ids = _.uniq(links.map((l) => l.incidentId));
                return {
                    field: "_id",
                    operator: "in",
                    // Mảng rỗng sinh ra "IN ()" lỗi cú pháp nên dùng id không tồn tại
                    values: ids.length ? ids : ["__none__"],
                } as unknown as FilterItemDto<Incident>;
            }),
        );
    }

    private photoUrl(fileId: string) {
        const address = this.configService.get("server.address", {
            infer: true,
        });
        return `${address}/file/${fileId}/photo`;
    }

    /** Gắn học sinh, lớp, ảnh và tên người dùng */
    protected async toView(list: Incident[]) {
        if (!list.length) {
            return [];
        }
        const ids = list.map((i) => i._id);
        const [links, photos] = await Promise.all([
            this.incidentStudentService.getMany(null, {
                incidentId: { $in: ids },
            }),
            this.incidentPhotoService.getMany(
                null,
                { incidentId: { $in: ids } },
                { sort: { sortOrder: 1 } },
            ),
        ]);
        const [studentName, userName] = await Promise.all([
            this.lookupService.studentNames(links.map((l) => l.studentId)),
            this.lookupService.userNames(
                list.flatMap((i) => [
                    i.reporterId,
                    i.receivedById,
                    i.verifiedById,
                    i.handledById,
                ]),
            ),
        ]);
        const linksByIncident = _.groupBy(links, "incidentId");
        const photosByIncident = _.groupBy(photos, "incidentId");
        const name = (id?: string) => (id ? userName.get(id) : undefined);

        return list.map((i) => {
            const own = linksByIncident[i._id] || [];
            return {
                ...i,
                students: own.map((l) => ({
                    studentId: l.studentId,
                    studentName: studentName.get(l.studentId) || "",
                    classId: l.classId,
                })),
                classIds: _.uniq(own.map((l) => l.classId)),
                photos: (photosByIncident[i._id] || []).map((p) =>
                    this.photoUrl(p.fileId),
                ),
                reporterName: name(i.reporterId),
                receivedByName: name(i.receivedById),
                verifiedByName: name(i.verifiedById),
                handledByName: name(i.handledById),
            };
        });
    }

    /** Lưu ảnh data URL vào module File, trả về File._id */
    private async savePhoto(user: User, dataUrl: string, index: number) {
        const match = /^data:(image\/[\w.+-]+);base64,(.+)$/s.exec(dataUrl);
        if (!match) {
            throw ApiError.BadRequest("error-incident-photo-invalid");
        }
        const [, mimetype, base64] = match;
        const buffer = Buffer.from(base64, "base64");
        const ext = mimetype.split("/")[1].replace("jpeg", "jpg");
        const { file } = await this.fileService.create(
            user,
            { scope: FileScope.PUBLIC, file: undefined },
            {
                originalname: `incident-${Date.now()}-${index}.${ext}`,
                mimetype,
                buffer,
                size: buffer.length,
            } as Express.Multer.File,
        );
        return String(file._id);
    }

    protected async prepareWrite(user: User, dto: any, existing?: Incident) {
        if (existing) {
            // Người thực hiện mỗi bước lấy từ tài khoản đăng nhập, không tin client gửi lên
            const actorField = STATUS_ACTOR[dto.status as IncidentStatus];
            return {
                data: actorField
                    ? { ...dto, [actorField]: String(user._id) }
                    : dto,
            };
        }
        const { students = [], photos = [], ...data } = dto;
        if (!students.length) {
            throw ApiError.BadRequest("error-incident-no-student");
        }
        // Ảnh lưu ở File (Mongo/S3), nằm ngoài transaction SQL nên upload trước
        const fileIds = await Promise.all(
            (photos as string[]).map((p, i) => this.savePhoto(user, p, i)),
        );
        return {
            data: {
                ...data,
                reporterId: String(user._id),
                status: IncidentStatus.MOI,
            },
            extra: { students, fileIds },
        };
    }

    protected async saveRelations(
        user: User,
        entity: Incident,
        extra: IncidentExtra,
        transaction: unknown,
    ) {
        if (!extra) {
            return;
        }
        await this.incidentStudentService.insertMany(
            user,
            _.uniqBy(extra.students, "studentId").map((s) => ({
                incidentId: entity._id,
                studentId: s.studentId,
                classId: s.classId,
            })) as any[],
            { transaction },
        );
        if (extra.fileIds.length) {
            await this.incidentPhotoService.insertMany(
                user,
                extra.fileIds.map((fileId, sortOrder) => ({
                    incidentId: entity._id,
                    fileId,
                    sortOrder,
                })) as any[],
                { transaction },
            );
        }
    }
}
