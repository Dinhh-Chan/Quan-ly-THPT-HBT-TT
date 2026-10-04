import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { ActivityPointRepository } from "@module/activity-point/repositories/activity-point-repository.interface";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";
import { ContestStatus } from "@module/contest/common/constant";
import { ContestService } from "@module/contest/services/contest.service";
import { LookupService } from "@module/lookup/lookup.service";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";

/** FE gửi/nhận `contestName` dạng chữ; DB lưu `contestId` trỏ tới Contest */
@Injectable()
export class ActivityPointService extends ViewBaseService<
    ActivityPoint,
    ActivityPointRepository
> {
    /** FE gửi song song nhiều mục cùng cuộc thi: gom lại để chỉ tạo một Contest */
    private readonly pendingContest = new Map<string, Promise<string>>();

    constructor(
        @InjectRepository(Entity.ACTIVITY_POINT)
        private readonly activityPointRepository: ActivityPointRepository,
        private readonly contestService: ContestService,
        private readonly lookupService: LookupService,
    ) {
        super(activityPointRepository);
    }

    protected async toView(list: ActivityPoint[]) {
        const contestIds = [
            ...new Set(list.map((a) => a.contestId).filter(Boolean)),
        ];
        const [contests, userName] = await Promise.all([
            contestIds.length
                ? this.contestService.getMany(null, {
                      _id: { $in: contestIds },
                  })
                : [],
            this.lookupService.userNames(list.map((a) => a.createdById)),
        ]);
        const contestName = new Map<string, string>(
            contests.map((c) => [c._id, c.name] as [string, string]),
        );
        return list.map((a) => ({
            ...a,
            contestName: a.contestId ? contestName.get(a.contestId) : undefined,
            createdByName: userName.get(a.createdById) || "",
        }));
    }

    private findOrCreateContest(
        user: User,
        schoolYearId: string,
        weekNo: number,
        name: string,
    ) {
        const key = `${schoolYearId}|${weekNo}|${name}`;
        let pending = this.pendingContest.get(key);
        if (!pending) {
            pending = (async () => {
                const found = await this.contestService.getOne(null, {
                    schoolYearId,
                    awardWeekNo: weekNo,
                    name,
                });
                if (found) {
                    return found._id;
                }
                const created = await this.contestService.create(user, {
                    schoolYearId,
                    awardWeekNo: weekNo,
                    name,
                    status: ContestStatus.DA_CONG_BO,
                    createdById: String(user._id),
                });
                return created._id;
            })().finally(() => this.pendingContest.delete(key));
            this.pendingContest.set(key, pending);
        }
        return pending;
    }

    protected async prepareWrite(
        user: User,
        dto: any,
        existing?: ActivityPoint,
    ) {
        const { contestName, ...data } = dto;
        const name = contestName?.trim();
        if (name) {
            data.contestId = await this.findOrCreateContest(
                user,
                data.schoolYearId ?? existing?.schoolYearId,
                data.weekNo ?? existing?.weekNo,
                name,
            );
        }
        if (!existing) {
            data.createdById = String(user._id);
        }
        return { data };
    }
}
