import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ComplaintRepository } from "@module/complaint/repositories/complaint-repository.interface";
import { Complaint } from "@module/complaint/entities/complaint.entity";
import { ComplaintModel } from "@module/complaint/models/complaint.model";

export class ComplaintSqlRepository
    extends SqlRepository<Complaint>
    implements ComplaintRepository
{
    constructor(
        @InjectModel(ComplaintModel)
        private readonly complaintModel: typeof ComplaintModel,
    ) {
        super(complaintModel);
    }
}
