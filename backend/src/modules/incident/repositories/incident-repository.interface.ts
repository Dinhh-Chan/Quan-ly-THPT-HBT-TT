import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Incident } from "@module/incident/entities/incident.entity";

export interface IncidentRepository extends BaseRepository<Incident> {}
