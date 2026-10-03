import { SequelizeModule } from "@nestjs/sequelize";
import { CompetitionResultModel } from "@module/competition-result/models/competition-result.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { CompetitionResultService } from "@module/competition-result/services/competition-result.service";
import { CompetitionResultSqlRepository } from "@module/competition-result/repositories/competition-result-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { CompetitionResultController } from "@module/competition-result/controllers/competition-result.controller";

@Module({
    imports: [SequelizeModule.forFeature([CompetitionResultModel])],
    exports: [CompetitionResultService],
    providers: [
        CompetitionResultService,
        RepositoryProvider(
            Entity.COMPETITION_RESULT,
            CompetitionResultSqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [CompetitionResultController],
})
export class CompetitionResultModule {}
