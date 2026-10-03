import { PartialType } from "@nestjs/swagger";
import { UserRole } from "@module/user-role/entities/user-role.entity";

export class UserRoleConditionDto extends PartialType(UserRole) {}
