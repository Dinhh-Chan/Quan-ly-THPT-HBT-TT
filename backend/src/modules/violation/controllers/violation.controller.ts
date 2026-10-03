import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ViolationService } from "@module/violation/services/violation.service";
import { Violation } from "@module/violation/entities/violation.entity";
import { ViolationConditionDto } from "@module/violation/dto/violation-condition.dto";
import { CreateViolationDto } from "@module/violation/dto/create-violation.dto";
import { UpdateViolationDto } from "@module/violation/dto/update-violation.dto";

@Controller("violation")
@ApiTags("violation")
export class ViolationController extends BaseControllerFactory<Violation>(
    Violation,
    ViolationConditionDto,
    CreateViolationDto,
    UpdateViolationDto,
    appControllerConfig(),
) {
    constructor(private readonly violationService: ViolationService) {
        super(violationService);
    }
}
