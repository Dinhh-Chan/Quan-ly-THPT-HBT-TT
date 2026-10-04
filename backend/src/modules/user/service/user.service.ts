import { createUserPassword } from "@common/constant";
import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { Configuration } from "@config/configuration";
import { ApiError } from "@config/exception/api-error";
import { BaseService } from "@config/service/base.service";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { SettingKey } from "@module/setting/common/constant";
import { SettingService } from "@module/setting/setting.service";
import {
    GetManyQuery,
    GetOneQuery,
    GetPageQuery,
    UpdateByIdQuery,
} from "@common/constant";
import { CreateUserDto } from "@module/user/dto/create-user.dto";
import { UpdateUserDto } from "@module/user/dto/update-user.dto";
import { UserRoleService } from "@module/user-role/services/user-role.service";
import {
    BaseQueryOption,
    QueryCondition,
    UpdateDocument,
} from "@module/repository/common/base-repository.interface";
import _ from "lodash";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { RoleAssignmentDto } from "../dto/role-assignment.dto";
import { UserRepository } from "@module/user/repository/user-repository.interface";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcryptjs";
import { SystemRole } from "../common/constant";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService
    extends BaseService<User, UserRepository>
    implements OnApplicationBootstrap
{
    constructor(
        @InjectRepository(Entity.USER)
        private readonly userRepository: UserRepository,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService<Configuration>,
        private readonly userRoleService: UserRoleService,
        @InjectTransaction()
        private readonly userTransaction: BaseTransaction,
    ) {
        super(userRepository, {
            notFoundCode: "error-user-not-found",
            transaction: userTransaction,
        });
    }

    async testUser() {
        await this.userRepository.distinct("", { asd: 1 });
        const user = await this.userRepository.updateOne(
            {
                username: "admin",
            },
            {
                $inc: { __v: -1 },
                fullname: 1,
            },
        );
        return user;
    }

    async onApplicationBootstrap() {
        const setting = await this.settingService.getSettingValue(
            SettingKey.INIT_DATA,
        );
        const update = setting || {};
        if (!update.isAdminCreated) {
            update.isAdminCreated = true;
            const { defaultAdminUsername, defaultAdminPassword } =
                this.configService.get("server", {
                    infer: true,
                });
            await this.userRepository.create({
                username: defaultAdminUsername,
                email: "admin@administrator.com",
                password: await createUserPassword(defaultAdminPassword),
                systemRole: SystemRole.ADMIN,
                fullname: "Administrator",
            });
            Logger.verbose("Admin created");
            await this.settingService.setSettingValue(
                SettingKey.INIT_DATA,
                update,
            );
        }
    }

    async internalGetById(id: string) {
        return this.userRepository.getById(id, { enableDataPartition: false });
    }

    /** Gắn vai trò nghiệp vụ (UserRole ở PG) và bỏ mật khẩu trước khi trả FE */
    async toView(list: User[]) {
        if (!list.length) {
            return [];
        }
        const roles = await this.userRoleService.getMany(null, {
            userId: { $in: list.map((u) => String(u._id)) },
        });
        const byUser = _.groupBy(roles, "userId");
        return list.map((u) => ({
            // Repository Mongo có thể trả document: chuyển về object thường trước khi bỏ password
            ..._.omit(
                typeof (u as any)?.toJSON === "function"
                    ? (u as any).toJSON()
                    : u,
                "password",
            ),
            roles: (byUser[String(u._id)] || []).map((r) =>
                r.classId
                    ? { role: r.role, classId: r.classId }
                    : { role: r.role },
            ),
        }));
    }

    private async viewOne(u: User) {
        return u ? (await this.toView([u]))[0] : u;
    }

    /** Đọc thô, không gắn vai trò (dùng nội bộ, ví dụ tra tên) */
    internalGetMany(conditions: QueryCondition<User>) {
        return this.userRepository.getMany(conditions, {
            enableDataPartition: false,
        });
    }

    async getMany(
        user: User,
        conditions: QueryCondition<User>,
        query?: GetManyQuery<User> & BaseQueryOption<unknown>,
    ): Promise<any> {
        return this.toView(await super.getMany(user, conditions, query));
    }

    async getPage(
        user: User,
        conditions: QueryCondition<User>,
        query?: GetPageQuery<User> & BaseQueryOption<unknown>,
    ): Promise<any> {
        const page = await super.getPage(user, conditions, query);
        return { ...page, result: await this.toView(page.result) };
    }

    async getOne(
        user: User,
        conditions: QueryCondition<User>,
        query?: GetOneQuery<User> & BaseQueryOption<unknown>,
    ): Promise<any> {
        return this.viewOne(await super.getOne(user, conditions, query));
    }

    async getById(user: User, id: string, query?: any): Promise<any> {
        return this.viewOne(await super.getById(user, id, query));
    }

    async getMe(authData: RequestAuthData) {
        return this.viewOne(await authData.getUser());
    }

    /** UserRole nằm ở PG, User ở Mongo nên không chung transaction: ghi đè toàn bộ vai trò */
    private async saveRoles(userId: string, roles: RoleAssignmentDto[]) {
        await this.userRoleService.deleteMany(null, { userId }, {});
        const items = _.uniqBy(
            roles,
            (r) => `${r.role}:${r.classId ?? ""}`,
        ).map((r) => ({ userId, role: r.role, classId: r.classId || null }));
        if (items.length) {
            await this.userRoleService.insertMany(null, items as any[]);
        }
    }

    async create(user: User, dto: CreateUserDto): Promise<any> {
        const { roles, ...data } = dto;
        data.username = data.username.trim().toLowerCase();
        const exist = await this.userRepository.getOne(
            { username: data.username },
            { enableDataPartition: false },
        );
        if (exist) {
            throw ApiError.BadRequest("error-user-exist");
        }
        if (data.password) {
            data.password = await createUserPassword(data.password);
        }
        const res = await this.userRepository.create(data);
        try {
            await this.saveRoles(String(res._id), roles || []);
        } catch (err) {
            // Ghi vai trò lỗi thì xóa tài khoản vừa tạo để không bị "mồ côi"
            await this.userRepository.deleteById(res._id);
            throw err;
        }
        return this.viewOne(res);
    }

    async updateById(
        user: User,
        id: string,
        update: UpdateDocument<User> & { roles?: RoleAssignmentDto[] },
        query?: UpdateByIdQuery & BaseQueryOption<unknown>,
    ): Promise<any> {
        const { roles, ...data } = update as UpdateUserDto;
        if (data.password) {
            data.password = await createUserPassword(data.password);
        }
        if (data.username) {
            data.username = data.username.trim().toLowerCase();
        }
        const res = await super.updateById(user, id, data, query);
        if (roles) {
            await this.saveRoles(id, roles);
        }
        return this.viewOne(res);
    }

    async deleteById(user: User, id: string, query?: any): Promise<any> {
        const res = await super.deleteById(user, id, query);
        await this.userRoleService.deleteMany(null, { userId: id }, {});
        return res;
    }

    /** Cấp quản lý đặt lại mật khẩu; người dùng phải đổi ở lần đăng nhập sau */
    async resetPassword(user: User, id: string, dto: ResetPasswordDto) {
        const res = await super.updateById(user, id, {
            password: await createUserPassword(dto.newPass),
            mustChangePassword: true,
        });
        return this.viewOne(res);
    }

    async changePasswordMe(user: User, dto: ChangePasswordDto) {
        const correctOldPassword = await this.comparePassword(
            user,
            dto.oldPass,
        );
        if (!correctOldPassword) {
            throw ApiError.BadRequest("error-old-password-wrong");
        }
        const res = await this.userRepository.updateById(user._id, {
            password: await createUserPassword(dto.newPass),
            mustChangePassword: false,
        });
        return this.viewOne(res);
    }

    async comparePassword(user: User, password: string) {
        return bcrypt.compare(password, user.password);
    }
}
