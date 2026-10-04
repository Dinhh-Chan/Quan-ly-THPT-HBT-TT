import { AbsenceSession } from "@module/absence/common/constant";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export class AttendanceAbsenceItemDto {
    @IsString()
    studentId: string;

    @IsBoolean()
    excused: boolean;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsEnum(AbsenceSession)
    session: AbsenceSession;
}
