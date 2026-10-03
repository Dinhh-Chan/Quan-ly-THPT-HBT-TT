import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { AbsenceSession } from "@module/absence/common/constant";
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

export class Absence implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Báo cáo sĩ số", required: true })
    reportId: string;

    @IsString()
    @EntityDefinition.field({ label: "Học sinh", required: true })
    studentId: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp (chép từ báo cáo)", required: true })
    classId: string;

    @IsYYYYMMDD()
    @EntityDefinition.field({ label: "Ngày (chép từ báo cáo)", required: true })
    date: string;

    @IsBoolean()
    @EntityDefinition.field({ label: "Có phép", required: true })
    excused: boolean;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({ label: "Lý do" })
    reason?: string;

    @IsEnum(AbsenceSession)
    @EntityDefinition.field({
        label: "Buổi",
        required: true,
        enum: Object.values(AbsenceSession),
    })
    session: AbsenceSession;

    createdAt?: Date;
    updatedAt?: Date;
}
