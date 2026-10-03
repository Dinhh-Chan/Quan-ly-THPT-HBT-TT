import { OmitType } from "@nestjs/swagger";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";

export class CreateIncidentPhotoDto extends OmitType(IncidentPhoto, ["_id"]) {}
