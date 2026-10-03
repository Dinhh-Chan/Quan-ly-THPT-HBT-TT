import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { AbsenceRepository } from "@module/absence/repositories/absence-repository.interface";
import { Absence } from "@module/absence/entities/absence.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class AbsenceService extends BaseService<Absence, AbsenceRepository> {
    constructor(
        @InjectRepository(Entity.ABSENCE)
        private readonly absenceRepository: AbsenceRepository,
    ) {
        super(absenceRepository);
    }
}
