import { SequelizeModule } from "@nestjs/sequelize";
import { CompetitionWeekModel } from "@module/competition-week/models/competition-week.model";
import { Module } from "@nestjs/common";
import { SchoolClassModule } from "@module/school-class/school-class.module";
import { ScoringCriterionModule } from "@module/scoring-criterion/scoring-criterion.module";
import { ScoringRuleModule } from "@module/scoring-rule/scoring-rule.module";
import { CompetitionResultModule } from "@module/competition-result/competition-result.module";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { CompetitionWeekService } from "@module/competition-week/services/competition-week.service";
import { CompetitionWeekSqlRepository } from "@module/competition-week/repositories/competition-week-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { CompetitionWeekController } from "@module/competition-week/controllers/competition-week.controller";

@Module({
    imports: [
        SequelizeModule.forFeature([CompetitionWeekModel]),
        CompetitionResultModule,
        ScoringRuleModule,
        ScoringCriterionModule,
        SchoolClassModule,
    ],
    exports: [CompetitionWeekService],
    providers: [
        CompetitionWeekService,
        RepositoryProvider(
            Entity.COMPETITION_WEEK,
            CompetitionWeekSqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [CompetitionWeekController],
})
export class CompetitionWeekModule {}
