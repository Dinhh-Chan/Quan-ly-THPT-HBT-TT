import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ScoringCriterionRepository } from "@module/scoring-criterion/repositories/scoring-criterion-repository.interface";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ScoringCriterionService extends BaseService<
    ScoringCriterion,
    ScoringCriterionRepository
> {
    constructor(
        @InjectRepository(Entity.SCORING_CRITERION)
        private readonly scoringCriterionRepository: ScoringCriterionRepository,
    ) {
        super(scoringCriterionRepository);
    }
}
