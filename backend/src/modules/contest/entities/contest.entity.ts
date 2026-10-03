import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { ContestStatus } from "@module/contest/common/constant";
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class Contest implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Năm học", required: true })
    schoolYearId: string;

    @IsString()
    @MaxLength(255)
    @EntityDefinition.field({ label: "Tên cuộc thi", required: true })
    name: string;

    @IsInt()
    @Min(1)
    @EntityDefinition.field({ label: "Tuần trao giải", required: true })
    awardWeekNo: number;

    @IsEnum(ContestStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Trạng thái",
        enum: Object.values(ContestStatus),
    })
    status?: ContestStatus;

    @IsString()
    @EntityDefinition.field({ label: "Người tạo (User._id)", required: true })
    createdById: string;

    createdAt?: Date;
    updatedAt?: Date;
}
