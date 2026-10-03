import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { StudentClassHistoryRepository } from "@module/student-class-history/repositories/student-class-history-repository.interface";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";
import { StudentClassHistoryModel } from "@module/student-class-history/models/student-class-history.model";

export class StudentClassHistorySqlRepository
    extends SqlRepository<StudentClassHistory>
    implements StudentClassHistoryRepository
{
    constructor(
        @InjectModel(StudentClassHistoryModel)
        private readonly studentClassHistoryModel: typeof StudentClassHistoryModel,
    ) {
        super(studentClassHistoryModel);
    }
}
