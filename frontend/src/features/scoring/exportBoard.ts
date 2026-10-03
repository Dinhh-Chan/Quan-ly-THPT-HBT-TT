import { DEDUCTION_LABEL, DEDUCTION_ORDER } from "@/constants";
import type { ClassWeekResult, DeductionKey } from "@/types";
import { fmtDate, type WeekInfo } from "@/utils/date";
import { exportXlsx, type SheetSpec } from "@/utils/excel";

const COLS: DeductionKey[] = DEDUCTION_ORDER.filter((k) => k !== "KHAC");

/** Sheet T{n} theo mẫu "Bảng đánh giá thi đua tuần" của Đoàn trường */
export const weekSheet = (week: WeekInfo, results: ClassWeekResult[]): SheetSpec => {
    const studyCols = 4;
    const firstDed = 3 + studyCols;
    const lastDed = firstDed + COLS.length - 1;
    const colName = (n: number) => {
        let s = "";
        for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
        return s;
    };
    const tail = ["Điểm cộng", "Tổng điểm bị trừ", "Tổng điểm", "Thứ hạng", "Xếp loại theo điểm", "Hạ bậc", "Xếp loại"];
    const header1 = ["STT", "Lớp", "Học tập", "", "", "", "Nền nếp (số lượt)", ...COLS.slice(1).map(() => ""), ...tail];
    const header2 = ["", "", "ĐTB SĐB", "Điểm SĐB", "Miệng ≥ 8", "Miệng < 5", ...COLS.map((k) => DEDUCTION_LABEL[k]), ...tail.map(() => "")];
    const merges = [
        "A1:A2",
        "B1:B2",
        `C1:F1`,
        `${colName(firstDed)}1:${colName(lastDed)}1`,
        ...tail.map((_, i) => `${colName(lastDed + 1 + i)}1:${colName(lastDed + 1 + i)}2`),
    ];
    const sorted = [...results].sort((a, b) => a.className.localeCompare(b.className, "vi", { numeric: true }));
    return {
        name: `T${week.weekNo}`,
        title: `BẢNG ĐÁNH GIÁ THI ĐUA TUẦN ${week.weekNo} (${fmtDate(week.startDate)} – ${fmtDate(week.endDate)})`,
        header: [header1, header2],
        merges,
        rows: sorted.map((r, i) => [
            i + 1,
            r.className,
            r.logbookAvg ?? 0,
            r.logbookPoints,
            r.oralHigh,
            r.oralLow,
            ...COLS.map((k) => r.counts[k] || null),
            r.bonusPoints || null,
            r.totalDeduction,
            r.total,
            r.rank,
            r.rankByScore,
            r.downgrades.map((d) => d.label).join("; "),
            r.finalRank,
        ]),
        widths: [5, 8, 8, 8, 8, 8, ...COLS.map(() => 8), 8, 9, 9, 7, 9, 22, 8],
    };
};

export interface SemesterRow {
    className: string;
    weeks: number;
    sum: number;
    avg: number;
    XS: number;
    T: number;
    Kh: number;
    Y: number;
    avgRank: number;
}

export const summarize = (byWeek: Map<number, ClassWeekResult[]>) => {
    const map = new Map<string, SemesterRow & { classId: string; grade: number; rankSum: number }>();
    byWeek.forEach((results) =>
        results.forEach((r) => {
            const row = map.get(r.classId) ?? { classId: r.classId, grade: r.grade, className: r.className, weeks: 0, sum: 0, avg: 0, XS: 0, T: 0, Kh: 0, Y: 0, avgRank: 0, rankSum: 0 };
            row.weeks++;
            row.sum += r.total;
            row[r.finalRank]++;
            row.rankSum += r.rank;
            map.set(r.classId, row);
        }),
    );
    const rows = [...map.values()].map((r) => ({ ...r, sum: Math.round(r.sum * 100) / 100, avg: Math.round((r.sum / r.weeks) * 100) / 100, avgRank: Math.round((r.rankSum / r.weeks) * 10) / 10 }));
    const sorted = [...rows].sort((a, b) => b.sum - a.sum);
    return rows
        .map((r) => ({ ...r, rank: sorted.findIndex((x) => x.sum === r.sum) + 1 }))
        .sort((a, b) => a.rank - b.rank);
};

export const summarySheet = (name: string, title: string, rows: ReturnType<typeof summarize>): SheetSpec => ({
    name,
    title,
    header: [["Hạng", "Lớp", "Số tuần", "Tổng điểm", "TB / tuần", "Số tuần XS", "Số tuần T", "Số tuần Kh", "Số tuần Y", "Hạng TB"]],
    rows: rows.map((r) => [r.rank, r.className, r.weeks, r.sum, r.avg, r.XS, r.T, r.Kh, r.Y, r.avgRank]),
    widths: [7, 8, 8, 10, 10, 10, 10, 10, 10, 9],
});

export const exportWeeks = (filename: string, weeks: WeekInfo[], byWeek: Map<number, ClassWeekResult[]>, withSummary?: string) => {
    const sheets = weeks.filter((w) => byWeek.has(w.weekNo)).map((w) => weekSheet(w, byWeek.get(w.weekNo)!));
    if (withSummary) sheets.push(summarySheet(withSummary, `TỔNG HỢP THI ĐUA ${withSummary.toUpperCase()}`, summarize(byWeek)));
    return exportXlsx(filename, sheets);
};
