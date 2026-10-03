import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ComplaintRepository } from "@module/complaint/repositories/complaint-repository.interface";
import { Complaint } from "@module/complaint/entities/complaint.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ComplaintService extends BaseService<
    Complaint,
    ComplaintRepository
> {
    constructor(
        @InjectRepository(Entity.COMPLAINT)
        private readonly complaintRepository: ComplaintRepository,
    ) {
        super(complaintRepository);
    }
}
