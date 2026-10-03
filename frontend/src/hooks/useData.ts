import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import { useAuth } from "@/stores/auth";
import { useWorkingDate } from "@/stores/workingDate";
import type { ScoringRules, Student } from "@/types";
import { getWeekInfo, getWeekRange } from "@/utils/date";

const LONG = 5 * 60 * 1000;

export const useSchoolYear = () =>
    useQuery({
        queryKey: ["school-year", "current"],
        queryFn: async () => {
            const list = await api.schoolYear.many({ filters: [F.eq("isCurrent", true)] });
            return list[0] ?? null;
        },
        staleTime: LONG,
    });

export const useClasses = () => {
    const q = useQuery({
        queryKey: ["class"],
        queryFn: async () =>
            (await api.classes.many()).sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name, "vi", { numeric: true })),
        staleTime: LONG,
    });
    const map = useMemo(() => new Map((q.data || []).map((c) => [c._id, c])), [q.data]);
    return { ...q, classes: q.data || [], classMap: map, className: (id?: string) => (id && map.get(id)?.name) || "" };
};

/** Học sinh đang học. Không truyền classId = toàn trường */
export const useStudents = (classId?: string, includeInactive = false) =>
    useQuery({
        queryKey: ["student", classId ?? "all", includeInactive],
        queryFn: () =>
            api.students.many({
                filters: [
                    ...(classId ? [F.eq("classId", classId)] : []),
                    ...(includeInactive ? [] : [F.eq("status", "DANG_HOC")]),
                ],
                sort: { fullname: 1 },
            }) as Promise<Student[]>,
        staleTime: LONG,
    });

export const useAppConfig = () =>
    useQuery({
        queryKey: ["app-config"],
        queryFn: async () => (await api.appConfig.many())[0] ?? null,
        staleTime: LONG,
    });

export const useAllScoringRules = () =>
    useQuery({ queryKey: ["scoring-rule"], queryFn: () => api.scoringRules.many({ sort: { effectiveFromWeek: 1 } }), staleTime: LONG });

/** Quy chế có hiệu lực tại tuần weekNo */
export const pickRules = (all: ScoringRules[] | undefined, weekNo: number) =>
    [...(all || [])].filter((r) => r.effectiveFromWeek <= weekNo).sort((a, b) => b.effectiveFromWeek - a.effectiveFromWeek)[0] ??
    all?.[0];

export const useLockedWeeks = () =>
    useQuery({
        queryKey: ["competition-week", "list"],
        queryFn: () => api.competitionWeeks.many({ select: "-results", sort: { weekNo: 1 } }),
    });

/** Tuần của ngày làm việc + trạng thái chốt */
export const useWorkingWeek = () => {
    const date = useWorkingDate((s) => s.date);
    const { data: year } = useSchoolYear();
    const { data: locked } = useLockedWeeks();
    const week = getWeekInfo(year ?? undefined, date);
    const isLocked = !!week && !!locked?.some((w) => w.weekNo === week.weekNo);
    return { date, year, week, isLocked, weekRange: (n: number) => (year ? getWeekRange(year, n) : null) };
};

/** Vai trò hiện tại + lớp đang làm việc */
export const useScope = () => {
    const { user, activeRole } = useAuth();
    const role = activeRole?.role;
    return {
        user,
        role,
        classId: activeRole?.classId,
        isManager: role === "QUAN_LY",
        /** Lớp trưởng, thư ký, giám thị chỉ sửa trong tuần chưa chốt */
        canEdit: (weekLocked: boolean) => role === "QUAN_LY" || !weekLocked,
    };
};
