import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { CompetitionWeekService } from "@module/competition-week/services/competition-week.service";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
import { CompetitionWeekConditionDto } from "@module/competition-week/dto/competition-week-condition.dto";
import { CreateCompetitionWeekDto } from "@module/competition-week/dto/create-competition-week.dto";
import { UpdateCompetitionWeekDto } from "@module/competition-week/dto/update-competition-week.dto";

@Controller("competition-week")
@ApiTags("competition-week")
export class CompetitionWeekController extends BaseControllerFactory<CompetitionWeek>(
    CompetitionWeek,
    CompetitionWeekConditionDto,
    CreateCompetitionWeekDto,
    UpdateCompetitionWeekDto,
    appControllerConfig(),
) {
    constructor(
        private readonly competitionWeekService: CompetitionWeekService,
    ) {
        super(competitionWeekService);
    }
}
