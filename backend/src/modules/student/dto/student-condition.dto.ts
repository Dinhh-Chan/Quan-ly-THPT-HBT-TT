import { PartialType } from "@nestjs/swagger";
import { Student } from "@module/student/entities/student.entity";

export class StudentConditionDto extends PartialType(Student) {}
