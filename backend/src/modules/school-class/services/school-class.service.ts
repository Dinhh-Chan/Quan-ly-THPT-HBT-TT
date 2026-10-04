import { Injectable } from "@nestjs/common";
import { FilterItemDto } from "@common/dto/filter-item.dto";
import { ViewBaseService } from "@config/service/view-base.service";
import { LookupService } from "@module/lookup/lookup.service";
import { QueryCondition } from "@module/repository/common/base-repository.interface";
import { SchoolClassRepository } from "@module/school-class/repositories/school-class-repository.interface";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolYearService } from "@module/school-year/services/school-year.service";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class SchoolClassService extends ViewBaseService<
    SchoolClass,
    SchoolClassRepository
> {
    constructor(
        @InjectRepository(Entity.SCHOOL_CLASS)
        private readonly schoolClassRepository: SchoolClassRepository,
        private readonly schoolYearService: SchoolYearService,
        private readonly lookupService: LookupService,
    ) {
        super(schoolClassRepository);
    }

    /** Đọc thô theo điều kiện, không thêm lọc năm học (dùng nội bộ) */
    internalGetMany(conditions: QueryCondition<SchoolClass>) {
        return this.schoolClassRepository.getMany(conditions);
    }

    /** FE không lọc theo năm học: mặc định chỉ trả lớp của năm học hiện tại */
    protected async mapFilters(filters?: FilterItemDto<SchoolClass>[]) {
        const list = filters || [];
        if (
            list.some((f) =>
                ["schoolYearId", "_id"].includes(f.field as string),
            )
        ) {
            return list;
        }
        const yearId = await this.schoolYearService
            .getCurrentId()
            .catch(() => null);
        return yearId
            ? [
                  ...list,
                  {
                      field: "schoolYearId",
                      operator: "eq",
                      values: [yearId],
                  } as unknown as FilterItemDto<SchoolClass>,
              ]
            : list;
    }

    /** Tên GVCN: ưu tiên tên nhập tay, không có thì lấy từ tài khoản GVCN */
    protected async toView(list: SchoolClass[]) {
        const names = await this.lookupService.userNames(
            list.map((c) => c.homeroomTeacherId),
        );
        return list.map((c) => ({
            ...c,
            homeroomTeacherName:
                c.homeroomTeacherName ||
                (c.homeroomTeacherId
                    ? names.get(c.homeroomTeacherId)
                    : undefined),
        }));
    }

    protected async prepareWrite(user: User, dto: any, existing?: SchoolClass) {
        if (!existing && !dto.schoolYearId) {
            return {
                data: {
                    ...dto,
                    schoolYearId: await this.schoolYearService.getCurrentId(),
                },
            };
        }
        return { data: dto };
    }
}
