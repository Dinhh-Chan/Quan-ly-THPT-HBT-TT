import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { CriterionKind } from "@module/scoring-criterion/common/constant";
import {
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class ScoringCriterion implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Phiên bản quy chế", required: true })
    scoringRuleId: string;

    @IsString()
    @MaxLength(30)
    @EntityDefinition.field({
        label: "Mã tiêu chí",
        required: true,
        example: "DI_MUON",
    })
    code: string;

    @IsString()
    @MaxLength(10)
    @IsOptional()
    @EntityDefinition.field({ label: "Mục trong quy chế", example: "2.1" })
    regulationNo?: string;

    @IsString()
    @MaxLength(255)
    @EntityDefinition.field({ label: "Tên tiêu chí", required: true })
    name: string;

    @IsString()
    @MaxLength(50)
    @EntityDefinition.field({
        label: "Nhóm",
        required: true,
        example: "Nền nếp",
    })
    groupName: string;

    @IsEnum(CriterionKind)
    @EntityDefinition.field({
        label: "Kiểu",
        required: true,
        enum: Object.values(CriterionKind),
    })
    kind: CriterionKind;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({ label: "Điểm (luôn dương, dấu theo kiểu)" })
    points?: number;

    @IsInt()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự" })
    sortOrder?: number;

    createdAt?: Date;
    updatedAt?: Date;
}
