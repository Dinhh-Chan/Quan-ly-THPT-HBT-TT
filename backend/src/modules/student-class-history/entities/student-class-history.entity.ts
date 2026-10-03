import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class StudentClassHistory implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Học sinh", required: true })
    studentId: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp", required: true })
    classId: string;

    @IsYYYYMMDD()
    @EntityDefinition.field({ label: "Từ ngày", required: true })
    fromDate: string;

    @IsYYYYMMDD()
    @IsOptional()
    @EntityDefinition.field({ label: "Đến ngày" })
    toDate?: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({ label: "Ghi chú" })
    note?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
