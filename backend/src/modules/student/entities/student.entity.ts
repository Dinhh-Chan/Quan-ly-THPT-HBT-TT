import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { StudentStatus } from "@module/student/common/constant";
import { Gender } from "@module/user/common/constant";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class Student implements BaseEntity {
    _id: string;

    @IsString()
    @MaxLength(20)
    @EntityDefinition.field({
        label: "Mã học sinh",
        required: true,
        example: "HS00001",
    })
    code: string;

    @IsString()
    @MaxLength(255)
    @EntityDefinition.field({
        label: "Họ tên",
        required: true,
        example: "Nguyễn Thị Hà",
    })
    fullname: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    @EntityDefinition.field({
        label: "Họ tên không dấu (tự sinh)",
        disableImport: true,
    })
    nameNoAccent?: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    @EntityDefinition.field({
        label: "Tên gọi không dấu (tự sinh)",
        disableImport: true,
    })
    givenName?: string;

    @IsEnum(Gender)
    @IsOptional()
    @EntityDefinition.field({ label: "Giới tính", enum: Object.values(Gender) })
    gender?: Gender;

    @IsYYYYMMDD()
    @IsOptional()
    @EntityDefinition.field({ label: "Ngày sinh" })
    dob?: string;

    @IsString()
    @EntityDefinition.field({ label: "Lớp hiện tại", required: true })
    classId: string;

    @IsEnum(StudentStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Trạng thái",
        enum: Object.values(StudentStatus),
    })
    status?: StudentStatus;

    createdAt?: Date;
    updatedAt?: Date;
}
