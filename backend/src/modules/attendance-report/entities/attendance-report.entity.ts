import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Session } from "@module/attendance-report/common/constant";
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class AttendanceReport implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp", required: true })
    classId: string;

    @IsYYYYMMDD()
    @EntityDefinition.field({ label: "Ngày", required: true })
    date: string;

    @IsEnum(Session)
    @EntityDefinition.field({
        label: "Buổi",
        required: true,
        enum: Object.values(Session),
    })
    session: Session;

    @IsInt()
    @Min(0)
    @EntityDefinition.field({ label: "Sĩ số chuẩn", required: true })
    total: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({ label: "Số vắng (server tính)" })
    absentCount?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @EntityDefinition.field({ label: "Có mặt (server tính)" })
    presentCount?: number;

    @IsString()
    @EntityDefinition.field({
        label: "Người báo cáo (User._id)",
        required: true,
    })
    reporterId: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm gửi" })
    submittedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
