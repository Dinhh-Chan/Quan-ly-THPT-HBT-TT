import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { AttendanceReportRepository } from "@module/attendance-report/repositories/attendance-report-repository.interface";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
import { AttendanceReportModel } from "@module/attendance-report/models/attendance-report.model";

export class AttendanceReportSqlRepository
    extends SqlRepository<AttendanceReport>
    implements AttendanceReportRepository
{
    constructor(
        @InjectModel(AttendanceReportModel)
        private readonly attendanceReportModel: typeof AttendanceReportModel,
    ) {
        super(attendanceReportModel);
    }
}
