import { PartialType } from "@nestjs/swagger";
import { CreateCompetitionWeekDto } from "@module/competition-week/dto/create-competition-week.dto";

export class UpdateCompetitionWeekDto extends PartialType(
    CreateCompetitionWeekDto,
) {}
