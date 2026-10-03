import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";

export interface CompetitionWeekRepository
    extends BaseRepository<CompetitionWeek> {}
