import { SequelizeModule } from "@nestjs/sequelize";
import { ComplaintModel } from "@module/complaint/models/complaint.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { ComplaintService } from "@module/complaint/services/complaint.service";
import { ComplaintSqlRepository } from "@module/complaint/repositories/complaint-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { ComplaintController } from "@module/complaint/controllers/complaint.controller";

@Module({
    imports: [SequelizeModule.forFeature([ComplaintModel])],
    exports: [ComplaintService],
    providers: [
        ComplaintService,
        RepositoryProvider(Entity.COMPLAINT, ComplaintSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [ComplaintController],
})
export class ComplaintModule {}
