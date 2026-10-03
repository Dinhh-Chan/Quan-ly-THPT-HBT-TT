import { SequelizeModule } from "@nestjs/sequelize";
import { AbsenceModel } from "@module/absence/models/absence.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { AbsenceService } from "@module/absence/services/absence.service";
import { AbsenceSqlRepository } from "@module/absence/repositories/absence-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { AbsenceController } from "@module/absence/controllers/absence.controller";

@Module({
    imports: [SequelizeModule.forFeature([AbsenceModel])],
    exports: [AbsenceService],
    providers: [
        AbsenceService,
        RepositoryProvider(Entity.ABSENCE, AbsenceSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [AbsenceController],
})
export class AbsenceModule {}
