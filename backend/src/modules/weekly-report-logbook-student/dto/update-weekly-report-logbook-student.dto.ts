import { PartialType } from "@nestjs/swagger";
import { CreateWeeklyReportLogbookStudentDto } from "@module/weekly-report-logbook-student/dto/create-weekly-report-logbook-student.dto";

export class UpdateWeeklyReportLogbookStudentDto extends PartialType(
    CreateWeeklyReportLogbookStudentDto,
) {}
