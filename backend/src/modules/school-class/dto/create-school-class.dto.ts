import { OmitType } from "@nestjs/swagger";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";

export class CreateSchoolClassDto extends OmitType(SchoolClass, ["_id"]) {}
