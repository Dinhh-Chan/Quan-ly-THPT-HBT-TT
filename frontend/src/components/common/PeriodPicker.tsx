import { DatePicker, Flex, Segmented, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { weekMonth } from "@/features/scoring/useWeekResults";
import { useWorkingWeek } from "@/hooks/useData";
import { listWeeks, type WeekInfo } from "@/utils/date";
import WeekSelect from "./WeekSelect";

export type PeriodMode = "day" | "week" | "month" | "semester";

export interface Period {
    mode: PeriodMode;
    from: string;
    to: string;
    weeks: WeekInfo[];
    label: string;
}

/** Chọn kỳ báo cáo, mặc định theo ngày làm việc */
export function usePeriod(initial: PeriodMode = "week") {
    const { date, week, year } = useWorkingWeek();
    const [mode, setMode] = useState<PeriodMode>(initial);
    const [day, setDay] = useState(date);
    const [weekNo, setWeekNo] = useState<number | undefined>(week?.weekNo);
    const [month, setMonth] = useState(dayjs(date).format("YYYY-MM"));
    const [semester, setSemester] = useState<1 | 2>(week?.semester ?? 1);

    useEffect(() => {
        setDay(date);
        if (week) {
            setWeekNo(week.weekNo);
            setSemester(week.semester);
        }
        setMonth(dayjs(date).format("YYYY-MM"));
    }, [date, week?.weekNo]); // eslint-disable-line react-hooks/exhaustive-deps

    const period = useMemo<Period | null>(() => {
        const all = listWeeks(year ?? undefined);
        if (!all.length) return null;
        const build = (weeks: WeekInfo[], label: string): Period | null =>
            weeks.length ? { mode, from: weeks[0].startDate, to: weeks[weeks.length - 1].endDate, weeks, label } : null;
        switch (mode) {
            case "day":
                return { mode, from: day, to: day, weeks: all.filter((w) => w.startDate <= day && w.endDate >= day), label: dayjs(day).format("DD/MM/YYYY") };
            case "week":
                return build(all.filter((w) => w.weekNo === weekNo), `Tuần ${weekNo}`);
            case "month":
                return build(all.filter((w) => weekMonth(w.startDate) === month), `Tháng ${dayjs(month).format("MM/YYYY")}`);
            case "semester":
                return build(all.filter((w) => w.semester === semester), `Học kỳ ${semester}`);
        }
    }, [mode, day, weekNo, month, semester, year]);

    const picker = (
        <Flex gap={8} wrap>
            <Segmented
                value={mode}
                onChange={(v) => setMode(v as PeriodMode)}
                options={[
                    { label: "Ngày", value: "day" },
                    { label: "Tuần", value: "week" },
                    { label: "Tháng", value: "month" },
                    { label: "Học kỳ", value: "semester" },
                ]}
            />
            {mode === "day" && <DatePicker value={dayjs(day)} allowClear={false} format="DD/MM/YYYY" onChange={(d) => d && setDay(d.format("YYYY-MM-DD"))} />}
            {mode === "week" && <WeekSelect value={weekNo} onChange={setWeekNo} />}
            {mode === "month" && <DatePicker picker="month" value={dayjs(month)} allowClear={false} format="MM/YYYY" onChange={(d) => d && setMonth(d.format("YYYY-MM"))} />}
            {mode === "semester" && (
                <Select
                    value={semester}
                    onChange={setSemester}
                    style={{ width: 120 }}
                    options={[
                        { value: 1, label: "Học kỳ 1" },
                        { value: 2, label: "Học kỳ 2" },
                    ]}
                />
            )}
        </Flex>
    );
    return { period, picker, mode };
}
