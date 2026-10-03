import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";

export interface ScoringRuleRepository extends BaseRepository<ScoringRule> {}
