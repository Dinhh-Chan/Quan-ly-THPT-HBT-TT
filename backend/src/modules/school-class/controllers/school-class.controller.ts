import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { SchoolClassService } from "@module/school-class/services/school-class.service";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassConditionDto } from "@module/school-class/dto/school-class-condition.dto";
import { CreateSchoolClassDto } from "@module/school-class/dto/create-school-class.dto";
import { UpdateSchoolClassDto } from "@module/school-class/dto/update-school-class.dto";

@Controller("school-class")
@ApiTags("school-class")
export class SchoolClassController extends BaseControllerFactory<SchoolClass>(
    SchoolClass,
    SchoolClassConditionDto,
    CreateSchoolClassDto,
    UpdateSchoolClassDto,
    appControllerConfig(),
) {
    constructor(private readonly schoolClassService: SchoolClassService) {
        super(schoolClassService);
    }
}
