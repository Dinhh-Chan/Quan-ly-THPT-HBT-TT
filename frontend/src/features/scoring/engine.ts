import { ACTIVITY_LABEL, DEDUCTION_ORDER, DOWNGRADE_INCIDENTS, INCIDENT_LABEL, RANK_ORDER } from "@/constants";
import type {
    ActivityPoint,
    AttendanceReport,
    ClassWeekResult,
    DeductionKey,
    Incident,
    Rank,
    SchoolClass,
    ScoringRules,
    Violation,
    ViolationType,
    WeeklyReport,
} from "@/types";

export interface WeekInput {
    classes: SchoolClass[];
    rules: ScoringRules;
    weeklyReports: WeeklyReport[];
    attendance: AttendanceReport[];
    violations: Violation[];
    incidents: Incident[];
    activities: ActivityPoint[];
}

const VIOLATION_TO_DEDUCTION: Record<ViolationType, DeductionKey> = {
    DI_MUON: "DI_MUON",
    QUEN_THE: "QUEN_THE",
    DONG_PHUC: "DONG_PHUC",
    GIAY_DEP: "GIAY_DEP",
    DAU_TOC: "DAU_TOC",
    TRON_TIET: "TRON_TIET",
    KHAC: "KHAC",
    VE_SINH_BAN: "VE_SINH_BAN",
    HDTN_QUA_7P: "HDTN_QUA_7P",
};

const emptyCounts = (): Record<DeductionKey, number> =>
    Object.fromEntries(DEDUCTION_ORDER.map((k) => [k, 0])) as Record<DeductionKey, number>;

/** Khóa chống trùng: cùng học sinh (hoặc lớp với lỗi cấp lớp) – cùng loại – cùng ngày chỉ tính 1 lần */
export const violationKey = (v: Pick<Violation, "studentId" | "classId" | "type" | "date">) =>
    `${v.studentId || `class:${v.classId}`}|${v.type}|${v.date}`;

/**
 * Lượt vắng theo buổi. "Cả ngày" = 2 buổi. Một học sinh – một ngày – một buổi chỉ tính 1 lần
 * kể cả khi được khai ở cả báo cáo sáng và chiều.
 */
export const expandAbsences = (reports: AttendanceReport[]) => {
    const map = new Map<string, { studentId: string; studentName: string; classId: string; date: string; excused: boolean }>();
    for (const r of reports) {
        for (const a of r.absences) {
            const sessions = a.session === "CA_NGAY" ? ["SANG", "CHIEU"] : [a.session];
            for (const s of sessions) {
                map.set(`${a.studentId}|${r.date}|${s}`, {
                    studentId: a.studentId,
                    studentName: a.studentName,
                    classId: r.classId,
                    date: r.date,
                    excused: a.excused,
                });
            }
        }
    }
    return [...map.values()];
};

export const classifyByScore = (total: number, rank: number, rules: ScoringRules): Rank => {
    const c = rules.classification;
    const inTop = c.xsTopRank > 0 ? rank <= c.xsTopRank : true;
    if (inTop && total >= c.xsMin) return "XS";
    if (total >= c.tMin) return "T";
    if (total >= c.khMin) return "Kh";
    return "Y";
};

export const downgrade = (rank: Rank, steps: number): Rank => {
    const idx = Math.min(RANK_ORDER.indexOf(rank) + steps, RANK_ORDER.length - 1);
    return RANK_ORDER[idx];
};

/** Xếp hạng đồng hạng: 1, 2, 2, 4 … */
export const competitionRank = <T extends { total: number }>(items: T[]) => {
    const sorted = [...items].sort((a, b) => b.total - a.total);
    return sorted.map((item) => ({ item, rank: sorted.findIndex((x) => x.total === item.total) + 1 }));
};

