import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { AbsenceService } from "@module/absence/services/absence.service";
import { AttendanceAbsenceItemDto } from "@module/attendance-report/dto/attendance-absence-item.dto";
import { AttendanceReportRepository } from "@module/attendance-report/repositories/attendance-report-repository.interface";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
import { LookupService } from "@module/lookup/lookup.service";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

/** FE gửi/nhận báo cáo kèm mảng `absences`; DB lưu từng em vắng ở bảng Absence */
@Injectable()
export class AttendanceReportService extends ViewBaseService<
    AttendanceReport,
    AttendanceReportRepository,
    AttendanceAbsenceItemDto[]
> {
    constructor(
        @InjectRepository(Entity.ATTENDANCE_REPORT)
        private readonly attendanceReportRepository: AttendanceReportRepository,
        private readonly absenceService: AbsenceService,
        private readonly lookupService: LookupService,
    ) {
        super(attendanceReportRepository);
    }

    protected async toView(list: AttendanceReport[]) {
        if (!list.length) {
            return [];
        }
        const absences = await this.absenceService.getMany(null, {
            reportId: { $in: list.map((r) => r._id) },
        });
        const [studentName, userName] = await Promise.all([
            this.lookupService.studentNames(absences.map((a) => a.studentId)),
            this.lookupService.userNames(list.map((r) => r.reporterId)),
        ]);
        const byReport = _.groupBy(absences, "reportId");
        return list.map((r) => ({
            ...r,
            reporterName: userName.get(r.reporterId) || "",
            absences: (byReport[r._id] || []).map((a) => ({
                studentId: a.studentId,
                studentName: studentName.get(a.studentId) || "",
                excused: a.excused,
                reason: a.reason,
                session: a.session,
            })),
        }));
    }

    protected async prepareWrite(
        user: User,
        dto: any,
        existing?: AttendanceReport,
    ) {
        const { absences, ...data } = dto;
        if (!existing) {
            data.reporterId = String(user._id);
        }
        if (absences) {
            data.absentCount = absences.length;
            const total = data.total ?? existing?.total;
            if (total !== undefined) {
                data.presentCount = total - absences.length;
            }
        }
        return { data, extra: absences };
    }

    protected async saveRelations(
        user: User,
        report: AttendanceReport,
        absences: AttendanceAbsenceItemDto[] | undefined,
        transaction: unknown,
    ) {
        if (!absences) {
            return;
        }
        await this.replaceChildren(
            this.absenceService,
            user,
            { reportId: report._id },
            _.uniqBy(absences, "studentId").map((a) => ({
                reportId: report._id,
                studentId: a.studentId,
                classId: report.classId,
                date: report.date,
                excused: a.excused,
                reason: a.reason,
                session: a.session,
            })),
            transaction,
        );
    }
}
