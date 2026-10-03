import { SequelizeModule } from "@nestjs/sequelize";
import { StudentClassHistoryModel } from "@module/student-class-history/models/student-class-history.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { StudentClassHistoryService } from "@module/student-class-history/services/student-class-history.service";
import { StudentClassHistorySqlRepository } from "@module/student-class-history/repositories/student-class-history-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { StudentClassHistoryController } from "@module/student-class-history/controllers/student-class-history.controller";

@Module({
    imports: [SequelizeModule.forFeature([StudentClassHistoryModel])],
    exports: [StudentClassHistoryService],
    providers: [
        StudentClassHistoryService,
        RepositoryProvider(
            Entity.STUDENT_CLASS_HISTORY,
            StudentClassHistorySqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [StudentClassHistoryController],
})
export class StudentClassHistoryModule {}
