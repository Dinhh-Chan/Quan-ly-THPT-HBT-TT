import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Student } from "@module/student/entities/student.entity";
import { Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { StudentClassHistoryItemDto } from "./student-class-history-item.dto";

export class CreateStudentDto extends OmitType(Student, ["_id"]) {
    @ApiProperty({ type: [StudentClassHistoryItemDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentClassHistoryItemDto)
    @IsOptional()
    classHistory?: StudentClassHistoryItemDto[];
}
