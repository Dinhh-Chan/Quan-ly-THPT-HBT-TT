import { OmitType } from "@nestjs/swagger";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";

export class CreateSchoolYearDto extends OmitType(SchoolYear, ["_id"]) {}
