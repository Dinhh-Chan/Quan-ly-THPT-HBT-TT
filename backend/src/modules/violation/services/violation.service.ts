import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ViolationRepository } from "@module/violation/repositories/violation-repository.interface";
import { Violation } from "@module/violation/entities/violation.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ViolationService extends BaseService<
    Violation,
    ViolationRepository
> {
    constructor(
        @InjectRepository(Entity.VIOLATION)
        private readonly violationRepository: ViolationRepository,
    ) {
        super(violationRepository);
    }
}
