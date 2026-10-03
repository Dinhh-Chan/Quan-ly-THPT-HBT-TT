import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { IncidentStudentRepository } from "@module/incident-student/repositories/incident-student-repository.interface";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";
import { IncidentStudentModel } from "@module/incident-student/models/incident-student.model";

export class IncidentStudentSqlRepository
    extends SqlRepository<IncidentStudent>
    implements IncidentStudentRepository
{
    constructor(
        @InjectModel(IncidentStudentModel)
        private readonly incidentStudentModel: typeof IncidentStudentModel,
    ) {
        super(incidentStudentModel);
    }
}
