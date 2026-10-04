import { ApiProperty, OmitType } from "@nestjs/swagger";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { IsArray, IsOptional } from "class-validator";

export class CreateSchoolYearDto extends OmitType(SchoolYear, ["_id"]) {
    @ApiProperty({ type: [String], required: false, example: ["2026-09-02"] })
    @IsArray()
    @IsYYYYMMDD({ each: true })
    @IsOptional()
    holidays?: string[];
}
