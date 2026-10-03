import { SequelizeModule } from "@nestjs/sequelize";
import { ContestModel } from "@module/contest/models/contest.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ContestService } from "@module/contest/services/contest.service";
import { ContestSqlRepository } from "@module/contest/repositories/contest-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ContestController } from "@module/contest/controllers/contest.controller";

@Module({
    imports: [SequelizeModule.forFeature([ContestModel])],
    exports: [ContestService],
    providers: [
        ContestService,
        RepositoryProvider(Entity.CONTEST, ContestSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ContestController],
})
export class ContestModule {}
