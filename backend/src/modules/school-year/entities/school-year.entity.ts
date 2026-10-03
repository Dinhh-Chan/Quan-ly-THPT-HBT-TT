import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";

export class SchoolYear implements BaseEntity {
    _id: string;

    @IsString()
    @MaxLength(20)
    @EntityDefinition.field({
        label: "Năm học",
        required: true,
        example: "2026-2027",
    })
    name: string;

    @IsYYYYMMDD()
    @EntityDefinition.field({
        label: "Ngày bắt đầu tuần 1",
        required: true,
        example: "2026-08-30",
    })
    week1StartDate: string;

    @IsInt()
    @Min(1)
    @Max(60)
    @EntityDefinition.field({ label: "Số tuần", required: true, example: 37 })
    totalWeeks: number;

    @IsInt()
    @Min(2)
    @EntityDefinition.field({
        label: "Tuần bắt đầu học kỳ 2",
        required: true,
        example: 19,
    })
    semester2StartWeek: number;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Năm học hiện tại" })
    isCurrent?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}
