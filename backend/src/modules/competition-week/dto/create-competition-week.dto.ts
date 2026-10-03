import { OmitType } from "@nestjs/swagger";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";

export class CreateCompetitionWeekDto extends OmitType(CompetitionWeek, [
    "_id",
]) {}
