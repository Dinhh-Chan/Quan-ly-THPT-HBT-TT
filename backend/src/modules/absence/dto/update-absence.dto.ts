import { PartialType } from "@nestjs/swagger";
import { CreateAbsenceDto } from "@module/absence/dto/create-absence.dto";

export class UpdateAbsenceDto extends PartialType(CreateAbsenceDto) {}
