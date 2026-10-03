import { PartialType } from "@nestjs/swagger";
import { CreateScoringCriterionDto } from "@module/scoring-criterion/dto/create-scoring-criterion.dto";

export class UpdateScoringCriterionDto extends PartialType(
    CreateScoringCriterionDto,
) {}
