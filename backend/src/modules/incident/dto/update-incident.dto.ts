import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateIncidentDto } from "@module/incident/dto/create-incident.dto";

export class UpdateIncidentDto extends PartialType(
    OmitType(CreateIncidentDto, ["students", "photos"]),
) {}
