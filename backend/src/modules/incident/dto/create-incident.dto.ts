import { OmitType } from "@nestjs/swagger";
import { Incident } from "@module/incident/entities/incident.entity";

export class CreateIncidentDto extends OmitType(Incident, ["_id"]) {}
