import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Violation } from "@module/violation/entities/violation.entity";

export interface ViolationRepository extends BaseRepository<Violation> {}
