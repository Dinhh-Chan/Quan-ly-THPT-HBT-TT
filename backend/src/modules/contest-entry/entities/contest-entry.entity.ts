import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { ContestPrize } from "@module/contest-entry/common/constant";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export class ContestEntry implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Cuộc thi", required: true })
    contestId: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp", required: true })
    classId: string;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Có tham gia" })
    participated?: boolean;

    @IsEnum(ContestPrize)
    @IsOptional()
    @EntityDefinition.field({
        label: "Giải",
        enum: Object.values(ContestPrize),
    })
    prize?: ContestPrize;

    createdAt?: Date;
    updatedAt?: Date;
}