export function computeWeek(input: WeekInput): ClassWeekResult[] {
    const { classes, rules } = input;
    const counts = new Map<string, Record<DeductionKey, number>>();
    classes.forEach((c) => counts.set(c._id, emptyCounts()));

    // Vi phạm nền nếp (giám thị, lớp trưởng nhập) – bỏ trùng
    const seen = new Set<string>();
    for (const v of input.violations) {
        const key = violationKey(v);
        if (seen.has(key)) continue;
        seen.add(key);
        const c = counts.get(v.classId);
        if (c) c[VIOLATION_TO_DEDUCTION[v.type]]++;
    }

    // Nghỉ học từ báo cáo sĩ số
    for (const a of expandAbsences(input.attendance)) {
        const c = counts.get(a.classId);
        if (c) c[a.excused ? "NGHI_CO_PHEP" : "NGHI_KHONG_PHEP"]++;
    }

    const reportByClass = new Map(input.weeklyReports.map((r) => [r.classId, r]));

    const rows = classes.map((cls) => {
        const c = counts.get(cls._id)!;
        const report = reportByClass.get(cls._id);
        if (report) c.GHI_SDB = report.logbookErrors || 0;

        const deductionPoints = Object.fromEntries(
            DEDUCTION_ORDER.map((k) => [k, c[k] * (rules.deductions[k] ?? 0)]),
        ) as Record<DeductionKey, number>;
        const oralHigh = report?.oralHigh ?? 0;
        const oralLow = report?.oralLow ?? 0;
        const logbookAvg = report?.logbookAvg ?? null;
        const logbookPoints = round2((logbookAvg ?? 0) * rules.logbookMultiplier);

        const bonusDetail = input.activities
            .filter((a) => a.classId === cls._id && a.criterion !== "4.5")
            .map((a) => ({
                criterion: a.criterion,
                points: rules.bonuses[a.criterion as keyof ScoringRules["bonuses"]] ?? 0,
                note: a.contestName || a.note || ACTIVITY_LABEL[a.criterion],
            }));
        const bonusPoints = bonusDetail.reduce((s, b) => s + b.points, 0);

        const totalDeduction =
            Object.values(deductionPoints).reduce((s, x) => s + x, 0) + oralLow * rules.oralLowPoint;
        const total = round2(logbookPoints + oralHigh * rules.oralHighPoint + bonusPoints - totalDeduction);

        // Hạ bậc: sự việc đã xác minh vi phạm thuộc 2.6–2.10, và 4.5 không tham gia cuộc thi
        const downgrades: ClassWeekResult["downgrades"] = [];
        for (const inc of input.incidents) {
            if (
                inc.status !== "MOI" &&
                inc.verifyResult === "VI_PHAM" &&
                DOWNGRADE_INCIDENTS.includes(inc.type) &&
                inc.students.some((s) => s.classId === cls._id)
            ) {
                downgrades.push({ source: inc._id, label: INCIDENT_LABEL[inc.type] });
            }
        }
        input.activities
            .filter((a) => a.classId === cls._id && a.criterion === "4.5")
            .forEach((a) =>
                downgrades.push({ source: a._id, label: `Không tham gia ${a.contestName || "cuộc thi"}` }),
            );

        return {
            classId: cls._id,
            className: cls.name,
            grade: cls.grade,
            logbookAvg,
            logbookPoints,
            oralHigh,
            oralLow,
            oralHighPoints: oralHigh * rules.oralHighPoint,
            oralLowPoints: oralLow * rules.oralLowPoint,
            counts: c,
            deductionPoints,
            bonusPoints,
            bonusDetail,
            totalDeduction,
            total,
            downgrades,
            reportStatus: report?.status ?? "CHUA_NOP",
        };
    });

    return competitionRank(rows)
        .map(({ item, rank }) => {
            const rankByScore = classifyByScore(item.total, rank, rules);
            return {
                ...item,
                rank,
                rankByScore,
                finalRank: downgrade(rankByScore, item.downgrades.length),
            } as ClassWeekResult;
        })
        .sort((a, b) => a.rank - b.rank || a.className.localeCompare(b.className, "vi", { numeric: true }));
}

const round2 = (n: number) => Math.round(n * 100) / 100;
