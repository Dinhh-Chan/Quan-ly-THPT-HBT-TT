import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { CompetitionWeekRepository } from "@module/competition-week/repositories/competition-week-repository.interface";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class CompetitionWeekService extends BaseService<
    CompetitionWeek,
    CompetitionWeekRepository
> {
    constructor(
        @InjectRepository(Entity.COMPETITION_WEEK)
        private readonly competitionWeekRepository: CompetitionWeekRepository,
    ) {
        super(competitionWeekRepository);
    }
}
