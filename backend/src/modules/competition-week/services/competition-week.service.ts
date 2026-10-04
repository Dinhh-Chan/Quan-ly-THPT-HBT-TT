import { Injectable } from "@nestjs/common";
import { ApiError } from "@config/exception/api-error";
import { ViewBaseService } from "@config/service/view-base.service";
import { CompetitionResultService } from "@module/competition-result/services/competition-result.service";
import { CompetitionWeekRepository } from "@module/competition-week/repositories/competition-week-repository.interface";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
import { LookupService } from "@module/lookup/lookup.service";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { SchoolClassService } from "@module/school-class/services/school-class.service";
import { ScoringCriterionService } from "@module/scoring-criterion/services/scoring-criterion.service";
import { ScoringRuleService } from "@module/scoring-rule/services/scoring-rule.service";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

/** Các cột của CompetitionResult nhận từ ClassWeekResult của FE */
const RESULT_FIELDS = [
    "classId",
    "logbookAvg",
    "logbookPoints",
    "oralHigh",
    "oralLow",
    "counts",
    "deductionPoints",
    "bonusDetail",
    "bonusPoints",
    "totalDeduction",
    "total",
    "rank",
    "rankByScore",
    "downgrades",
    "finalRank",
    "reportStatus",
];

/** FE dùng `results`, `status: "LOCKED"`, `lockedByName`; DB lưu kết quả ở CompetitionResult */
@Injectable()
export class CompetitionWeekService extends ViewBaseService<
    CompetitionWeek,
    CompetitionWeekRepository,
    Record<string, unknown>[]
> {
    constructor(
        @InjectRepository(Entity.COMPETITION_WEEK)
        private readonly competitionWeekRepository: CompetitionWeekRepository,
        private readonly competitionResultService: CompetitionResultService,
        private readonly scoringRuleService: ScoringRuleService,
        private readonly scoringCriterionService: ScoringCriterionService,
        private readonly schoolClassService: SchoolClassService,
        private readonly lookupService: LookupService,
    ) {
        super(competitionWeekRepository);
    }

    protected async toView(list: CompetitionWeek[]) {
        if (!list.length) {
            return [];
        }
        const results = await this.competitionResultService.getMany(
            null,
            { competitionWeekId: { $in: list.map((w) => w._id) } },
            { sort: { rank: 1 } },
        );
        const [classes, criteria, userName] = await Promise.all([
            this.schoolClassService.internalGetMany({
                _id: { $in: _.uniq(results.map((r) => r.classId)) },
            }),
            this.scoringCriterionService.getMany(null, {
                scoringRuleId: {
                    $in: _.uniq(list.map((w) => w.scoringRuleId)),
                },
                code: { $in: ["ORAL_HIGH", "ORAL_LOW"] },
            }),
            this.lookupService.userNames(list.map((w) => w.lockedById)),
        ]);
        const classMap = new Map(classes.map((c) => [c._id, c]));
        const oralPoint = (ruleId: string, code: string) =>
            Number(
                criteria.find(
                    (c) => c.scoringRuleId === ruleId && c.code === code,
                )?.points ?? 0,
            );
        const byWeek = _.groupBy(results, "competitionWeekId");
        return list.map((w) => {
            const high = oralPoint(w.scoringRuleId, "ORAL_HIGH");
            const low = oralPoint(w.scoringRuleId, "ORAL_LOW");
            return {
                ...w,
                status: "LOCKED",
                lockedByName: userName.get(w.lockedById) || "",
                results: (byWeek[w._id] || []).map((r) => ({
                    ..._.omit(r, [
                        "_id",
                        "competitionWeekId",
                        "createdAt",
                        "updatedAt",
                    ]),
                    className: classMap.get(r.classId)?.name || "",
                    grade: classMap.get(r.classId)?.grade,
                    oralHighPoints: r.oralHigh * high,
                    oralLowPoints: r.oralLow * low,
                    bonusDetail: r.bonusDetail || [],
                    downgrades: r.downgrades || [],
                })),
            };
        });
    }

    /** Quy chế áp dụng cho tuần N: phiên bản có effectiveFromWeek lớn nhất mà ≤ N */
    private async pickRuleId(schoolYearId: string, weekNo: number) {
        const rules = await this.scoringRuleService.internalGetMany({
            schoolYearId,
        });
        const rule =
            _.maxBy(
                rules.filter((r) => r.effectiveFromWeek <= weekNo),
                "effectiveFromWeek",
            ) ?? _.minBy(rules, "effectiveFromWeek");
        if (!rule) {
            throw ApiError.BadRequest("error-scoring-rule-required");
        }
        return rule._id;
    }

    protected async prepareWrite(
        user: User,
        dto: any,
        existing?: CompetitionWeek,
    ) {
        const { results, status, lockedByName, ...data } = dto;
        if (!existing) {
            data.scoringRuleId =
                data.scoringRuleId ||
                (await this.pickRuleId(data.schoolYearId, data.weekNo));
            data.lockedById = String(user._id);
            data.lockedAt = new Date();
        }
        return { data, extra: results };
    }

    protected async saveRelations(
        user: User,
        week: CompetitionWeek,
        results: Record<string, unknown>[] | undefined,
        transaction: unknown,
    ) {
        if (!results) {
            return;
        }
        await this.replaceChildren(
            this.competitionResultService,
            user,
            { competitionWeekId: week._id },
            results.map((r) => ({
                ..._.pick(r, RESULT_FIELDS),
                competitionWeekId: week._id,
            })),
            transaction,
        );
    }
}
