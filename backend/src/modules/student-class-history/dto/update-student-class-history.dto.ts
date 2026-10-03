import { PartialType } from "@nestjs/swagger";
import { CreateStudentClassHistoryDto } from "@module/student-class-history/dto/create-student-class-history.dto";

export class UpdateStudentClassHistoryDto extends PartialType(
    CreateStudentClassHistoryDto,
) {}
