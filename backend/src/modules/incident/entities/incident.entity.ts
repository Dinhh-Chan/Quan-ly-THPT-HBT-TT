import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import {
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    VerifyResult,
} from "@module/incident/common/constant";
import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

export class Incident implements BaseEntity {
    _id: string;

    @IsEnum(IncidentType)
    @EntityDefinition.field({
        label: "Loại sự việc",
        required: true,
        enum: Object.values(IncidentType),
    })
    type: IncidentType;

    @IsEnum(IncidentSeverity)
    @IsOptional()
    @EntityDefinition.field({
        label: "Mức độ",
        enum: Object.values(IncidentSeverity),
    })
    severity?: IncidentSeverity;

    @IsYYYYMMDD()
    @EntityDefinition.field({ label: "Ngày xảy ra", required: true })
    date: string;

    @IsDateString()
    @EntityDefinition.field({ label: "Thời điểm xảy ra", required: true })
    occurredAt: Date;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({ label: "Địa điểm" })
    location?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả" })
    description?: string;

    @IsEnum(IncidentStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Trạng thái",
        enum: Object.values(IncidentStatus),
    })
    status?: IncidentStatus;

    @IsString()
    @EntityDefinition.field({
        label: "Người báo cáo (User._id)",
        required: true,
    })
    reporterId: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Người tiếp nhận" })
    receivedById?: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm tiếp nhận" })
    receivedAt?: Date;

    @IsEnum(VerifyResult)
    @IsOptional()
    @EntityDefinition.field({
        label: "Kết quả xác minh",
        enum: Object.values(VerifyResult),
    })
    verifyResult?: VerifyResult;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Người xác minh" })
    verifiedById?: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm xác minh" })
    verifiedAt?: Date;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Hình thức xử lý" })
    handling?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Người xử lý" })
    handledById?: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm xử lý" })
    handledAt?: Date;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Đã gửi SMS/Zalo lúc" })
    alertSentAt?: Date;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Nhắc lại gần nhất" })
    remindedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
