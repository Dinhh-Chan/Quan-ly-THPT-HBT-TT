import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { IncidentPhotoService } from "@module/incident-photo/services/incident-photo.service";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";
import { IncidentPhotoConditionDto } from "@module/incident-photo/dto/incident-photo-condition.dto";
import { CreateIncidentPhotoDto } from "@module/incident-photo/dto/create-incident-photo.dto";
import { UpdateIncidentPhotoDto } from "@module/incident-photo/dto/update-incident-photo.dto";

@Controller("incident-photo")
@ApiTags("incident-photo")
export class IncidentPhotoController extends BaseControllerFactory<IncidentPhoto>(
    IncidentPhoto,
    IncidentPhotoConditionDto,
    CreateIncidentPhotoDto,
    UpdateIncidentPhotoDto,
    appControllerConfig(),
) {
    constructor(private readonly incidentPhotoService: IncidentPhotoService) {
        super(incidentPhotoService);
    }
}
