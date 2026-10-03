import { PartialType } from "@nestjs/swagger";
import { CreateWeeklyReportDto } from "@module/weekly-report/dto/create-weekly-report.dto";

export class UpdateWeeklyReportDto extends PartialType(CreateWeeklyReportDto) {}
