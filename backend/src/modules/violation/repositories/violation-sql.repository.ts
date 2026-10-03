import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ViolationRepository } from "@module/violation/repositories/violation-repository.interface";
import { Violation } from "@module/violation/entities/violation.entity";
import { ViolationModel } from "@module/violation/models/violation.model";

export class ViolationSqlRepository
    extends SqlRepository<Violation>
    implements ViolationRepository
{
    constructor(
        @InjectModel(ViolationModel)
        private readonly violationModel: typeof ViolationModel,
    ) {
        super(violationModel);
    }
}
