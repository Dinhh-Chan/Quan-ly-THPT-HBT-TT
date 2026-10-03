import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Student } from "@module/student/entities/student.entity";

export interface StudentRepository extends BaseRepository<Student> {}
