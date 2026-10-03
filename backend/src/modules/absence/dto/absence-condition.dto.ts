import { PartialType } from "@nestjs/swagger";
import { Absence } from "@module/absence/entities/absence.entity";

export class AbsenceConditionDto extends PartialType(Absence) {}
