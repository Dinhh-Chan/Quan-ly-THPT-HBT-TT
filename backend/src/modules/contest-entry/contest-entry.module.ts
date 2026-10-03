import { SequelizeModule } from "@nestjs/sequelize";
import { ContestEntryModel } from "@module/contest-entry/models/contest-entry.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ContestEntryService } from "@module/contest-entry/services/contest-entry.service";
import { ContestEntrySqlRepository } from "@module/contest-entry/repositories/contest-entry-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ContestEntryController } from "@module/contest-entry/controllers/contest-entry.controller";

@Module({
    imports: [SequelizeModule.forFeature([ContestEntryModel])],
    exports: [ContestEntryService],
    providers: [
        ContestEntryService,
        RepositoryProvider(Entity.CONTEST_ENTRY, ContestEntrySqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ContestEntryController],
})
export class ContestEntryModule {}
