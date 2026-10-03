import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { AttendanceReportRepository } from "@module/attendance-report/repositories/attendance-report-repository.interface";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class AttendanceReportService extends BaseService<
    AttendanceReport,
    AttendanceReportRepository
> {
    constructor(
        @InjectRepository(Entity.ATTENDANCE_REPORT)
        private readonly attendanceReportRepository: AttendanceReportRepository,
    ) {
        super(attendanceReportRepository);
    }
}
