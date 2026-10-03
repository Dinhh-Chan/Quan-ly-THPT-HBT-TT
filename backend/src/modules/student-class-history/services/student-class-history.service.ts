import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { StudentClassHistoryRepository } from "@module/student-class-history/repositories/student-class-history-repository.interface";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class StudentClassHistoryService extends BaseService<
    StudentClassHistory,
    StudentClassHistoryRepository
> {
    constructor(
        @InjectRepository(Entity.STUDENT_CLASS_HISTORY)
        private readonly studentClassHistoryRepository: StudentClassHistoryRepository,
    ) {
        super(studentClassHistoryRepository);
    }
}
