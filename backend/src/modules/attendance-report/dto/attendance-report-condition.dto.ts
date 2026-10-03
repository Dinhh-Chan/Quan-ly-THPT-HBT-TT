import { PartialType } from "@nestjs/swagger";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";

export class AttendanceReportConditionDto extends PartialType(
    AttendanceReport,
) {}
