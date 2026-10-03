import { SequelizeModule } from "@nestjs/sequelize";
import { ViolationModel } from "@module/violation/models/violation.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ViolationService } from "@module/violation/services/violation.service";
import { ViolationSqlRepository } from "@module/violation/repositories/violation-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ViolationController } from "@module/violation/controllers/violation.controller";

@Module({
    imports: [SequelizeModule.forFeature([ViolationModel])],
    exports: [ViolationService],
    providers: [
        ViolationService,
        RepositoryProvider(Entity.VIOLATION, ViolationSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ViolationController],
})
export class ViolationModule {}
