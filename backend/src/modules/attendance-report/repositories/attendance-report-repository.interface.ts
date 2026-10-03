import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";

export interface AttendanceReportRepository
    extends BaseRepository<AttendanceReport> {}
