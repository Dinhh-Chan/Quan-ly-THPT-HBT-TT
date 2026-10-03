import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Complaint } from "@module/complaint/entities/complaint.entity";

export interface ComplaintRepository extends BaseRepository<Complaint> {}
