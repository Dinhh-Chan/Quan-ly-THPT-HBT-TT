import { OmitType } from "@nestjs/swagger";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";

export class CreateWeeklyReportDto extends OmitType(WeeklyReport, ["_id"]) {}
