import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsInt, IsOptional, IsString } from "class-validator";

export class IncidentPhoto implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Sự việc", required: true })
    incidentId: string;

    @IsString()
    @EntityDefinition.field({ label: "Ảnh (File._id)", required: true })
    fileId: string;

    @IsInt()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự" })
    sortOrder?: number;

    createdAt?: Date;
    updatedAt?: Date;
}
