import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { LookupService } from "@module/lookup/lookup.service";
import { ViolationRepository } from "@module/violation/repositories/violation-repository.interface";
import { Violation } from "@module/violation/entities/violation.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class ViolationService extends ViewBaseService<
    Violation,
    ViolationRepository
> {
    constructor(
        @InjectRepository(Entity.VIOLATION)
        private readonly violationRepository: ViolationRepository,
        private readonly lookupService: LookupService,
    ) {
        super(violationRepository);
    }

    protected async toView(list: Violation[]) {
        const [studentName, userName] = await Promise.all([
            this.lookupService.studentNames(list.map((v) => v.studentId)),
            this.lookupService.userNames(list.map((v) => v.createdById)),
        ]);
        return list.map((v) => ({
            ...v,
            studentName: v.studentId ? studentName.get(v.studentId) : undefined,
            createdByName: userName.get(v.createdById) || "",
        }));
    }

    protected async prepareWrite(user: User, dto: any, existing?: Violation) {
        return {
            data: existing ? dto : { ...dto, createdById: String(user._id) },
        };
    }
}
