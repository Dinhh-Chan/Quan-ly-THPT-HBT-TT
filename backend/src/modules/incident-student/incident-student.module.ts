import { SequelizeModule } from "@nestjs/sequelize";
import { IncidentStudentModel } from "@module/incident-student/models/incident-student.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { IncidentStudentService } from "@module/incident-student/services/incident-student.service";
import { IncidentStudentSqlRepository } from "@module/incident-student/repositories/incident-student-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { IncidentStudentController } from "@module/incident-student/controllers/incident-student.controller";

@Module({
    imports: [SequelizeModule.forFeature([IncidentStudentModel])],
    exports: [IncidentStudentService],
    providers: [
        IncidentStudentService,
        RepositoryProvider(
            Entity.INCIDENT_STUDENT,
            IncidentStudentSqlRepository,
        ),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [IncidentStudentController],
})
export class IncidentStudentModule {}
