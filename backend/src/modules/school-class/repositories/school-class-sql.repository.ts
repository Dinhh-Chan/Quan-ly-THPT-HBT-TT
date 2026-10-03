import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { SchoolClassRepository } from "@module/school-class/repositories/school-class-repository.interface";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";

export class SchoolClassSqlRepository
    extends SqlRepository<SchoolClass>
    implements SchoolClassRepository
{
    constructor(
        @InjectModel(SchoolClassModel)
        private readonly schoolClassModel: typeof SchoolClassModel,
    ) {
        super(schoolClassModel);
    }
}
