import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";

export interface ScoringCriterionRepository
    extends BaseRepository<ScoringCriterion> {}
