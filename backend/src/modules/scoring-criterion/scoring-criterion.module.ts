import { SequelizeModule } from "@nestjs/sequelize";
import { ScoringCriterionModel } from "@module/scoring-criterion/models/scoring-criterion.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ScoringCriterionService } from "@module/scoring-criterion/services/scoring-criterion.service";
import { ScoringCriterionSqlRepository } from "@module/scoring-criterion/repositories/scoring-criterion-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ScoringCriterionController } from "@module/scoring-criterion/controllers/scoring-criterion.controller";

@Module({
    imports: [SequelizeModule.forFeature([ScoringCriterionModel])],
    exports: [ScoringCriterionService],
    providers: [
        ScoringCriterionService,
        RepositoryProvider(
            Entity.SCORING_CRITERION,
            ScoringCriterionSqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ScoringCriterionController],
})
export class ScoringCriterionModule {}
