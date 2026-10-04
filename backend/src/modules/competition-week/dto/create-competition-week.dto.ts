import { ApiProperty, OmitType } from "@nestjs/swagger";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
import { IsArray, IsObject, IsOptional } from "class-validator";

export class CreateCompetitionWeekDto extends OmitType(CompetitionWeek, [
    "_id",
]) {
    /**
     * Kết quả từng lớp do FE tính (ClassWeekResult).
     * TODO: theo docs/database.md, server nên tự tính lại thay vì nhận số từ FE.
     */
    @ApiProperty({ type: [Object], required: false })
    @IsArray()
    @IsObject({ each: true })
    @IsOptional()
    results?: Record<string, unknown>[];
}
