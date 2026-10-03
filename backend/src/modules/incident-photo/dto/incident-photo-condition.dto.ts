import { PartialType } from "@nestjs/swagger";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";

export class IncidentPhotoConditionDto extends PartialType(IncidentPhoto) {}
