import { OmitType } from "@nestjs/swagger";
import { Student } from "@module/student/entities/student.entity";

export class CreateStudentDto extends OmitType(Student, ["_id"]) {}
