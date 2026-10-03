import { PartialType } from "@nestjs/swagger";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";

export class IncidentStudentConditionDto extends PartialType(IncidentStudent) {}
