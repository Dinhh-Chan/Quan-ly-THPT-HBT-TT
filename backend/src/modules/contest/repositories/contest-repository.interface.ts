import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Contest } from "@module/contest/entities/contest.entity";

export interface ContestRepository extends BaseRepository<Contest> {}
