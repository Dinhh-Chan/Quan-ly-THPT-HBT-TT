import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { AbsenceService } from "@module/absence/services/absence.service";
import { Absence } from "@module/absence/entities/absence.entity";
import { AbsenceConditionDto } from "@module/absence/dto/absence-condition.dto";
import { CreateAbsenceDto } from "@module/absence/dto/create-absence.dto";
import { UpdateAbsenceDto } from "@module/absence/dto/update-absence.dto";

@Controller("absence")
@ApiTags("absence")
export class AbsenceController extends BaseControllerFactory<Absence>(
    Absence,
    AbsenceConditionDto,
    CreateAbsenceDto,
    UpdateAbsenceDto,
    appControllerConfig(),
) {
    constructor(private readonly absenceService: AbsenceService) {
        super(absenceService);
    }
}
