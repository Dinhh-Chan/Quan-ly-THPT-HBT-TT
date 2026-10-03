import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { IncidentStudentRepository } from "@module/incident-student/repositories/incident-student-repository.interface";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class IncidentStudentService extends BaseService<
    IncidentStudent,
    IncidentStudentRepository
> {
    constructor(
        @InjectRepository(Entity.INCIDENT_STUDENT)
        private readonly incidentStudentRepository: IncidentStudentRepository,
    ) {
        super(incidentStudentRepository);
    }
}
