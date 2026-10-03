import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { WeeklyReportLogbookStudentService } from "@module/weekly-report-logbook-student/services/weekly-report-logbook-student.service";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";
import { WeeklyReportLogbookStudentConditionDto } from "@module/weekly-report-logbook-student/dto/weekly-report-logbook-student-condition.dto";
import { CreateWeeklyReportLogbookStudentDto } from "@module/weekly-report-logbook-student/dto/create-weekly-report-logbook-student.dto";
import { UpdateWeeklyReportLogbookStudentDto } from "@module/weekly-report-logbook-student/dto/update-weekly-report-logbook-student.dto";

@Controller("weekly-report-logbook-student")
@ApiTags("weekly-report-logbook-student")
export class WeeklyReportLogbookStudentController extends BaseControllerFactory<WeeklyReportLogbookStudent>(
    WeeklyReportLogbookStudent,
    WeeklyReportLogbookStudentConditionDto,
    CreateWeeklyReportLogbookStudentDto,
    UpdateWeeklyReportLogbookStudentDto,
    appControllerConfig(),
) {
    constructor(
        private readonly weeklyReportLogbookStudentService: WeeklyReportLogbookStudentService,
    ) {
        super(weeklyReportLogbookStudentService);
    }
}
