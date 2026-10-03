import { PartialType } from "@nestjs/swagger";
import { CreateScoringRuleDto } from "@module/scoring-rule/dto/create-scoring-rule.dto";

export class UpdateScoringRuleDto extends PartialType(CreateScoringRuleDto) {}
