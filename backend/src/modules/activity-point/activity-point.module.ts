import { SequelizeModule } from "@nestjs/sequelize";
import { ActivityPointModel } from "@module/activity-point/models/activity-point.model";
import { Module } from "@nestjs/common";
import { ContestModule } from "@module/contest/contest.module";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ActivityPointService } from "@module/activity-point/services/activity-point.service";
import { ActivityPointSqlRepository } from "@module/activity-point/repositories/activity-point-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ActivityPointController } from "@module/activity-point/controllers/activity-point.controller";

@Module({
    imports: [SequelizeModule.forFeature([ActivityPointModel]), ContestModule],
    exports: [ActivityPointService],
    providers: [
        ActivityPointService,
        RepositoryProvider(Entity.ACTIVITY_POINT, ActivityPointSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ActivityPointController],
})
export class ActivityPointModule {}
