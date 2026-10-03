import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { UserRoleService } from "@module/user-role/services/user-role.service";
import { UserRole } from "@module/user-role/entities/user-role.entity";
import { UserRoleConditionDto } from "@module/user-role/dto/user-role-condition.dto";
import { CreateUserRoleDto } from "@module/user-role/dto/create-user-role.dto";
import { UpdateUserRoleDto } from "@module/user-role/dto/update-user-role.dto";

@Controller("user-role")
@ApiTags("user-role")
export class UserRoleController extends BaseControllerFactory<UserRole>(
    UserRole,
    UserRoleConditionDto,
    CreateUserRoleDto,
    UpdateUserRoleDto,
    appControllerConfig(),
) {
    constructor(private readonly userRoleService: UserRoleService) {
        super(userRoleService);
    }
}
