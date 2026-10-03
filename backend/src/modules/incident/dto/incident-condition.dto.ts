import { PartialType } from "@nestjs/swagger";
import { Incident } from "@module/incident/entities/incident.entity";

export class IncidentConditionDto extends PartialType(Incident) {}
