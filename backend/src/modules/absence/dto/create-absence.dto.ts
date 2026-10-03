import { OmitType } from "@nestjs/swagger";
import { Absence } from "@module/absence/entities/absence.entity";

export class CreateAbsenceDto extends OmitType(Absence, ["_id"]) {}
