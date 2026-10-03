import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { ActivityCriterion } from "@module/activity-point/common/constant";
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class ActivityPoint implements BaseEntity {
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

    @IsEnum(ActivityCriterion)
    @EntityDefinition.field({
        label: "Tiêu chí",
        required: true,
        enum: Object.values(ActivityCriterion),
    })
    criterion: ActivityCriterion;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Sinh từ cuộc thi" })
    contestId?: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({ label: "Ghi chú" })
    note?: string;

    @IsString()
    @EntityDefinition.field({ label: "Người nhập (User._id)", required: true })
    createdById: string;

    createdAt?: Date;
    updatedAt?: Date;
}
