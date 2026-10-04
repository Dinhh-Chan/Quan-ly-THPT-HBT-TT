import { Injectable } from "@nestjs/common";
import { ViewBaseService } from "@config/service/view-base.service";
import { CriterionKind } from "@module/scoring-criterion/common/constant";
import { ScoringCriterionService } from "@module/scoring-criterion/services/scoring-criterion.service";
import { CRITERIA } from "@module/scoring-rule/common/criteria";
import { ScoringRuleRepository } from "@module/scoring-rule/repositories/scoring-rule-repository.interface";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { QueryCondition } from "@module/repository/common/base-repository.interface";
import { Entity } from "@module/repository";
import { SchoolYearService } from "@module/school-year/services/school-year.service";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

const ORAL_HIGH = "ORAL_HIGH";
const ORAL_LOW = "ORAL_LOW";

/**
 * FE dùng `deductions`, `bonuses`, `oralHighPoint`, `oralLowPoint`, `classification`;
 * DB lưu ngưỡng xếp loại ở ScoringRule và điểm từng tiêu chí ở ScoringCriterion.
 */
@Injectable()
export class ScoringRuleService extends ViewBaseService<
    ScoringRule,
    ScoringRuleRepository,
    Record<string, number>
> {
    constructor(
        @InjectRepository(Entity.SCORING_RULE)
        private readonly scoringRuleRepository: ScoringRuleRepository,
        private readonly scoringCriterionService: ScoringCriterionService,
        private readonly schoolYearService: SchoolYearService,
    ) {
        super(scoringRuleRepository);
    }

    /** Đọc thô, không dựng lại điểm tiêu chí (dùng nội bộ) */
    internalGetMany(conditions: QueryCondition<ScoringRule>) {
        return this.scoringRuleRepository.getMany(conditions);
    }

    protected async toView(list: ScoringRule[]) {
        if (!list.length) {
            return [];
        }
        const criteria = await this.scoringCriterionService.getMany(null, {
            scoringRuleId: { $in: list.map((r) => r._id) },
        });
        const byRule = _.groupBy(criteria, "scoringRuleId");
        return list.map((r) => {
            const points = new Map(
                (byRule[r._id] || []).map((c) => [
                    c.code,
                    Number(c.points ?? 0),
                ]),
            );
            const pick = (kind: CriterionKind) =>
                Object.fromEntries(
                    CRITERIA.filter(
                        (c) =>
                            c.kind === kind &&
                            c.code !== ORAL_HIGH &&
                            c.code !== ORAL_LOW,
                    ).map((c) => [c.code, points.get(c.code) ?? 0]),
                );
            return {
                ..._.omit(r, ["xsTopRank", "xsMin", "tMin", "khMin"]),
                logbookMultiplier: Number(r.logbookMultiplier ?? 0),
                oralHighPoint: points.get(ORAL_HIGH) ?? 0,
                oralLowPoint: points.get(ORAL_LOW) ?? 0,
                deductions: pick(CriterionKind.MINUS),
                bonuses: pick(CriterionKind.PLUS),
                classification: {
                    xsTopRank: Number(r.xsTopRank ?? 0),
                    xsMin: Number(r.xsMin ?? 0),
                    tMin: Number(r.tMin ?? 0),
                    khMin: Number(r.khMin ?? 0),
                },
            };
        });
    }

    protected async prepareWrite(user: User, dto: any, existing?: ScoringRule) {
        const {
            deductions,
            bonuses,
            oralHighPoint,
            oralLowPoint,
            classification,
            ...data
        } = dto;
        Object.assign(data, classification || {});
        if (!existing) {
            data.schoolYearId =
                data.schoolYearId ||
                (await this.schoolYearService.getCurrentId());
            data.createdById = String(user._id);
        }
        const hasPoints =
            deductions ||
            bonuses ||
            oralHighPoint !== undefined ||
            oralLowPoint !== undefined;
        return {
            data,
            extra: hasPoints
                ? {
                      ...(deductions || {}),
                      ...(bonuses || {}),
                      ...(oralHighPoint !== undefined
                          ? { [ORAL_HIGH]: oralHighPoint }
                          : {}),
                      ...(oralLowPoint !== undefined
                          ? { [ORAL_LOW]: oralLowPoint }
                          : {}),
                  }
                : undefined,
        };
    }

    protected async saveRelations(
        user: User,
        rule: ScoringRule,
        points: Record<string, number> | undefined,
        transaction: unknown,
    ) {
        if (!points) {
            return;
        }
        // Giữ điểm cũ của tiêu chí FE không gửi (ví dụ chỉ sửa ngưỡng)
        const old = await this.scoringCriterionService.getMany(
            null,
            { scoringRuleId: rule._id },
            { transaction },
        );
        const oldPoints = new Map(old.map((c) => [c.code, c.points]));
        await this.replaceChildren(
            this.scoringCriterionService,
            user,
            { scoringRuleId: rule._id },
            CRITERIA.map((c, sortOrder) => ({
                scoringRuleId: rule._id,
                code: c.code,
                name: c.name,
                groupName: c.groupName,
                kind: c.kind,
                points: Number(points[c.code] ?? oldPoints.get(c.code) ?? 0),
                sortOrder,
            })),
            transaction,
        );
    }
}
