import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Incident } from "@module/incident/entities/incident.entity";
import { Type } from "class-transformer";
import { CreateIncidentStudentItemDto } from "./create-incident-student-item.dto";
import {
    ArrayMaxSize,
    IsArray,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";

export class CreateIncidentDto extends OmitType(Incident, ["_id"]) {
    @ApiProperty({ type: [CreateIncidentStudentItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateIncidentStudentItemDto)
    students: CreateIncidentStudentItemDto[];

    @ApiProperty({ type: [String], description: "Ảnh dạng data URL (base64)" })
    @IsArray()
    @ArrayMaxSize(3)
    @IsString({ each: true })
    @IsOptional()
    photos?: string[];
}
