import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { QueryCondition } from "@module/repository/common/base-repository.interface";
import { StudentClassHistoryService } from "@module/student-class-history/services/student-class-history.service";
import { StudentClassHistoryItemDto } from "@module/student/dto/student-class-history-item.dto";
import { StudentRepository } from "@module/student/repositories/student-repository.interface";
import { Student } from "@module/student/entities/student.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** FE dùng `classHistory: {classId, from, to}[]`; DB lưu ở bảng StudentClassHistory */
@Injectable()
export class StudentService extends ViewBaseService<
    Student,
    StudentRepository,
    StudentClassHistoryItemDto[]
> {
    constructor(
        @InjectRepository(Entity.STUDENT)
        private readonly studentRepository: StudentRepository,
        private readonly studentClassHistoryService: StudentClassHistoryService,
    ) {
        super(studentRepository);
    }

    /** Đọc thô, không kèm lịch sử lớp (dùng nội bộ, ví dụ tra tên) */
    internalGetMany(conditions: QueryCondition<Student>) {
        return this.studentRepository.getMany(conditions);
    }

    protected async toView(list: Student[]) {
        if (!list.length) {
            return [];
        }
        const history = await this.studentClassHistoryService.getMany(
            null,
            { studentId: { $in: list.map((s) => s._id) } },
            { sort: { fromDate: 1 } },
        );
        const byStudent = _.groupBy(history, "studentId");
        return list.map((s) => ({
            ...s,
            classHistory: (byStudent[s._id] || []).map((h) => ({
                classId: h.classId,
                from: h.fromDate,
                to: h.toDate || undefined,
            })),
        }));
    }

    protected async prepareWrite(user: User, dto: any) {
        const { classHistory, ...data } = dto;
        return { data, extra: classHistory };
    }

    protected async saveRelations(
        user: User,
        student: Student,
        classHistory: StudentClassHistoryItemDto[] | undefined,
        transaction: unknown,
    ) {
        if (!classHistory) {
            return;
        }
        const today = new Date().toISOString().slice(0, 10);
        await this.replaceChildren(
            this.studentClassHistoryService,
            user,
            { studentId: student._id },
            classHistory.map((h) => {
                const toDate = isDate(h.to) ? h.to : null;
                return {
                    studentId: student._id,
                    classId: h.classId,
                    fromDate: isDate(h.from) ? h.from : (toDate ?? today),
                    toDate,
                };
            }),
            transaction,
        );
    }
}
