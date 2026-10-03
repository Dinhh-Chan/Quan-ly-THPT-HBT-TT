import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";

export interface StudentClassHistoryRepository
    extends BaseRepository<StudentClassHistory> {}
