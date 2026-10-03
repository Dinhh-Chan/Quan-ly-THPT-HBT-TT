import { PartialType } from "@nestjs/swagger";
import { CreateIncidentStudentDto } from "@module/incident-student/dto/create-incident-student.dto";

export class UpdateIncidentStudentDto extends PartialType(
    CreateIncidentStudentDto,
) {}
