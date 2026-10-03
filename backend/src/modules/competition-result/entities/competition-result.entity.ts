import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Rank } from "@module/competition-result/common/constant";
import {
    IsArray,
    IsEnum,
    IsInt,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class CompetitionResult implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Tuần đã chốt", required: true })
    competitionWeekId: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp", required: true })
    classId: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "ĐTB Sổ đầu bài" })
    logbookAvg?: number;

    @IsNumber()
    @EntityDefinition.field({ label: "Điểm SĐB", required: true })
    logbookPoints: number;

    @IsInt()
    @EntityDefinition.field({ label: "Miệng ≥ 8", required: true })
    oralHigh: number;

    @IsInt()
    @EntityDefinition.field({ label: "Miệng < 5", required: true })
    oralLow: number;

    @IsObject()
    @EntityDefinition.field({ label: "Số lượt theo tiêu chí", required: true })
    counts: Record<string, unknown>;

    @IsObject()
    @EntityDefinition.field({ label: "Điểm trừ theo tiêu chí", required: true })
    deductionPoints: Record<string, unknown>;

    @IsArray()
    @IsOptional()
    @EntityDefinition.field({ label: "Chi tiết điểm cộng" })
    bonusDetail?: Record<string, unknown>[];

    @IsNumber()
    @EntityDefinition.field({ label: "Điểm cộng", required: true })
    bonusPoints: number;

    @IsNumber()
    @EntityDefinition.field({ label: "Tổng điểm bị trừ", required: true })
    totalDeduction: number;

    @IsNumber()
    @EntityDefinition.field({ label: "Tổng điểm", required: true })
    total: number;

    @IsInt()
    @Min(1)
    @EntityDefinition.field({ label: "Thứ hạng toàn trường", required: true })
    rank: number;

    @IsEnum(Rank)
    @EntityDefinition.field({
        label: "Xếp loại theo điểm",
        required: true,
        enum: Object.values(Rank),
    })
    rankByScore: Rank;

    @IsArray()
    @IsOptional()
    @EntityDefinition.field({ label: "Các lỗi hạ bậc" })
    downgrades?: Record<string, unknown>[];

    @IsEnum(Rank)
    @EntityDefinition.field({
        label: "Xếp loại cuối",
        required: true,
        enum: Object.values(Rank),
    })
    finalRank: Rank;

    @IsString()
    @MaxLength(10)
    @EntityDefinition.field({
        label: "Trạng thái báo cáo tuần",
        required: true,
    })
    reportStatus: string;

    createdAt?: Date;
    updatedAt?: Date;
}
