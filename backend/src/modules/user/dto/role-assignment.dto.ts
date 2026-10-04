import { AppRole } from "@module/user-role/common/constant";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class RoleAssignmentDto {
    @IsEnum(AppRole)
    role: AppRole;

    @IsString()
    @IsOptional()
    classId?: string;
}
