import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { F } from "@/api/query";
import { api } from "@/api/services";
import { pickRules, useAllScoringRules, useClasses, useSchoolYear } from "@/hooks/useData";
import type { ClassWeekResult, SchoolYear } from "@/types";
import { getWeekRange } from "@/utils/date";
import { computeWeek } from "./engine";

/** Tải toàn bộ dữ liệu thô của một tuần (dùng cho tính điểm và xem chi tiết) */
export const fetchWeekRaw = async (year: SchoolYear, weekNo: number, classId?: string) => {
    const range = getWeekRange(year, weekNo);
    const byDate = F.between("date", range.startDate, range.endDate);
    const byClass = classId ? [F.eq("classId", classId)] : [];
    const [weeklyReports, attendance, violations, incidents, activities] = await Promise.all([
        api.weeklyReports.many({ filters: [F.eq("schoolYearId", year._id), F.eq("weekNo", weekNo), ...byClass] }),
        api.attendance.many({ filters: [byDate, ...byClass] }),
        api.violations.many({ filters: [byDate, ...byClass] }),
        api.incidents.many({ filters: [byDate, ...(classId ? [F.eq("classIds", classId)] : [])] }),
        api.activities.many({ filters: [F.eq("schoolYearId", year._id), F.eq("weekNo", weekNo), ...byClass] }),
    ]);
    return { range, weeklyReports, attendance, violations, incidents, activities };
};

/**
 * Kết quả thi đua tuần. Tuần đã chốt: đọc bản lưu cố định. Tuần chưa chốt: tính trực tiếp từ dữ liệu.
 * Xếp hạng luôn là toàn trường nên luôn tính trên mọi lớp.
 */
export const useWeekResults = (weekNo: number | undefined) => {
    const { data: year } = useSchoolYear();
    const { classes } = useClasses();
    const { data: rulesAll } = useAllScoringRules();
    return useQuery({
        queryKey: ["week-results", year?._id, weekNo],
        enabled: !!year && !!weekNo && classes.length > 0 && !!rulesAll,
        queryFn: async () => {
            const locked = await api.competitionWeeks.one({ filters: [F.eq("schoolYearId", year!._id), F.eq("weekNo", weekNo)] });
            if (locked) return { locked, results: locked.results, raw: null };
            const raw = await fetchWeekRaw(year!, weekNo!);
            const rules = pickRules(rulesAll, weekNo!)!;
            return { locked: null, results: computeWeek({ classes, rules, ...raw }), raw };
        },
        refetchInterval: 60_000,
    });
};

/** Kết quả của nhiều tuần: tuần đã chốt lấy bản lưu, tuần chưa chốt tính trực tiếp */
export const useMultiWeekResults = (weekNos: number[]) => {
    const { data: year } = useSchoolYear();
    const { classes } = useClasses();
    const { data: rulesAll } = useAllScoringRules();
    return useQuery({
        queryKey: ["week-results-multi", year?._id, weekNos.join(",")],
        enabled: !!year && weekNos.length > 0 && classes.length > 0 && !!rulesAll,
        queryFn: async () => {
            const locked = await api.competitionWeeks.many({ filters: [F.eq("schoolYearId", year!._id), F.in("weekNo", weekNos)] });
            const lockedMap = new Map(locked.map((l) => [l.weekNo, l.results]));
            const out = new Map<number, ClassWeekResult[]>();
            for (const w of weekNos) {
                const snap = lockedMap.get(w);
                if (snap) out.set(w, snap);
                else {
                    const raw = await fetchWeekRaw(year!, w);
                    out.set(w, computeWeek({ classes, rules: pickRules(rulesAll, w)!, ...raw }));
                }
            }
            return { byWeek: out, lockedWeeks: new Set(lockedMap.keys()) };
        },
    });
};

/** Tháng của tuần = tháng chứa ngày giữa tuần */
export const weekMonth = (startDate: string) => dayjs(startDate).add(3, "day").format("YYYY-MM");
