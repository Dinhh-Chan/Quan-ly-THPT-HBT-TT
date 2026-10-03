import { PartialType } from "@nestjs/swagger";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";

export class ScoringCriterionConditionDto extends PartialType(
    ScoringCriterion,
) {}
