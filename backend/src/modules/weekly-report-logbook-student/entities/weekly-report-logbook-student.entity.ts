import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class WeeklyReportLogbookStudent implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Báo cáo tuần", required: true })
    weeklyReportId: string;

    @IsString()
    @EntityDefinition.field({ label: "Học sinh", required: true })
    studentId: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    @EntityDefinition.field({ label: "Số lỗi" })
    count?: number;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({ label: "Ghi chú" })
    note?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
