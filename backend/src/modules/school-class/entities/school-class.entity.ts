import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class SchoolClass implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Năm học", required: true })
    @IsOptional()
    schoolYearId: string;

    @IsString()
    @MaxLength(20)
    @EntityDefinition.field({
        label: "Tên lớp",
        required: true,
        example: "10A1",
    })
    name: string;

    @IsInt()
    @IsIn([10, 11, 12])
    @EntityDefinition.field({ label: "Khối", required: true, example: 10 })
    grade: number;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "GVCN (User._id)" })
    homeroomTeacherId?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Tên GVCN" })
    homeroomTeacherName?: string;

    @IsInt()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự hiển thị" })
    sortOrder?: number;

    createdAt?: Date;
    updatedAt?: Date;
}
