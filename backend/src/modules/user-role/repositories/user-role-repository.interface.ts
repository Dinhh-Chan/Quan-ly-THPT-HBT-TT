import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { UserRole } from "@module/user-role/entities/user-role.entity";

export interface UserRoleRepository extends BaseRepository<UserRole> {}
