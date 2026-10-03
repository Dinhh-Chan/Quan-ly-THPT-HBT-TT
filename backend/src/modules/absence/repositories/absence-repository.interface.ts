import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Absence } from "@module/absence/entities/absence.entity";

export interface AbsenceRepository extends BaseRepository<Absence> {}
