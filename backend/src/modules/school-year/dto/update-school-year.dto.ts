import { PartialType } from "@nestjs/swagger";
import { CreateSchoolYearDto } from "@module/school-year/dto/create-school-year.dto";

export class UpdateSchoolYearDto extends PartialType(CreateSchoolYearDto) {}
