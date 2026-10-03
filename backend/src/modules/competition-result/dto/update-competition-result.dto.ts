import { PartialType } from "@nestjs/swagger";
import { CreateCompetitionResultDto } from "@module/competition-result/dto/create-competition-result.dto";

export class UpdateCompetitionResultDto extends PartialType(
    CreateCompetitionResultDto,
) {}
