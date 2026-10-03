import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class Holiday implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Năm học", required: true })
    schoolYearId: string;

    @IsYYYYMMDD()
    @EntityDefinition.field({ label: "Ngày nghỉ", required: true })
    date: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({ label: "Tên ngày lễ" })
    name?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
