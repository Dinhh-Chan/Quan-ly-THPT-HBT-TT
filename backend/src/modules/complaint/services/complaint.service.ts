import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { ComplaintStatus } from "@module/complaint/common/constant";
import { ComplaintRepository } from "@module/complaint/repositories/complaint-repository.interface";
import { Complaint } from "@module/complaint/entities/complaint.entity";
import { LookupService } from "@module/lookup/lookup.service";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { SchoolYearService } from "@module/school-year/services/school-year.service";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class ComplaintService extends ViewBaseService<
    Complaint,
    ComplaintRepository
> {
    constructor(
        @InjectRepository(Entity.COMPLAINT)
        private readonly complaintRepository: ComplaintRepository,
        private readonly schoolYearService: SchoolYearService,
        private readonly lookupService: LookupService,
    ) {
        super(complaintRepository);
    }

    protected async toView(list: Complaint[]) {
        const userName = await this.lookupService.userNames(
            list.flatMap((c) => [c.createdById, c.resolvedById]),
        );
        return list.map((c) => ({
            ...c,
            createdByName: userName.get(c.createdById) || "",
            resolvedByName: c.resolvedById
                ? userName.get(c.resolvedById)
                : undefined,
        }));
    }

    protected async prepareWrite(user: User, dto: any, existing?: Complaint) {
        if (existing) {
            return {
                data:
                    dto.status === ComplaintStatus.DA_XU_LY
                        ? {
                              ...dto,
                              resolvedById: String(user._id),
                              resolvedAt: new Date(),
                          }
                        : dto,
            };
        }
        return {
            data: {
                ...dto,
                schoolYearId:
                    dto.schoolYearId ||
                    (await this.schoolYearService.getCurrentId()),
                createdById: String(user._id),
            },
        };
    }
}
