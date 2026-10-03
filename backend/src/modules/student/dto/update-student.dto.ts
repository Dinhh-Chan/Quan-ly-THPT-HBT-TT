import { PartialType } from "@nestjs/swagger";
import { CreateStudentDto } from "@module/student/dto/create-student.dto";

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
