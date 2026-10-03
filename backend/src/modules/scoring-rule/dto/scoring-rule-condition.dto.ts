import { PartialType } from "@nestjs/swagger";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";

export class ScoringRuleConditionDto extends PartialType(ScoringRule) {}
