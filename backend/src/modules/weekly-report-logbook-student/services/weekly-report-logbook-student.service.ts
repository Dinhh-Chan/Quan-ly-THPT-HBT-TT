import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { WeeklyReportLogbookStudentRepository } from "@module/weekly-report-logbook-student/repositories/weekly-report-logbook-student-repository.interface";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class WeeklyReportLogbookStudentService extends BaseService<
    WeeklyReportLogbookStudent,
    WeeklyReportLogbookStudentRepository
> {
    constructor(
        @InjectRepository(Entity.WEEKLY_REPORT_LOGBOOK_STUDENT)
        private readonly weeklyReportLogbookStudentRepository: WeeklyReportLogbookStudentRepository,
    ) {
        super(weeklyReportLogbookStudentRepository);
    }
}
