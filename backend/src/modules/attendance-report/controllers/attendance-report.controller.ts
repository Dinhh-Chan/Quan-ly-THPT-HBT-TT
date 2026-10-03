import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { AttendanceReportService } from "@module/attendance-report/services/attendance-report.service";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
import { AttendanceReportConditionDto } from "@module/attendance-report/dto/attendance-report-condition.dto";
import { CreateAttendanceReportDto } from "@module/attendance-report/dto/create-attendance-report.dto";
import { UpdateAttendanceReportDto } from "@module/attendance-report/dto/update-attendance-report.dto";

@Controller("attendance-report")
@ApiTags("attendance-report")
export class AttendanceReportController extends BaseControllerFactory<AttendanceReport>(
    AttendanceReport,
    AttendanceReportConditionDto,
    CreateAttendanceReportDto,
    UpdateAttendanceReportDto,
    appControllerConfig(),
) {
    constructor(
        private readonly attendanceReportService: AttendanceReportService,
    ) {
        super(attendanceReportService);
    }
}
