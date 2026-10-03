import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ScoringCriterionService } from "@module/scoring-criterion/services/scoring-criterion.service";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";
import { ScoringCriterionConditionDto } from "@module/scoring-criterion/dto/scoring-criterion-condition.dto";
import { CreateScoringCriterionDto } from "@module/scoring-criterion/dto/create-scoring-criterion.dto";
import { UpdateScoringCriterionDto } from "@module/scoring-criterion/dto/update-scoring-criterion.dto";

@Controller("scoring-criterion")
@ApiTags("scoring-criterion")
export class ScoringCriterionController extends BaseControllerFactory<ScoringCriterion>(
    ScoringCriterion,
    ScoringCriterionConditionDto,
    CreateScoringCriterionDto,
    UpdateScoringCriterionDto,
    appControllerConfig(),
) {
    constructor(
        private readonly scoringCriterionService: ScoringCriterionService,
    ) {
        super(scoringCriterionService);
    }
}
