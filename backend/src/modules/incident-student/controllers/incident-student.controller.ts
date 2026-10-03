import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { IncidentStudentService } from "@module/incident-student/services/incident-student.service";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";
import { IncidentStudentConditionDto } from "@module/incident-student/dto/incident-student-condition.dto";
import { CreateIncidentStudentDto } from "@module/incident-student/dto/create-incident-student.dto";
import { UpdateIncidentStudentDto } from "@module/incident-student/dto/update-incident-student.dto";

@Controller("incident-student")
@ApiTags("incident-student")
export class IncidentStudentController extends BaseControllerFactory<IncidentStudent>(
    IncidentStudent,
    IncidentStudentConditionDto,
    CreateIncidentStudentDto,
    UpdateIncidentStudentDto,
    appControllerConfig(),
) {
    constructor(
        private readonly incidentStudentService: IncidentStudentService,
    ) {
        super(incidentStudentService);
    }
}
