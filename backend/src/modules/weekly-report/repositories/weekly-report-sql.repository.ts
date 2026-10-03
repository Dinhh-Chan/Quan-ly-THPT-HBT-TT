import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { WeeklyReportRepository } from "@module/weekly-report/repositories/weekly-report-repository.interface";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
import { WeeklyReportModel } from "@module/weekly-report/models/weekly-report.model";

export class WeeklyReportSqlRepository
    extends SqlRepository<WeeklyReport>
    implements WeeklyReportRepository
{
    constructor(
        @InjectModel(WeeklyReportModel)
        private readonly weeklyReportModel: typeof WeeklyReportModel,
    ) {
        super(weeklyReportModel);
    }
}
