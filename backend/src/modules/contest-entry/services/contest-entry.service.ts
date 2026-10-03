import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ContestEntryRepository } from "@module/contest-entry/repositories/contest-entry-repository.interface";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ContestEntryService extends BaseService<
    ContestEntry,
    ContestEntryRepository
> {
    constructor(
        @InjectRepository(Entity.CONTEST_ENTRY)
        private readonly contestEntryRepository: ContestEntryRepository,
    ) {
        super(contestEntryRepository);
    }
}
