import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { StudentRepository } from "@module/student/repositories/student-repository.interface";
import { Student } from "@module/student/entities/student.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class StudentService extends BaseService<Student, StudentRepository> {
    constructor(
        @InjectRepository(Entity.STUDENT)
        private readonly studentRepository: StudentRepository,
    ) {
        super(studentRepository);
    }
}
