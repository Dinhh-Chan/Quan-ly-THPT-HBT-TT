import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { EmergencyChannel } from "@module/app-config/common/constant";
import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
} from "class-validator";

export class AppConfig implements BaseEntity {
    _id: string;

    @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
        message: "Giờ phải dạng HH:mm",
    })
    @IsOptional()
    @EntityDefinition.field({ label: "Giờ chốt sĩ số" })
    attendanceDeadline?: string;

    @IsInt()
    @Min(0)
    @Max(6)
    @IsOptional()
    @EntityDefinition.field({ label: "Hạn báo cáo tuần – thứ (0 = CN)" })
    weeklyReportDeadlineDay?: number;

    @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
        message: "Giờ phải dạng HH:mm",
    })
    @IsOptional()
    @EntityDefinition.field({ label: "Hạn báo cáo tuần – giờ" })
    weeklyReportDeadlineTime?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @EntityDefinition.field({ label: "Số điện thoại nhận tin khẩn" })
    emergencyPhones?: string[];

    @IsEnum(EmergencyChannel)
    @IsOptional()
    @EntityDefinition.field({
        label: "Kênh gửi tin khẩn",
        enum: Object.values(EmergencyChannel),
    })
    emergencyChannel?: EmergencyChannel;

    @IsInt()
    @Min(1)
    @IsOptional()
    @EntityDefinition.field({ label: "Cảnh báo sớm khi nghỉ (buổi)" })
    absenceWarnAt?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    @EntityDefinition.field({ label: "Mốc xử lý nghỉ (buổi)" })
    absenceLimit?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    @EntityDefinition.field({ label: "Nhắc lại sự việc khẩn sau (phút)" })
    emergencyRemindMinutes?: number;

    createdAt?: Date;
    updatedAt?: Date;
}
