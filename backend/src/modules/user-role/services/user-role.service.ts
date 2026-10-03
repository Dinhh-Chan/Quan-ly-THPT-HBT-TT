import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { UserRoleRepository } from "@module/user-role/repositories/user-role-repository.interface";
import { UserRole } from "@module/user-role/entities/user-role.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class UserRoleService extends BaseService<UserRole, UserRoleRepository> {
    constructor(
        @InjectRepository(Entity.USER_ROLE)
        private readonly userRoleRepository: UserRoleRepository,
    ) {
        super(userRoleRepository);
    }
}
