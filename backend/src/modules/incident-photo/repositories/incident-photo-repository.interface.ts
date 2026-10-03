import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";

export interface IncidentPhotoRepository
    extends BaseRepository<IncidentPhoto> {}
