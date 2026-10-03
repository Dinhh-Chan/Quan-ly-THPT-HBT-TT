import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { StudentClassHistoryService } from "@module/student-class-history/services/student-class-history.service";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";
import { StudentClassHistoryConditionDto } from "@module/student-class-history/dto/student-class-history-condition.dto";
import { CreateStudentClassHistoryDto } from "@module/student-class-history/dto/create-student-class-history.dto";
import { UpdateStudentClassHistoryDto } from "@module/student-class-history/dto/update-student-class-history.dto";

@Controller("student-class-history")
@ApiTags("student-class-history")
export class StudentClassHistoryController extends BaseControllerFactory<StudentClassHistory>(
    StudentClassHistory,
    StudentClassHistoryConditionDto,
    CreateStudentClassHistoryDto,
    UpdateStudentClassHistoryDto,
    appControllerConfig(),
) {
    constructor(
        private readonly studentClassHistoryService: StudentClassHistoryService,
    ) {
        super(studentClassHistoryService);
    }
}
