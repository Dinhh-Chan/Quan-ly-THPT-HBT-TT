import { PartialType } from "@nestjs/swagger";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";

export class SchoolClassConditionDto extends PartialType(SchoolClass) {}
