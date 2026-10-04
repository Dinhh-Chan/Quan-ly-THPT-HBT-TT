import { IsOptional, IsString } from "class-validator";

export class StudentClassHistoryItemDto {
    @IsString()
    classId: string;

    /** YYYY-MM-DD; có thể rỗng với dữ liệu cũ chưa rõ ngày vào lớp */
    @IsString()
    @IsOptional()
    from?: string;

    @IsString()
    @IsOptional()
    to?: string;
}
