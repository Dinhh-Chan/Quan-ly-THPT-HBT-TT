import { SequelizeModule } from "@nestjs/sequelize";
import { IncidentModel } from "@module/incident/models/incident.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { IncidentService } from "@module/incident/services/incident.service";
import { IncidentSqlRepository } from "@module/incident/repositories/incident-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { IncidentController } from "@module/incident/controllers/incident.controller";
import { IncidentStudentModule } from "@module/incident-student/incident-student.module";
import { IncidentPhotoModule } from "@module/incident-photo/incident-photo.module";
import { FileModule } from "@module/file/file.module";

@Module({
    imports: [
        SequelizeModule.forFeature([IncidentModel]),
        IncidentStudentModule,
        IncidentPhotoModule,
        FileModule,
    ],
    exports: [IncidentService],
    providers: [
        IncidentService,
        RepositoryProvider(Entity.INCIDENT, IncidentSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [IncidentController],
})
export class IncidentModule {}
