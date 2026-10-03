import { OmitType } from "@nestjs/swagger";
import { Complaint } from "@module/complaint/entities/complaint.entity";

export class CreateComplaintDto extends OmitType(Complaint, ["_id"]) {}
