import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { IncidentRepository } from "@module/incident/repositories/incident-repository.interface";
import { Incident } from "@module/incident/entities/incident.entity";
import { IncidentModel } from "@module/incident/models/incident.model";

export class IncidentSqlRepository
    extends SqlRepository<Incident>
    implements IncidentRepository
{
    constructor(
        @InjectModel(IncidentModel)
        private readonly incidentModel: typeof IncidentModel,
    ) {
        super(incidentModel);
    }
}
