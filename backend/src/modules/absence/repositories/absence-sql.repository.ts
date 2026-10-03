import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { AbsenceRepository } from "@module/absence/repositories/absence-repository.interface";
import { Absence } from "@module/absence/entities/absence.entity";
import { AbsenceModel } from "@module/absence/models/absence.model";

export class AbsenceSqlRepository
    extends SqlRepository<Absence>
    implements AbsenceRepository
{
    constructor(
        @InjectModel(AbsenceModel)
        private readonly absenceModel: typeof AbsenceModel,
    ) {
        super(absenceModel);
    }
}
