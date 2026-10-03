import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { F } from "@/api/query";
import { api } from "@/api/services";
import { INCIDENT_LABEL } from "@/constants";
import { expandAbsences } from "@/features/scoring/engine";
import type { AppConfig, AppNotification, AttendanceReport, SchoolYear } from "@/types";
import { getWeekInfo, getWeekRange, todayStr, weeksOfSemester } from "@/utils/date";
import { useAppConfig, useClasses, useSchoolYear, useScope } from "./useData";

const pastTime = (hhmm: string) => dayjs().format("HH:mm") >= hhmm;

/** Thống kê buổi nghỉ trong học kỳ của từng học sinh + cảnh báo nghỉ không phép 2 buổi liên tiếp */
export const absenceAlerts = (reports: AttendanceReport[], cfg: AppConfig) => {
    const list = expandAbsences(reports);
    const byStudent = new Map<string, { name: string; classId: string; total: number; days: { date: string; excused: boolean }[] }>();
    for (const a of list) {
        const s = byStudent.get(a.studentId) ?? { name: a.studentName, classId: a.classId, total: 0, days: [] };
        s.total++;
        s.days.push({ date: a.date, excused: a.excused });
        byStudent.set(a.studentId, s);
    }
    // Ngày có báo cáo của lớp, để xác định "buổi liên tiếp"
    const reportDays = new Map<string, string[]>();
    reports.forEach((r) => reportDays.set(r.classId, [...new Set([...(reportDays.get(r.classId) || []), r.date])].sort()));

    const out: { studentId: string; name: string; classId: string; total: number; level: "limit" | "warn" | null; consecutiveUnexcused: boolean }[] = [];
    byStudent.forEach((s, studentId) => {
        const days = reportDays.get(s.classId) || [];
        const unexcused = new Set(s.days.filter((d) => !d.excused).map((d) => d.date));
        let consecutive = false;
        for (let i = 1; i < days.length; i++) if (unexcused.has(days[i]) && unexcused.has(days[i - 1])) consecutive = true;
        // Cả ngày không phép trong một ngày cũng là 2 buổi liên tiếp
        const perDay = new Map<string, number>();
        s.days.filter((d) => !d.excused).forEach((d) => perDay.set(d.date, (perDay.get(d.date) || 0) + 1));
        if ([...perDay.values()].some((n) => n >= 2)) consecutive = true;
        const level = s.total >= cfg.absenceLimit ? "limit" : s.total >= cfg.absenceWarnAt ? "warn" : null;
        out.push({ studentId, name: s.name, classId: s.classId, total: s.total, level, consecutiveUnexcused: consecutive });
    });
    return out.sort((a, b) => b.total - a.total);
};

export const semesterRange = (year: SchoolYear, date: string) => {
    const w = getWeekInfo(year, date);
    const weeks = weeksOfSemester(year, w?.semester ?? 1);
    return { from: weeks[0].startDate, to: weeks[weeks.length - 1].endDate, semester: w?.semester ?? 1 };
};

