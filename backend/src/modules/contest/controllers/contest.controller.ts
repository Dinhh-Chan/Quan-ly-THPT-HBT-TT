import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestService } from "@module/contest/services/contest.service";
import { Contest } from "@module/contest/entities/contest.entity";
import { ContestConditionDto } from "@module/contest/dto/contest-condition.dto";
import { CreateContestDto } from "@module/contest/dto/create-contest.dto";
import { UpdateContestDto } from "@module/contest/dto/update-contest.dto";

@Controller("contest")
@ApiTags("contest")
export class ContestController extends BaseControllerFactory<Contest>(
    Contest,
    ContestConditionDto,
    CreateContestDto,
    UpdateContestDto,
    appControllerConfig(),
) {
    constructor(private readonly contestService: ContestService) {
        super(contestService);
    }
}
