import { OmitType } from "@nestjs/swagger";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";

export class CreateScoringCriterionDto extends OmitType(ScoringCriterion, [
    "_id",
]) {}
