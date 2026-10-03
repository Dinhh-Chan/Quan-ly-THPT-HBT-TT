import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ScoringRuleRepository } from "@module/scoring-rule/repositories/scoring-rule-repository.interface";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { ScoringRuleModel } from "@module/scoring-rule/models/scoring-rule.model";

export class ScoringRuleSqlRepository
    extends SqlRepository<ScoringRule>
    implements ScoringRuleRepository
{
    constructor(
        @InjectModel(ScoringRuleModel)
        private readonly scoringRuleModel: typeof ScoringRuleModel,
    ) {
        super(scoringRuleModel);
    }
}
