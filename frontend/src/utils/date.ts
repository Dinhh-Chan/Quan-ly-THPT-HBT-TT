import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/vi";
import type { SchoolYear } from "@/types";

dayjs.locale("vi");

export const DATE_FMT = "YYYY-MM-DD";
export const VN_DATE = "DD/MM/YYYY";

export const toDateStr = (d: Dayjs | Date | string) => dayjs(d).format(DATE_FMT);
export const fmtDate = (d?: string | null) => (d ? dayjs(d).format(VN_DATE) : "");
export const fmtDateTime = (d?: string | null) => (d ? dayjs(d).format("HH:mm DD/MM/YYYY") : "");
export const todayStr = () => dayjs().format(DATE_FMT);

export const WEEKDAY_LABEL = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export interface WeekInfo {
    weekNo: number;
    semester: 1 | 2;
    startDate: string;
    endDate: string;
}

/** Tuần N = khối 7 ngày thứ N kể từ week1StartDate. Trả null nếu ngoài năm học. */
export const getWeekInfo = (year: SchoolYear | undefined, date: string): WeekInfo | null => {
    if (!year) return null;
    const diff = dayjs(date).startOf("day").diff(dayjs(year.week1StartDate).startOf("day"), "day");
    if (diff < 0) return null;
    const weekNo = Math.floor(diff / 7) + 1;
    if (weekNo > year.totalWeeks) return null;
    return getWeekRange(year, weekNo);
};

export const getWeekRange = (year: SchoolYear, weekNo: number): WeekInfo => {
    const start = dayjs(year.week1StartDate).add((weekNo - 1) * 7, "day");
    return {
        weekNo,
        semester: weekNo >= year.semester2StartWeek ? 2 : 1,
        startDate: start.format(DATE_FMT),
        endDate: start.add(6, "day").format(DATE_FMT),
    };
};

export const listWeeks = (year: SchoolYear | undefined): WeekInfo[] =>
    year ? Array.from({ length: year.totalWeeks }, (_, i) => getWeekRange(year, i + 1)) : [];

export const weeksOfSemester = (year: SchoolYear | undefined, semester: 1 | 2) =>
    listWeeks(year).filter((w) => w.semester === semester);

export const weekLabel = (w: WeekInfo | null) =>
    w ? `Tuần ${w.weekNo} (${fmtDate(w.startDate)} – ${fmtDate(w.endDate)})` : "Ngoài năm học";
