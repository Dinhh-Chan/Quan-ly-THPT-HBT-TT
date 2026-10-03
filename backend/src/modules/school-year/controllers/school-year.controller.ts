import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { SchoolYearService } from "@module/school-year/services/school-year.service";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearConditionDto } from "@module/school-year/dto/school-year-condition.dto";
import { CreateSchoolYearDto } from "@module/school-year/dto/create-school-year.dto";
import { UpdateSchoolYearDto } from "@module/school-year/dto/update-school-year.dto";

@Controller("school-year")
@ApiTags("school-year")
export class SchoolYearController extends BaseControllerFactory<SchoolYear>(
    SchoolYear,
    SchoolYearConditionDto,
    CreateSchoolYearDto,
    UpdateSchoolYearDto,
    appControllerConfig(),
) {
    constructor(private readonly schoolYearService: SchoolYearService) {
        super(schoolYearService);
    }
}
