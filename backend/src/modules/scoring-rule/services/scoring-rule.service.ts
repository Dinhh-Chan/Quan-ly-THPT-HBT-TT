import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ScoringRuleRepository } from "@module/scoring-rule/repositories/scoring-rule-repository.interface";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ScoringRuleService extends BaseService<
    ScoringRule,
    ScoringRuleRepository
> {
    constructor(
        @InjectRepository(Entity.SCORING_RULE)
        private readonly scoringRuleRepository: ScoringRuleRepository,
    ) {
        super(scoringRuleRepository);
    }
}
