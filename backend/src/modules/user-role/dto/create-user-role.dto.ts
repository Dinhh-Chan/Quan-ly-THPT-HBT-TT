import { OmitType } from "@nestjs/swagger";
import { UserRole } from "@module/user-role/entities/user-role.entity";

export class CreateUserRoleDto extends OmitType(UserRole, ["_id"]) {}
