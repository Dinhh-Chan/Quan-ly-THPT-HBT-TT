import { PartialType } from "@nestjs/swagger";
import { CreateSchoolClassDto } from "@module/school-class/dto/create-school-class.dto";

export class UpdateSchoolClassDto extends PartialType(CreateSchoolClassDto) {}
