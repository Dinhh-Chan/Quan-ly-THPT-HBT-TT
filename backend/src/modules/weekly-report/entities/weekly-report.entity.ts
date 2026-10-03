import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { WeeklyReportStatus } from "@module/weekly-report/common/constant";
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";

export class WeeklyReport implements BaseEntity {
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

    @IsNumber()
    @Min(0)
    @Max(10)
    @IsOptional()
    @EntityDefinition.field({ label: "Điểm TB Sổ đầu bài" })
    logbookAvg?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({ label: "Số điểm miệng ≥ 8 (cả tuần)" })
    oralHigh?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({ label: "Số điểm miệng < 5 (cả tuần)" })
    oralLow?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({ label: "Số lỗi ghi Sổ đầu bài" })
    logbookErrors?: number;

    @IsEnum(WeeklyReportStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Trạng thái",
        enum: Object.values(WeeklyReportStatus),
    })
    status?: WeeklyReportStatus;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Người nộp (User._id)" })
    submittedById?: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm nộp" })
    submittedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
