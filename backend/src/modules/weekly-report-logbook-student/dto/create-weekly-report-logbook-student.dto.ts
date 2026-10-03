import { OmitType } from "@nestjs/swagger";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";

export class CreateWeeklyReportLogbookStudentDto extends OmitType(
    WeeklyReportLogbookStudent,
    ["_id"],
) {}
