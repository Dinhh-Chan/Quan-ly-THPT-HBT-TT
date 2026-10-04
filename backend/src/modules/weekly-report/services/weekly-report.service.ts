import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { LookupService } from "@module/lookup/lookup.service";
import { WeeklyReportLogbookStudentService } from "@module/weekly-report-logbook-student/services/weekly-report-logbook-student.service";
import { WeeklyReportStatus } from "@module/weekly-report/common/constant";
import { WeeklyReportRepository } from "@module/weekly-report/repositories/weekly-report-repository.interface";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

/**
 * FE dùng `logbookErrorStudents: string[]` (id học sinh, lặp theo số lần bị ghi);
 * DB lưu mỗi em một dòng ở WeeklyReportLogbookStudent kèm `count`.
 */
@Injectable()
export class WeeklyReportService extends ViewBaseService<
    WeeklyReport,
    WeeklyReportRepository,
    string[]
> {
    constructor(
        @InjectRepository(Entity.WEEKLY_REPORT)
        private readonly weeklyReportRepository: WeeklyReportRepository,
        private readonly logbookStudentService: WeeklyReportLogbookStudentService,
        private readonly lookupService: LookupService,
    ) {
        super(weeklyReportRepository);
    }

    protected async toView(list: WeeklyReport[]) {
        if (!list.length) {
            return [];
        }
        const [rows, userName] = await Promise.all([
            this.logbookStudentService.getMany(null, {
                weeklyReportId: { $in: list.map((r) => r._id) },
            }),
            this.lookupService.userNames(list.map((r) => r.submittedById)),
        ]);
        const byReport = _.groupBy(rows, "weeklyReportId");
        return list.map((r) => ({
            ...r,
            logbookErrorStudents: (byReport[r._id] || []).flatMap((row) =>
                Array(row.count || 1).fill(row.studentId),
            ),
            submittedByName: r.submittedById
                ? userName.get(r.submittedById)
                : undefined,
        }));
    }

    protected async prepareWrite(user: User, dto: any) {
        const { logbookErrorStudents, ...data } = dto;
        if (data.status === WeeklyReportStatus.DA_NOP) {
            data.submittedById = String(user._id);
        }
        return { data, extra: logbookErrorStudents };
    }

    protected async saveRelations(
        user: User,
        report: WeeklyReport,
        studentIds: string[] | undefined,
        transaction: unknown,
    ) {
        if (!studentIds) {
            return;
        }
        await this.replaceChildren(
            this.logbookStudentService,
            user,
            { weeklyReportId: report._id },
            Object.entries(_.countBy(studentIds)).map(([studentId, count]) => ({
                weeklyReportId: report._id,
                studentId,
                count,
            })),
            transaction,
        );
    }
}
