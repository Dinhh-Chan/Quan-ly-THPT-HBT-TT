import { IsString } from "class-validator";

export class CreateIncidentStudentItemDto {
    @IsString()
    studentId: string;

    @IsString()
    classId: string;
}
