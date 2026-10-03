import { BaseControllerConfig } from "@config/controller/base-controller.interface";
import { SystemRole } from "@module/user/common/constant";

/**
 * Cấu hình chung cho các controller nghiệp vụ (nền nếp & thi đua).
 *
 * Mặc định của BaseControllerFactory chỉ cho Admin, nên ở đây mở cho mọi tài khoản đã đăng nhập.
 * TODO: thay bằng guard theo vai trò nghiệp vụ (UserRole: QUAN_LY, GVCN, LOP_TRUONG, THU_KY, GIAM_THI)
 * và phạm vi lớp, khóa tuần đã chốt.
 */
export const appControllerConfig = (
    override: Partial<BaseControllerConfig> = {},
): BaseControllerConfig => ({
    authorize: true,
    roles: [SystemRole.ADMIN, SystemRole.USER],
    import: { enable: true },
    ...override,
});
