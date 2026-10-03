import { OmitType } from "@nestjs/swagger";
import { Violation } from "@module/violation/entities/violation.entity";

export class CreateViolationDto extends OmitType(Violation, ["_id"]) {}
