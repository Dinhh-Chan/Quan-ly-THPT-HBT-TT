import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ScoringCriterionRepository } from "@module/scoring-criterion/repositories/scoring-criterion-repository.interface";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";
import { ScoringCriterionModel } from "@module/scoring-criterion/models/scoring-criterion.model";

export class ScoringCriterionSqlRepository
    extends SqlRepository<ScoringCriterion>
    implements ScoringCriterionRepository
{
    constructor(
        @InjectModel(ScoringCriterionModel)
        private readonly scoringCriterionModel: typeof ScoringCriterionModel,
    ) {
        super(scoringCriterionModel);
    }
}
