import { PartialType } from "@nestjs/swagger";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";

export class CompetitionResultConditionDto extends PartialType(
    CompetitionResult,
) {}
