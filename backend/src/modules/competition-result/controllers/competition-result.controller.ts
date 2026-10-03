import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { CompetitionResultService } from "@module/competition-result/services/competition-result.service";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";
import { CompetitionResultConditionDto } from "@module/competition-result/dto/competition-result-condition.dto";
import { CreateCompetitionResultDto } from "@module/competition-result/dto/create-competition-result.dto";
import { UpdateCompetitionResultDto } from "@module/competition-result/dto/update-competition-result.dto";

@Controller("competition-result")
@ApiTags("competition-result")
export class CompetitionResultController extends BaseControllerFactory<CompetitionResult>(
    CompetitionResult,
    CompetitionResultConditionDto,
    CreateCompetitionResultDto,
    UpdateCompetitionResultDto,
    appControllerConfig(),
) {
    constructor(
        private readonly competitionResultService: CompetitionResultService,
    ) {
        super(competitionResultService);
    }
}
