import { PartialType } from "@nestjs/swagger";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";

export class StudentClassHistoryConditionDto extends PartialType(
    StudentClassHistory,
) {}
