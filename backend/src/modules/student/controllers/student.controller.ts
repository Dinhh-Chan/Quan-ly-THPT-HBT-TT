import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { StudentService } from "@module/student/services/student.service";
import { Student } from "@module/student/entities/student.entity";
import { StudentConditionDto } from "@module/student/dto/student-condition.dto";
import { CreateStudentDto } from "@module/student/dto/create-student.dto";
import { UpdateStudentDto } from "@module/student/dto/update-student.dto";

@Controller("student")
@ApiTags("student")
export class StudentController extends BaseControllerFactory<Student>(
    Student,
    StudentConditionDto,
    CreateStudentDto,
    UpdateStudentDto,
    appControllerConfig(),
) {
    constructor(private readonly studentService: StudentService) {
        super(studentService);
    }
}
