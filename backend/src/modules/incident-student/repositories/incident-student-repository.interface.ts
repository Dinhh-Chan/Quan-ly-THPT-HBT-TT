import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";

export interface IncidentStudentRepository
    extends BaseRepository<IncidentStudent> {}
