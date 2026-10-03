import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { IncidentPhotoRepository } from "@module/incident-photo/repositories/incident-photo-repository.interface";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class IncidentPhotoService extends BaseService<
    IncidentPhoto,
    IncidentPhotoRepository
> {
    constructor(
        @InjectRepository(Entity.INCIDENT_PHOTO)
        private readonly incidentPhotoRepository: IncidentPhotoRepository,
    ) {
        super(incidentPhotoRepository);
    }
}
