import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ContestRepository } from "@module/contest/repositories/contest-repository.interface";
import { Contest } from "@module/contest/entities/contest.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ContestService extends BaseService<Contest, ContestRepository> {
    constructor(
        @InjectRepository(Entity.CONTEST)
        private readonly contestRepository: ContestRepository,
    ) {
        super(contestRepository);
    }
}
