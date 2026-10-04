import { SequelizeModule } from "@nestjs/sequelize";
import { AttendanceReportModel } from "@module/attendance-report/models/attendance-report.model";
import { Module } from "@nestjs/common";
import { AbsenceModule } from "@module/absence/absence.module";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { AttendanceReportService } from "@module/attendance-report/services/attendance-report.service";
import { AttendanceReportSqlRepository } from "@module/attendance-report/repositories/attendance-report-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { AttendanceReportController } from "@module/attendance-report/controllers/attendance-report.controller";

@Module({
    imports: [
        SequelizeModule.forFeature([AttendanceReportModel]),
        AbsenceModule,
    ],
    exports: [AttendanceReportService],
    providers: [
        AttendanceReportService,
        RepositoryProvider(
            Entity.ATTENDANCE_REPORT,
            AttendanceReportSqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [AttendanceReportController],
})
export class AttendanceReportModule {}
