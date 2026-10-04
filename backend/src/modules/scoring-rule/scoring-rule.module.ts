import { SequelizeModule } from "@nestjs/sequelize";
import { ScoringRuleModel } from "@module/scoring-rule/models/scoring-rule.model";
import { Module } from "@nestjs/common";
import { SchoolYearModule } from "@module/school-year/school-year.module";
import { ScoringCriterionModule } from "@module/scoring-criterion/scoring-criterion.module";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ScoringRuleService } from "@module/scoring-rule/services/scoring-rule.service";
import { ScoringRuleSqlRepository } from "@module/scoring-rule/repositories/scoring-rule-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ScoringRuleController } from "@module/scoring-rule/controllers/scoring-rule.controller";

@Module({
    imports: [
        SequelizeModule.forFeature([ScoringRuleModel]),
        ScoringCriterionModule,
        SchoolYearModule,
    ],
    exports: [ScoringRuleService],
    providers: [
        ScoringRuleService,
        RepositoryProvider(Entity.SCORING_RULE, ScoringRuleSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ScoringRuleController],
})
export class ScoringRuleModule {}
