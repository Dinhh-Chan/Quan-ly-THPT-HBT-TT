import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { SchoolYearRepository } from "@module/school-year/repositories/school-year-repository.interface";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";

export class SchoolYearSqlRepository
    extends SqlRepository<SchoolYear>
    implements SchoolYearRepository
{
    constructor(
        @InjectModel(SchoolYearModel)
        private readonly schoolYearModel: typeof SchoolYearModel,
    ) {
        super(schoolYearModel);
    }
}
