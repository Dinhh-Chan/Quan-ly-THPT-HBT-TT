import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ComplaintService } from "@module/complaint/services/complaint.service";
import { Complaint } from "@module/complaint/entities/complaint.entity";
import { ComplaintConditionDto } from "@module/complaint/dto/complaint-condition.dto";
import { CreateComplaintDto } from "@module/complaint/dto/create-complaint.dto";
import { UpdateComplaintDto } from "@module/complaint/dto/update-complaint.dto";

@Controller("complaint")
@ApiTags("complaint")
export class ComplaintController extends BaseControllerFactory<Complaint>(
    Complaint,
    ComplaintConditionDto,
    CreateComplaintDto,
    UpdateComplaintDto,
    appControllerConfig(),
) {
    constructor(private readonly complaintService: ComplaintService) {
        super(complaintService);
    }
}
