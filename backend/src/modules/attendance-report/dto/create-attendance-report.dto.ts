import { ApiProperty, OmitType } from "@nestjs/swagger";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
import { Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { AttendanceAbsenceItemDto } from "./attendance-absence-item.dto";

export class CreateAttendanceReportDto extends OmitType(AttendanceReport, [
    "_id",
]) {
    @ApiProperty({ type: [AttendanceAbsenceItemDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceAbsenceItemDto)
    @IsOptional()
    absences?: AttendanceAbsenceItemDto[];
}
