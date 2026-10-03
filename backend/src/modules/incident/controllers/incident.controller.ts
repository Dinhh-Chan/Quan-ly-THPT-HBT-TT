import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { IncidentService } from "@module/incident/services/incident.service";
import { Incident } from "@module/incident/entities/incident.entity";
import { IncidentConditionDto } from "@module/incident/dto/incident-condition.dto";
import { CreateIncidentDto } from "@module/incident/dto/create-incident.dto";
import { UpdateIncidentDto } from "@module/incident/dto/update-incident.dto";

@Controller("incident")
@ApiTags("incident")
export class IncidentController extends BaseControllerFactory<Incident>(
    Incident,
    IncidentConditionDto,
    CreateIncidentDto,
    UpdateIncidentDto,
    appControllerConfig(),
) {
    constructor(private readonly incidentService: IncidentService) {
        super(incidentService);
    }
}
