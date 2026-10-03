import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { CompetitionResultRepository } from "@module/competition-result/repositories/competition-result-repository.interface";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";
import { CompetitionResultModel } from "@module/competition-result/models/competition-result.model";

export class CompetitionResultSqlRepository
    extends SqlRepository<CompetitionResult>
    implements CompetitionResultRepository
{
    constructor(
        @InjectModel(CompetitionResultModel)
        private readonly competitionResultModel: typeof CompetitionResultModel,
    ) {
        super(competitionResultModel);
    }
}
