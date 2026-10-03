import { SequelizeModule } from "@nestjs/sequelize";
import { IncidentPhotoModel } from "@module/incident-photo/models/incident-photo.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { IncidentPhotoService } from "@module/incident-photo/services/incident-photo.service";
import { IncidentPhotoSqlRepository } from "@module/incident-photo/repositories/incident-photo-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { IncidentPhotoController } from "@module/incident-photo/controllers/incident-photo.controller";

@Module({
    imports: [SequelizeModule.forFeature([IncidentPhotoModel])],
    exports: [IncidentPhotoService],
    providers: [
        IncidentPhotoService,
        RepositoryProvider(Entity.INCIDENT_PHOTO, IncidentPhotoSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [IncidentPhotoController],
})
export class IncidentPhotoModule {}
