import { SequelizeModule } from "@nestjs/sequelize";
import { WeeklyReportModel } from "@module/weekly-report/models/weekly-report.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { WeeklyReportService } from "@module/weekly-report/services/weekly-report.service";
import { WeeklyReportSqlRepository } from "@module/weekly-report/repositories/weekly-report-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { WeeklyReportController } from "@module/weekly-report/controllers/weekly-report.controller";

@Module({
    imports: [SequelizeModule.forFeature([WeeklyReportModel])],
    exports: [WeeklyReportService],
    providers: [
        WeeklyReportService,
        RepositoryProvider(Entity.WEEKLY_REPORT, WeeklyReportSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [WeeklyReportController],
})
export class WeeklyReportModule {}
