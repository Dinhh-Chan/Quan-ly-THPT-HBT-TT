import { PartialType } from "@nestjs/swagger";
import { CreateViolationDto } from "@module/violation/dto/create-violation.dto";

export class UpdateViolationDto extends PartialType(CreateViolationDto) {}
