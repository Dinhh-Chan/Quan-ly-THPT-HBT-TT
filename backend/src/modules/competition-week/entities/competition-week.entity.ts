import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CompetitionWeek implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Năm học", required: true })
    schoolYearId: string;

    @IsInt()
    @Min(1)
    @EntityDefinition.field({ label: "Tuần", required: true })
    weekNo: number;

    @IsString()
    @EntityDefinition.field({ label: "Quy chế đã dùng", required: true })
    scoringRuleId: string;

    @IsString()
    @EntityDefinition.field({ label: "Người chốt (User._id)", required: true })
    lockedById: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm chốt" })
    lockedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
