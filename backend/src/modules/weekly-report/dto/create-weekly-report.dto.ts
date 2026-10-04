import { ApiProperty, OmitType } from "@nestjs/swagger";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateWeeklyReportDto extends OmitType(WeeklyReport, ["_id"]) {
    @ApiProperty({
        type: [String],
        required: false,
        description: "Id học sinh bị ghi SĐB; lặp lại nếu bị ghi nhiều lần",
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    logbookErrorStudents?: string[];
}
