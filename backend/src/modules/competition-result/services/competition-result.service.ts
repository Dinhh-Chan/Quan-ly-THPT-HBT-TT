import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { CompetitionResultRepository } from "@module/competition-result/repositories/competition-result-repository.interface";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class CompetitionResultService extends BaseService<
    CompetitionResult,
    CompetitionResultRepository
> {
    constructor(
        @InjectRepository(Entity.COMPETITION_RESULT)
        private readonly competitionResultRepository: CompetitionResultRepository,
    ) {
        super(competitionResultRepository);
    }
}
