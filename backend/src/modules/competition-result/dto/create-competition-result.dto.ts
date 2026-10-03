import { OmitType } from "@nestjs/swagger";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";

export class CreateCompetitionResultDto extends OmitType(CompetitionResult, [
    "_id",
]) {}
