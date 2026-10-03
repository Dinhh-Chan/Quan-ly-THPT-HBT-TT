import { OmitType } from "@nestjs/swagger";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";

export class CreateScoringRuleDto extends OmitType(ScoringRule, ["_id"]) {}
