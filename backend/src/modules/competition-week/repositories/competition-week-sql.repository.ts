import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { CompetitionWeekRepository } from "@module/competition-week/repositories/competition-week-repository.interface";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
import { CompetitionWeekModel } from "@module/competition-week/models/competition-week.model";

export class CompetitionWeekSqlRepository
    extends SqlRepository<CompetitionWeek>
    implements CompetitionWeekRepository
{
    constructor(
        @InjectModel(CompetitionWeekModel)
        private readonly competitionWeekModel: typeof CompetitionWeekModel,
    ) {
        super(competitionWeekModel);
    }
}
