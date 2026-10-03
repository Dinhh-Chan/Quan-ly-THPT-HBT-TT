import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { IncidentRepository } from "@module/incident/repositories/incident-repository.interface";
import { Incident } from "@module/incident/entities/incident.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class IncidentService extends BaseService<Incident, IncidentRepository> {
    constructor(
        @InjectRepository(Entity.INCIDENT)
        private readonly incidentRepository: IncidentRepository,
    ) {
        super(incidentRepository);
    }
}
