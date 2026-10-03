import { PartialType } from "@nestjs/swagger";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";

export class CompetitionWeekConditionDto extends PartialType(CompetitionWeek) {}
