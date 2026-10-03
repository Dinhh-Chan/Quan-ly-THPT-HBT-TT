import { describe, expect, it } from "vitest";
import { DEFAULT_SCORING_RULES } from "@/constants";
import type { AttendanceReport, Incident, SchoolClass, Violation, WeeklyReport } from "@/types";
import { computeWeek, competitionRank, downgrade } from "./engine";

const rules = { _id: "r", ...DEFAULT_SCORING_RULES };
const cls = (id: string): SchoolClass => ({ _id: id, name: id, grade: 10 });
const report = (classId: string, logbookAvg: number, oralHigh: number, oralLow: number, logbookErrors: number): WeeklyReport => ({
    _id: classId,
    classId,
    schoolYearId: "y",
    weekNo: 3,
    logbookAvg,
    oralHigh,
    oralLow,
    logbookErrors,
    status: "DA_NOP",
});
const absences = (classId: string, n: number, excused: boolean): AttendanceReport => ({
    _id: `att-${classId}`,
    classId,
    date: "2026-09-14",
    session: "SANG",
    total: 40,
    absentCount: n,
    presentCount: 40 - n,
    absences: Array.from({ length: n }, (_, i) => ({ studentId: `${classId}-s${i}`, studentName: "x", excused, session: "SANG" })),
    reporterId: "u",
    reporterName: "u",
    submittedAt: "",
});
const violation = (classId: string, type: Violation["type"], studentId: string, date = "2026-09-15"): Violation => ({
    _id: `${studentId}-${type}-${date}`,
    classId,
    type,
    studentId,
    date,
    source: "MANUAL",
    createdById: "gt",
    createdByName: "gt",
    createdByRole: "GIAM_THI",
});

describe("computeWeek – đối chiếu bảng tuần 3", () => {
    it("10A1: 99 + 44 − 10 − 8 (nghỉ có phép) − 3 (ghi SĐB) = 122, tổng trừ có tính nghỉ học", () => {
        const [r] = computeWeek({
            classes: [cls("10A1")],
            rules,
            weeklyReports: [report("10A1", 9.9, 22, 5, 3)],
            attendance: [absences("10A1", 8, true)],
            violations: [],
            incidents: [],
            activities: [],
        });
        expect(r.total).toBe(122);
        expect(r.totalDeduction).toBe(10 + 8 + 3);
    });

    it("10A5: 98 + 34 − 2 − 6 − 1 = 123", () => {
        const [r] = computeWeek({
            classes: [cls("10A5")],
            rules,
            weeklyReports: [report("10A5", 9.8, 17, 0, 1)],
            attendance: [absences("10A5", 6, true)],
            violations: [violation("10A5", "DI_MUON", "a"), violation("10A5", "QUEN_THE", "b")],
            incidents: [],
            activities: [],
        });
        expect(r.total).toBe(123);
    });

    it("nghỉ không phép trừ 10 như bỏ giờ", () => {
        const [r] = computeWeek({
            classes: [cls("X")],
            rules,
            weeklyReports: [report("X", 10, 0, 0, 0)],
            attendance: [absences("X", 1, false)],
            violations: [],
            incidents: [],
            activities: [],
        });
        expect(r.total).toBe(90);
    });

    it("cùng học sinh – cùng lỗi – cùng ngày do 2 giám thị nhập chỉ tính 1 lần", () => {
        const [r] = computeWeek({
            classes: [cls("X")],
            rules,
            weeklyReports: [report("X", 10, 0, 0, 0)],
            attendance: [],
            violations: [violation("X", "DI_MUON", "phuong"), { ...violation("X", "DI_MUON", "phuong"), _id: "dup" }],
            incidents: [],
            activities: [],
        });
        expect(r.counts.DI_MUON).toBe(1);
        expect(r.total).toBe(99);
    });

    it("sự việc đã xác minh vi phạm hạ 1 bậc, chưa xác minh không tính", () => {
        const inc = (status: Incident["status"], verifyResult?: Incident["verifyResult"]): Incident => ({
            _id: status,
            type: "DANH_NHAU",
            severity: "KHAN_CAP",
            students: [{ studentId: "s", studentName: "s", classId: "X" }],
            classIds: ["X"],
            date: "2026-09-15",
            occurredAt: "",
            status,
            verifyResult,
            reporterId: "u",
            reporterName: "u",
            createdAt: "",
        });
        const [r] = computeWeek({
            classes: [cls("X")],
            rules,
            weeklyReports: [report("X", 10, 10, 0, 0)],
            attendance: [],
            violations: [],
            incidents: [inc("DA_XAC_MINH", "VI_PHAM"), inc("MOI")],
            activities: [],
        });
        expect(r.rankByScore).toBe("XS");
        expect(r.downgrades).toHaveLength(1);
        expect(r.finalRank).toBe("T");
    });
});

describe("xếp hạng", () => {
    it("bằng điểm thì đồng hạng", () => {
        const ranks = competitionRank([{ total: 130 }, { total: 122 }, { total: 122 }, { total: 120 }]).map((x) => x.rank);
        expect(ranks).toEqual([1, 2, 2, 4]);
    });
    it("hạ bậc thấp nhất là Y", () => {
        expect(downgrade("Kh", 3)).toBe("Y");
    });
});
