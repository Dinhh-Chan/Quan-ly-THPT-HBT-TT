import { Select } from "antd";
import { useClasses } from "@/hooks/useData";

export default function ClassSelect({ value, onChange, allowAll, grade, style, placeholder }: { value?: string; onChange: (v?: string) => void; allowAll?: boolean; grade?: number; style?: React.CSSProperties; placeholder?: string }) {
    const { classes } = useClasses();
    return (
        <Select
            value={value}
            onChange={onChange}
            allowClear={allowAll}
            placeholder={placeholder || (allowAll ? "Tất cả lớp" : "Chọn lớp")}
            style={{ minWidth: 140, ...style }}
            showSearch={{ optionFilterProp: "label" }}
            options={classes.filter((c) => !grade || c.grade === grade).map((c) => ({ value: c._id, label: c.name }))}
        />
    );
}
