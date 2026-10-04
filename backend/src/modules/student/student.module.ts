import { SequelizeModule } from "@nestjs/sequelize";
import { StudentModel } from "@module/student/models/student.model";
import { Module } from "@nestjs/common";
import { StudentClassHistoryModule } from "@module/student-class-history/student-class-history.module";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { StudentService } from "@module/student/services/student.service";
import { StudentSqlRepository } from "@module/student/repositories/student-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { StudentController } from "@module/student/controllers/student.controller";

@Module({
    imports: [
        SequelizeModule.forFeature([StudentModel]),
        StudentClassHistoryModule,
    ],
    exports: [StudentService],
    providers: [
        StudentService,
        RepositoryProvider(Entity.STUDENT, StudentSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [StudentController],
})
export class StudentModule {}
