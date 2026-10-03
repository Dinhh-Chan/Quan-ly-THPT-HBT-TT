import { AutoComplete, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import type { Student } from "@/types";
import { searchByName } from "@/utils/text";

interface Props {
    students: Student[];
    onPick: (s: Student) => void;
    /** Hiện tên lớp kèm tên học sinh (tìm toàn trường) */
    className?: (classId: string) => string;
    excludeIds?: string[];
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
}

/**
 * Ô tìm học sinh: gõ bất kỳ ký tự nào là gợi ý ngay; tìm không dấu, ưu tiên khớp tên gọi.
 * Chọn xong ô tự xóa để nhập em tiếp theo.
 */
export default function StudentPicker({ students, onPick, className, excludeIds = [], placeholder, disabled, autoFocus }: Props) {
    const [value, setValue] = useState("");
    const exclude = useMemo(() => new Set(excludeIds), [excludeIds]);
    const options = useMemo(
        () =>
            searchByName(
                students.filter((s) => !exclude.has(s._id)),
                value,
                30,
            ).map((s) => ({
                value: s._id,
                label: (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span>{s.fullname}</span>
                        {className && <Tag color="blue">{className(s.classId)}</Tag>}
                    </div>
                ),
            })),
        [students, value, exclude, className],
    );

    return (
        <AutoComplete
            value={value}
            options={options}
            onSearch={setValue}
            onSelect={(id: string) => {
                const s = students.find((x) => x._id === id);
                if (s) onPick(s);
                setValue("");
            }}
            style={{ width: "100%" }}
            disabled={disabled}
            notFoundContent={value ? "Không tìm thấy học sinh" : null}
            autoFocus={autoFocus}
        >
            <Input size="large" prefix={<SearchOutlined />} placeholder={placeholder || "Gõ tên học sinh (không cần dấu)…"} allowClear />
        </AutoComplete>
    );
}
