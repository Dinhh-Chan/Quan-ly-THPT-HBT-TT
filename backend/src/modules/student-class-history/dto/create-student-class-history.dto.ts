import { OmitType } from "@nestjs/swagger";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";

export class CreateStudentClassHistoryDto extends OmitType(
    StudentClassHistory,
    ["_id"],
) {}
