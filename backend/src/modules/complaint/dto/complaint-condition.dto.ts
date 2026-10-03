import { PartialType } from "@nestjs/swagger";
import { Complaint } from "@module/complaint/entities/complaint.entity";

export class ComplaintConditionDto extends PartialType(Complaint) {}
