import { PartialType } from "@nestjs/swagger";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";

export class WeeklyReportLogbookStudentConditionDto extends PartialType(
    WeeklyReportLogbookStudent,
) {}
