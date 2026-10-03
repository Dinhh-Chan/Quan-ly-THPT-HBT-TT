import { SequelizeModule } from "@nestjs/sequelize";
import { WeeklyReportLogbookStudentModel } from "@module/weekly-report-logbook-student/models/weekly-report-logbook-student.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { WeeklyReportLogbookStudentService } from "@module/weekly-report-logbook-student/services/weekly-report-logbook-student.service";
import { WeeklyReportLogbookStudentSqlRepository } from "@module/weekly-report-logbook-student/repositories/weekly-report-logbook-student-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { WeeklyReportLogbookStudentController } from "@module/weekly-report-logbook-student/controllers/weekly-report-logbook-student.controller";

@Module({
    imports: [SequelizeModule.forFeature([WeeklyReportLogbookStudentModel])],
    exports: [WeeklyReportLogbookStudentService],
    providers: [
        WeeklyReportLogbookStudentService,
        RepositoryProvider(
            Entity.WEEKLY_REPORT_LOGBOOK_STUDENT,
            WeeklyReportLogbookStudentSqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [WeeklyReportLogbookStudentController],
})
export class WeeklyReportLogbookStudentModule {}
