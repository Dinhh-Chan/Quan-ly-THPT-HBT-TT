import { OmitType } from "@nestjs/swagger";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";

export class CreateAttendanceReportDto extends OmitType(AttendanceReport, [
    "_id",
]) {}
