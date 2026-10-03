import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { IncidentPhotoRepository } from "@module/incident-photo/repositories/incident-photo-repository.interface";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";
import { IncidentPhotoModel } from "@module/incident-photo/models/incident-photo.model";

export class IncidentPhotoSqlRepository
    extends SqlRepository<IncidentPhoto>
    implements IncidentPhotoRepository
{
    constructor(
        @InjectModel(IncidentPhotoModel)
        private readonly incidentPhotoModel: typeof IncidentPhotoModel,
    ) {
        super(incidentPhotoModel);
    }
}
