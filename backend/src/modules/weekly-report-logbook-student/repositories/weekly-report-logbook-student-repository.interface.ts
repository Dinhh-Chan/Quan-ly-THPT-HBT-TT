import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";

export interface WeeklyReportLogbookStudentRepository
    extends BaseRepository<WeeklyReportLogbookStudent> {}
