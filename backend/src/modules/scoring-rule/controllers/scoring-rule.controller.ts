import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ScoringRuleService } from "@module/scoring-rule/services/scoring-rule.service";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { ScoringRuleConditionDto } from "@module/scoring-rule/dto/scoring-rule-condition.dto";
import { CreateScoringRuleDto } from "@module/scoring-rule/dto/create-scoring-rule.dto";
import { UpdateScoringRuleDto } from "@module/scoring-rule/dto/update-scoring-rule.dto";

@Controller("scoring-rule")
@ApiTags("scoring-rule")
export class ScoringRuleController extends BaseControllerFactory<ScoringRule>(
    ScoringRule,
    ScoringRuleConditionDto,
    CreateScoringRuleDto,
    UpdateScoringRuleDto,
    appControllerConfig(),
) {
    constructor(private readonly scoringRuleService: ScoringRuleService) {
        super(scoringRuleService);
    }
}
