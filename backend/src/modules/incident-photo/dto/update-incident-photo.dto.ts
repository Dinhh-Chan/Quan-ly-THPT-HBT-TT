import { PartialType } from "@nestjs/swagger";
import { CreateIncidentPhotoDto } from "@module/incident-photo/dto/create-incident-photo.dto";

export class UpdateIncidentPhotoDto extends PartialType(
    CreateIncidentPhotoDto,
) {}
