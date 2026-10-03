import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { UserRoleRepository } from "@module/user-role/repositories/user-role-repository.interface";
import { UserRole } from "@module/user-role/entities/user-role.entity";
import { UserRoleModel } from "@module/user-role/models/user-role.model";

export class UserRoleSqlRepository
    extends SqlRepository<UserRole>
    implements UserRoleRepository
{
    constructor(
        @InjectModel(UserRoleModel)
        private readonly userRoleModel: typeof UserRoleModel,
    ) {
        super(userRoleModel);
    }
}
