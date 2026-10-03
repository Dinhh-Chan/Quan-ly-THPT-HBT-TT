import { PartialType } from "@nestjs/swagger";
import { Violation } from "@module/violation/entities/violation.entity";

export class ViolationConditionDto extends PartialType(Violation) {}
