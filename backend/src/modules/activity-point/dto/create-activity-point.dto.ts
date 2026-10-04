import { ApiProperty, OmitType } from "@nestjs/swagger";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateActivityPointDto extends OmitType(ActivityPoint, ["_id"]) {
    @ApiProperty({
        required: false,
        description: "Tên cuộc thi (tự tạo Contest nếu chưa có)",
    })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    contestName?: string;
}
