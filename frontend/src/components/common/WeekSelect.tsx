import { Select } from "antd";
import { useLockedWeeks, useSchoolYear } from "@/hooks/useData";
import { fmtDate, listWeeks } from "@/utils/date";

export default function WeekSelect({ value, onChange, maxWeek, style }: { value?: number; onChange: (w: number) => void; maxWeek?: number; style?: React.CSSProperties }) {
    const { data: year } = useSchoolYear();
    const { data: locked } = useLockedWeeks();
    const lockedSet = new Set(locked?.map((w) => w.weekNo));
    const weeks = listWeeks(year ?? undefined).filter((w) => !maxWeek || w.weekNo <= maxWeek);
    return (
        <Select
            value={value}
            onChange={onChange}
            style={{ minWidth: 260, ...style }}
            showSearch={{ optionFilterProp: "label" }}
            options={weeks.map((w) => ({
                value: w.weekNo,
                label: `Tuần ${w.weekNo} · HK${w.semester} (${fmtDate(w.startDate)} – ${fmtDate(w.endDate)})${lockedSet.has(w.weekNo) ? " · Đã chốt" : ""}`,
            }))}
        />
    );
}