/** Nhắc việc và cảnh báo theo vai trò; làm mới mỗi 30 giây */
export const useNotifications = () => {
    const { role, classId } = useScope();
    const { data: year } = useSchoolYear();
    const { data: cfg } = useAppConfig();
    const { classes, className } = useClasses();

    return useQuery({
        queryKey: ["notifications", role, classId],
        enabled: !!year && !!cfg && !!role && classes.length > 0,
        refetchInterval: 30_000,
        queryFn: async (): Promise<AppNotification[]> => {
            const today = todayStr();
            const week = getWeekInfo(year!, today);
            const out: AppNotification[] = [];
            const isClassRole = role === "LOP_TRUONG" || role === "GVCN";
            const isSchoolDay = dayjs().day() !== 0 && !year!.holidays.includes(today);

            if (isClassRole && classId && isSchoolDay) {
                const rep = await api.attendance.one({ filters: [F.eq("classId", classId), F.eq("date", today)] });
                if (!rep) {
                    const late = pastTime(cfg!.attendanceDeadline);
                    out.push({
                        id: "att-missing",
                        level: late ? "error" : "warning",
                        title: late ? "Quá giờ chốt – lớp chưa báo cáo sĩ số hôm nay" : `Nhớ báo cáo sĩ số trước ${cfg!.attendanceDeadline}`,
                        link: "/lop/si-so",
                    });
                }
            }

            if ((role === "THU_KY" || role === "GVCN") && classId && week) {
                const checks = [week.weekNo - 1, week.weekNo].filter((n) => n >= 1);
                const reports = await api.weeklyReports.many({ filters: [F.eq("classId", classId), F.in("weekNo", checks)] });
                for (const n of checks) {
                    const r = reports.find((x) => x.weekNo === n);
                    if (r && r.status !== "NHAP") continue;
                    const range = getWeekRange(year!, n);
                    const deadline = dayjs(range.startDate)
                        .day(cfg!.weeklyReportDeadlineDay)
                        .format("YYYY-MM-DD");
                    const overdue = n < week.weekNo || (today >= deadline && pastTime(cfg!.weeklyReportDeadlineTime));
                    if (overdue || today >= deadline)
                        out.push({
                            id: `wr-${n}`,
                            level: overdue ? "error" : "warning",
                            title: overdue ? `Quá hạn nộp báo cáo thi đua tuần ${n}` : `Hạn nộp báo cáo tuần ${n}: ${cfg!.weeklyReportDeadlineTime} hôm nay`,
                            link: "/lop/bao-cao-tuan",
                        });
                }
            }

            if (role === "QUAN_LY" || role === "GVCN") {
                const incidents = await api.incidents.many({
                    filters: [F.in("status", ["MOI", "DA_TIEP_NHAN"]), ...(role === "GVCN" ? [F.eq("classIds", classId)] : [])],
                    sort: { createdAt: -1 },
                });
                incidents.forEach((i) => {
                    const mins = dayjs().diff(dayjs(i.createdAt), "minute");
                    const remind = i.status === "MOI" && i.severity === "KHAN_CAP" && mins >= cfg!.emergencyRemindMinutes;
                    out.push({
                        id: `inc-${i._id}`,
                        level: i.status === "MOI" ? "error" : "warning",
                        title: `${remind ? "NHẮC LẠI – " : ""}${i.severity === "KHAN_CAP" ? "KHẨN: " : ""}${INCIDENT_LABEL[i.type]} (${i.classIds.map(className).join(", ")})`,
                        description: `${i.status === "MOI" ? `Chưa tiếp nhận · ${mins} phút trước` : `Đã tiếp nhận bởi ${i.receivedByName}`}`,
                        link: role === "QUAN_LY" ? `/quan-ly/su-viec?id=${i._id}` : "/lop/bao-cao",
                    });
                });
            }

            if (role === "QUAN_LY" && isSchoolDay && pastTime(cfg!.attendanceDeadline)) {
                const reps = await api.attendance.many({ filters: [F.eq("date", today)], select: "classId" });
                const missing = classes.length - new Set(reps.map((r) => r.classId)).size;
                if (missing > 0)
                    out.push({ id: "att-school", level: "warning", title: `${missing} lớp chưa báo cáo sĩ số hôm nay`, link: "/quan-ly/dashboard" });
                const complaints = await api.complaints.many({ filters: [F.eq("status", "MOI")] });
                if (complaints.length)
                    out.push({ id: "cmp", level: "info", title: `${complaints.length} khiếu nại chờ xử lý`, link: "/quan-ly/khieu-nai" });
            }

            if (role === "GVCN" && classId) {
                const sem = semesterRange(year!, today);
                const reps = await api.attendance.many({ filters: [F.eq("classId", classId), F.between("date", sem.from, sem.to)] });
                absenceAlerts(reps, cfg!).forEach((a) => {
                    if (a.level)
                        out.push({
                            id: `abs-${a.studentId}`,
                            level: a.level === "limit" ? "error" : "warning",
                            title: `${a.name} đã nghỉ ${a.total} buổi trong HK${sem.semester}`,
                            description: a.level === "limit" ? "Đạt mốc xử lý theo Nội quy học sinh" : "Cảnh báo sớm",
                            link: "/lop/bao-cao",
                        });
                    if (a.consecutiveUnexcused)
                        out.push({ id: `abs2-${a.studentId}`, level: "warning", title: `${a.name} nghỉ không phép 2 buổi liên tiếp`, description: "Liên hệ gia đình", link: "/lop/bao-cao" });
                });
            }
            return out;
        },
    });
};
