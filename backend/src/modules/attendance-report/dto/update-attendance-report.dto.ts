import { PartialType } from "@nestjs/swagger";
import { CreateAttendanceReportDto } from "@module/attendance-report/dto/create-attendance-report.dto";

export class UpdateAttendanceReportDto extends PartialType(
    CreateAttendanceReportDto,
) {}
