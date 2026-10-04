import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { User } from "../entities/user.entity";
import { RoleAssignmentDto } from "./role-assignment.dto";

export class CreateUserDto extends OmitType(User, ["_id"]) {
    @ApiProperty({ type: [RoleAssignmentDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoleAssignmentDto)
    @IsOptional()
    roles?: RoleAssignmentDto[];
}
