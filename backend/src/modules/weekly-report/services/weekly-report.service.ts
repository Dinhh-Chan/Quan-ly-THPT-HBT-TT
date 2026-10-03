import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { WeeklyReportRepository } from "@module/weekly-report/repositories/weekly-report-repository.interface";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class WeeklyReportService extends BaseService<
    WeeklyReport,
    WeeklyReportRepository
> {
    constructor(
        @InjectRepository(Entity.WEEKLY_REPORT)
        private readonly weeklyReportRepository: WeeklyReportRepository,
    ) {
        super(weeklyReportRepository);
    }
}
