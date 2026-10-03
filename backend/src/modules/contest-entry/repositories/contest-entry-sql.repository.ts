import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ContestEntryRepository } from "@module/contest-entry/repositories/contest-entry-repository.interface";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";
import { ContestEntryModel } from "@module/contest-entry/models/contest-entry.model";

export class ContestEntrySqlRepository
    extends SqlRepository<ContestEntry>
    implements ContestEntryRepository
{
    constructor(
        @InjectModel(ContestEntryModel)
        private readonly contestEntryModel: typeof ContestEntryModel,
    ) {
        super(contestEntryModel);
    }
}
