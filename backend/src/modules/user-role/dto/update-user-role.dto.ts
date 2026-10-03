import { PartialType } from "@nestjs/swagger";
import { CreateUserRoleDto } from "@module/user-role/dto/create-user-role.dto";

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {}
