import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { AppRole } from "@module/user-role/common/constant";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UserRole implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Người dùng (User._id)", required: true })
    userId: string;

    @IsEnum(AppRole)
    @EntityDefinition.field({
        label: "Vai trò",
        required: true,
        enum: Object.values(AppRole),
    })
    role: AppRole;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({
        label: "Lớp phụ trách (GVCN, lớp trưởng, thư ký)",
    })
    classId?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
