import { Injectable } from "@nestjs/common";
import { StudentService } from "@module/student/services/student.service";
import { UserService } from "@module/user/service/user.service";
import _ from "lodash";

/** Tra tên hiển thị theo id (User ở Mongo, Student ở PG) để gắn vào dữ liệu trả FE */
@Injectable()
export class LookupService {
    constructor(
        private readonly userService: UserService,
        private readonly studentService: StudentService,
    ) {}

    async userNames(ids: Array<string | undefined>) {
        const unique = _.uniq(ids.filter(Boolean).map(String));
        const users = unique.length
            ? await this.userService.internalGetMany({ _id: { $in: unique } })
            : [];
        return new Map<string, string>(
            users.map(
                (u) =>
                    [String(u._id), u.fullname || u.username] as [
                        string,
                        string,
                    ],
            ),
        );
    }

    async studentNames(ids: Array<string | undefined>) {
        const unique = _.uniq(ids.filter(Boolean).map(String));
        const students = unique.length
            ? await this.studentService.internalGetMany({
                  _id: { $in: unique },
              })
            : [];
        return new Map<string, string>(
            students.map((s) => [s._id, s.fullname] as [string, string]),
        );
    }
}
