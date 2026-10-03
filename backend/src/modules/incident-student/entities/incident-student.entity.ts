import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsString } from "class-validator";

export class IncidentStudent implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Sự việc", required: true })
    incidentId: string;

    @IsString()
    @EntityDefinition.field({ label: "Học sinh", required: true })
    studentId: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp lúc xảy ra", required: true })
    classId: string;

    createdAt?: Date;
    updatedAt?: Date;
}
