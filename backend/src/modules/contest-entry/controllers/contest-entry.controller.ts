import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestEntryService } from "@module/contest-entry/services/contest-entry.service";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";
import { ContestEntryConditionDto } from "@module/contest-entry/dto/contest-entry-condition.dto";
import { CreateContestEntryDto } from "@module/contest-entry/dto/create-contest-entry.dto";
import { UpdateContestEntryDto } from "@module/contest-entry/dto/update-contest-entry.dto";

@Controller("contest-entry")
@ApiTags("contest-entry")
export class ContestEntryController extends BaseControllerFactory<ContestEntry>(
    ContestEntry,
    ContestEntryConditionDto,
    CreateContestEntryDto,
    UpdateContestEntryDto,
    appControllerConfig(),
) {
    constructor(private readonly contestEntryService: ContestEntryService) {
        super(contestEntryService);
    }
}
