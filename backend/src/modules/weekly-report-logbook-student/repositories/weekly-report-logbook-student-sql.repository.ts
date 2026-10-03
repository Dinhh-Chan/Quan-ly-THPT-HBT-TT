import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { WeeklyReportLogbookStudentRepository } from "@module/weekly-report-logbook-student/repositories/weekly-report-logbook-student-repository.interface";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";
import { WeeklyReportLogbookStudentModel } from "@module/weekly-report-logbook-student/models/weekly-report-logbook-student.model";

export class WeeklyReportLogbookStudentSqlRepository
    extends SqlRepository<WeeklyReportLogbookStudent>
    implements WeeklyReportLogbookStudentRepository
{
    constructor(
        @InjectModel(WeeklyReportLogbookStudentModel)
        private readonly weeklyReportLogbookStudentModel: typeof WeeklyReportLogbookStudentModel,
    ) {
        super(weeklyReportLogbookStudentModel);
    }
}
