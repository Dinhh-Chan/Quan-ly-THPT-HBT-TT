import { PartialType } from "@nestjs/swagger";
import { CreateComplaintDto } from "@module/complaint/dto/create-complaint.dto";

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {}
