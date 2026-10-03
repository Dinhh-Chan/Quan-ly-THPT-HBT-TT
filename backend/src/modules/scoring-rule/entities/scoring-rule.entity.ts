import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class ScoringRule implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Năm học", required: true })
    schoolYearId: string;

    @IsInt()
    @Min(1)
    @EntityDefinition.field({ label: "Hiệu lực từ tuần", required: true })
    effectiveFromWeek: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Hệ số ĐTB Sổ đầu bài" })
    logbookMultiplier?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({
        label: "XS trong N hạng đầu (0 = không giới hạn)",
    })
    xsTopRank?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Ngưỡng XS" })
    xsMin?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Ngưỡng Tốt" })
    tMin?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Ngưỡng Khá" })
    khMin?: number;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Người tạo (User._id)" })
    createdById?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
