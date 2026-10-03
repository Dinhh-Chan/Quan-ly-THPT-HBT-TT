import { PartialType } from "@nestjs/swagger";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";

export class SchoolYearConditionDto extends PartialType(SchoolYear) {}
