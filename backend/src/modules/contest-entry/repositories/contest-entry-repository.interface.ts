import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";

export interface ContestEntryRepository extends BaseRepository<ContestEntry> {}
