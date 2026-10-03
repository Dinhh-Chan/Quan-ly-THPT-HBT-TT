import { SequelizeModule } from "@nestjs/sequelize";
import { UserRoleModel } from "@module/user-role/models/user-role.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { UserRoleService } from "@module/user-role/services/user-role.service";
import { UserRoleSqlRepository } from "@module/user-role/repositories/user-role-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { UserRoleController } from "@module/user-role/controllers/user-role.controller";

@Module({
    imports: [SequelizeModule.forFeature([UserRoleModel])],
    exports: [UserRoleService],
    providers: [
        UserRoleService,
        RepositoryProvider(Entity.USER_ROLE, UserRoleSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [UserRoleController],
})
export class UserRoleModule {}
