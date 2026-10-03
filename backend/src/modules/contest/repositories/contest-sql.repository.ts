import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ContestRepository } from "@module/contest/repositories/contest-repository.interface";
import { Contest } from "@module/contest/entities/contest.entity";
import { ContestModel } from "@module/contest/models/contest.model";

export class ContestSqlRepository
    extends SqlRepository<Contest>
    implements ContestRepository
{
    constructor(
        @InjectModel(ContestModel)
        private readonly contestModel: typeof ContestModel,
    ) {
        super(contestModel);
    }
}
