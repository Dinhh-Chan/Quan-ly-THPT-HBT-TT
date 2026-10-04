import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { AppRole } from "@module/user-role/common/constant";
import {
    ViolationSource,
    ViolationType,
} from "@module/violation/common/constant";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class Violation implements BaseEntity {
    _id: string;

    @IsEnum(ViolationType)
    @EntityDefinition.field({
        label: "Loại lỗi",
        required: true,
        enum: Object.values(ViolationType),
    })
    type: ViolationType;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Học sinh (rỗng với lỗi cấp lớp)" })
    studentId?: string;

    @IsString()
    @EntityDefinition.field({
        label: "Lớp tại thời điểm vi phạm",
        required: true,
    })
    classId: string;

    @IsYYYYMMDD()
    @EntityDefinition.field({ label: "Ngày", required: true })
    date: string;

    @IsString()
    @MaxLength(500)
    @IsOptional()
    @EntityDefinition.field({ label: "Ghi chú" })
    note?: string;

    @IsEnum(ViolationSource)
    @IsOptional()
    @EntityDefinition.field({
        label: "Nguồn",
        enum: Object.values(ViolationSource),
    })
    source?: ViolationSource;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Lô import Excel" })
    importBatchId?: string;

    @IsString()
    @EntityDefinition.field({ label: "Người nhập (User._id)", required: true })
    @IsOptional()
    createdById: string;

    @IsEnum(AppRole)
    @EntityDefinition.field({
        label: "Vai trò người nhập",
        required: true,
        enum: Object.values(AppRole),
    })
    createdByRole: AppRole;

    createdAt?: Date;
    updatedAt?: Date;
}
