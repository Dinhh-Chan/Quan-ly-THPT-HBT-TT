import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";

export interface WeeklyReportRepository extends BaseRepository<WeeklyReport> {}
