import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { ComplaintStatus } from "@module/complaint/common/constant";
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class Complaint implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Năm học", required: true })
    schoolYearId: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp", required: true })
    classId: string;

    @IsInt()
    @Min(1)
    @EntityDefinition.field({ label: "Tuần", required: true })
    weekNo: number;

    @IsString()
    @MaxLength(30)
    @EntityDefinition.field({
        label: "Chỉ tiêu bị khiếu nại",
        required: true,
        example: "DI_MUON",
    })
    field: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Vi phạm bị khiếu nại" })
    violationId?: string;

    @IsString()
    @EntityDefinition.field({ label: "Nội dung", required: true })
    content: string;

    @IsEnum(ComplaintStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Trạng thái",
        enum: Object.values(ComplaintStatus),
    })
    status?: ComplaintStatus;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Phản hồi" })
    response?: string;

    @IsString()
    @EntityDefinition.field({ label: "Người gửi (User._id)", required: true })
    createdById: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Người xử lý" })
    resolvedById?: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm xử lý" })
    resolvedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
