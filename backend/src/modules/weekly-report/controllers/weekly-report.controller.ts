import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { WeeklyReportService } from "@module/weekly-report/services/weekly-report.service";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
import { WeeklyReportConditionDto } from "@module/weekly-report/dto/weekly-report-condition.dto";
import { CreateWeeklyReportDto } from "@module/weekly-report/dto/create-weekly-report.dto";
import { UpdateWeeklyReportDto } from "@module/weekly-report/dto/update-weekly-report.dto";

@Controller("weekly-report")
@ApiTags("weekly-report")
export class WeeklyReportController extends BaseControllerFactory<WeeklyReport>(
    WeeklyReport,
    WeeklyReportConditionDto,
    CreateWeeklyReportDto,
    UpdateWeeklyReportDto,
    appControllerConfig(),
) {
    constructor(private readonly weeklyReportService: WeeklyReportService) {
        super(weeklyReportService);
    }
}
