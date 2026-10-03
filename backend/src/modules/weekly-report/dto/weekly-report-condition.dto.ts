import { PartialType } from "@nestjs/swagger";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";

export class WeeklyReportConditionDto extends PartialType(WeeklyReport) {}
