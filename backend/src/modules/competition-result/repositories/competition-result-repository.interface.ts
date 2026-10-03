import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";

export interface CompetitionResultRepository
    extends BaseRepository<CompetitionResult> {}
