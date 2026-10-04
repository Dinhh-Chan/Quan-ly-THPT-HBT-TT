import { ApiProperty, OmitType } from "@nestjs/swagger";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { Type } from "class-transformer";
import {
    IsNumber,
    IsObject,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { ScoringClassificationDto } from "./scoring-classification.dto";

/** Dạng FE: điểm từng tiêu chí gom thành object; server tách ra ScoringCriterion */
export class CreateScoringRuleDto extends OmitType(ScoringRule, ["_id"]) {
    @ApiProperty({ required: false, example: { DI_MUON: 1 } })
    @IsObject()
    @IsOptional()
    deductions?: Record<string, number>;

    @ApiProperty({ required: false, example: { "3.1": 10 } })
    @IsObject()
    @IsOptional()
    bonuses?: Record<string, number>;

    @IsNumber()
    @IsOptional()
    oralHighPoint?: number;

    @IsNumber()
    @IsOptional()
    oralLowPoint?: number;

    @ApiProperty({ type: ScoringClassificationDto, required: false })
    @ValidateNested()
    @Type(() => ScoringClassificationDto)
    @IsOptional()
    classification?: ScoringClassificationDto;
}
