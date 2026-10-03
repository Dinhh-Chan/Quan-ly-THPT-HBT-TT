import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { StudentRepository } from "@module/student/repositories/student-repository.interface";
import { Student } from "@module/student/entities/student.entity";
import { StudentModel } from "@module/student/models/student.model";

export class StudentSqlRepository
    extends SqlRepository<Student>
    implements StudentRepository
{
    constructor(
        @InjectModel(StudentModel)
        private readonly studentModel: typeof StudentModel,
    ) {
        super(studentModel);
    }
}
