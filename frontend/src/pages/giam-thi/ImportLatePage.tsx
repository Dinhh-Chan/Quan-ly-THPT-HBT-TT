import { DeleteOutlined, DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Select, Space, Statistic, Table, Tag, Typography, Upload } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useMemo, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { VIOLATION_LABEL } from "@/constants";
import { violationKey } from "@/features/scoring/engine";
import { useClasses, useLockedWeeks, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { Student, ViolationType } from "@/types";
import { fmtDate, getWeekInfo } from "@/utils/date";
import { exportXlsx, readXlsx } from "@/utils/excel";
import { removeAccent } from "@/utils/text";

dayjs.extend(customParseFormat);

type RowStatus = "ok" | "missing" | "ambiguous" | "duplicate" | "invalid";

interface ImportRow {
    key: number;
    line: number;
    classText: string;
    nameText: string;
    dateText: string;
    typeText: string;
    classId?: string;
    date?: string;
    type?: ViolationType;
    studentId?: string;
    candidates: Student[];
    status: RowStatus;
    error?: string;
}

const TYPE_MAP: [string, ViolationType][] = [
    ["di muon", "DI_MUON"],
    ["muon", "DI_MUON"],
    ["the", "QUEN_THE"],
    ["dong phuc", "DONG_PHUC"],
    ["giay", "GIAY_DEP"],
    ["dep", "GIAY_DEP"],
    ["toc", "DAU_TOC"],
    ["tron", "TRON_TIET"],
    ["bo gio", "TRON_TIET"],
];

const parseType = (t: string): ViolationType | undefined => {
    if (!t.trim()) return "DI_MUON";
    const n = removeAccent(t);
    return TYPE_MAP.find(([k]) => n.includes(k))?.[1];
};

const parseDate = (v: unknown, fallback: string): string | undefined => {
    if (v instanceof Date) return dayjs(v).format("YYYY-MM-DD");
    const s = String(v ?? "").trim();
    if (!s) return fallback;
    const d = dayjs(s, ["DD/MM/YYYY", "D/M/YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "D/M"], true);
    return d.isValid() ? d.format("YYYY-MM-DD") : undefined;
};

const STATUS_TAG: Record<RowStatus, [string, string]> = {
    ok: ["Khớp", "green"],
    missing: ["Không tìm thấy / thiếu họ", "red"],
    ambiguous: ["Trùng tên – chọn đúng em", "gold"],
    duplicate: ["Đã có – bỏ qua", "default"],
    invalid: ["Lỗi dữ liệu", "red"],
};

export default function ImportLatePage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user, role } = useScope();
    const { date: workingDate, year } = useWorkingWeek();
    const { data: lockedWeeks } = useLockedWeeks();
    const { classes, className } = useClasses();
    const { data: students = [] } = useStudents();
    const [rows, setRows] = useState<ImportRow[]>([]);
    const [fileName, setFileName] = useState<string>();
    const [saving, setSaving] = useState(false);

    const byClass = useMemo(() => {
        const m = new Map<string, Student[]>();
        students.forEach((s) => m.set(s.classId, [...(m.get(s.classId) || []), s]));
        return m;
    }, [students]);

    const downloadTemplate = () =>
        exportXlsx("Mau-import-vi-pham", [
            {
                name: "Vi phạm",
                header: [["Lớp", "Họ tên", "Ngày", "Loại lỗi"]],
                rows: [
                    ["10A4", "Dương Gia Khánh", dayjs(workingDate).format("DD/MM/YYYY"), "Đi muộn"],
                    ["10A3", "Hồ Mai Phương", dayjs(workingDate).format("DD/MM/YYYY"), "Đi muộn"],
                ],
                widths: [10, 28, 14, 16],
            },
        ]);

    const handleFile = async (file: File) => {
        setFileName(file.name);
        const data = await readXlsx(file);
        const headerIdx = data.findIndex((r) => r.some((c) => removeAccent(String(c ?? "")) === "lop"));
        if (headerIdx < 0) {
            message.error("Không tìm thấy dòng tiêu đề có cột 'Lớp'");
            return false;
        }
        const header = data[headerIdx].map((c) => removeAccent(String(c ?? "")));
        const col = (...names: string[]) => header.findIndex((h) => names.some((n) => h === n || h.includes(n)));
        const ci = col("lop");
        const ni = col("ho ten", "ho va ten", "ten");
        const di = col("ngay");
        const ti = col("loai loi", "loi");
        if (ni < 0) {
            message.error("Không tìm thấy cột 'Họ tên'");
            return false;
        }

        const existing = await api.violations.many({
            filters: [F.between("date", dayjs(workingDate).subtract(60, "day").format("YYYY-MM-DD"), dayjs(workingDate).add(7, "day").format("YYYY-MM-DD"))],
        });
        const existingKeys = new Set(existing.map(violationKey));
        const classByName = new Map(classes.map((c) => [removeAccent(c.name).replace(/\s/g, ""), c._id]));

        const parsed: ImportRow[] = data
            .slice(headerIdx + 1)
            .filter((r) => String(r[ni] ?? "").trim())
            .map((r, i) => {
                const row: ImportRow = {
                    key: i,
                    line: headerIdx + i + 2,
                    classText: String(r[ci] ?? "").trim(),
                    nameText: String(r[ni] ?? "").trim(),
                    dateText: di >= 0 ? (r[di] instanceof Date ? dayjs(r[di] as Date).format("DD/MM/YYYY") : String(r[di] ?? "")) : "",
                    typeText: ti >= 0 ? String(r[ti] ?? "") : "",
                    candidates: [],
                    status: "ok",
                };
                row.classId = classByName.get(removeAccent(row.classText).replace(/\s/g, ""));
                row.date = parseDate(di >= 0 ? r[di] : "", workingDate);
                row.type = parseType(row.typeText);
                if (!row.classId) return { ...row, status: "invalid", error: `Không có lớp "${row.classText}"` };
                if (!row.date) return { ...row, status: "invalid", error: `Ngày không hợp lệ "${row.dateText}"` };
                if (!row.type) return { ...row, status: "invalid", error: `Không rõ loại lỗi "${row.typeText}"` };
                return matchStudent(row, byClass.get(row.classId) || [], existingKeys);
            });
        setRows(parsed);
        return false;
    };

    const matchStudent = (row: ImportRow, list: Student[], existingKeys: Set<string>): ImportRow => {
        const key = removeAccent(row.nameText);
        const exact = list.filter((s) => s.nameNoAccent === key);
        if (exact.length === 1) {
            const k = violationKey({ studentId: exact[0]._id, classId: row.classId!, type: row.type!, date: row.date! });
            return { ...row, studentId: exact[0]._id, candidates: exact, status: existingKeys.has(k) ? "duplicate" : "ok" };
        }
        if (exact.length > 1) return { ...row, candidates: exact, status: "ambiguous" };
        // Tên chưa đủ họ ("Thu", "Tuấn Minh"): gợi ý các em có tên kết thúc như vậy
        const partial = list.filter((s) => s.nameNoAccent.endsWith(` ${key}`) || s.nameNoAccent.split(" ").includes(key));
        return { ...row, candidates: partial, status: "missing", error: partial.length ? "Tên chưa đủ họ – chọn đúng em" : "Không có trong danh sách lớp" };
    };

    const pickStudent = (key: number, studentId: string) =>
        setRows((l) => l.map((r) => (r.key === key ? { ...r, studentId, status: "ok", error: undefined } : r)));

    const isWeekLocked = (d: string) => {
        const w = getWeekInfo(year ?? undefined, d);
        return !!w && !!lockedWeeks?.some((x) => x.weekNo === w.weekNo);
    };

    const valid = rows.filter((r) => r.status === "ok" && r.studentId && !isWeekLocked(r.date!));
    const counts = {
        ok: valid.length,
        bad: rows.filter((r) => r.status === "missing" || r.status === "invalid" || r.status === "ambiguous").length,
        dup: rows.filter((r) => r.status === "duplicate").length,
    };

    const confirm = async () => {
        setSaving(true);
        try {
            const seen = new Set<string>();
            const items = valid
                .map((r) => {
                    const s = students.find((x) => x._id === r.studentId)!;
                    return {
                        type: r.type!,
                        studentId: s._id,
                        studentName: s.fullname,
                        classId: s.classId,
                        date: r.date!,
                        source: "EXCEL" as const,
                        createdById: user!._id,
                        createdByName: user!.fullname,
                        createdByRole: role!,
                        createdAt: new Date().toISOString(),
                    };
                })
                .filter((v) => {
                    const k = violationKey(v);
                    if (seen.has(k)) return false;
                    seen.add(k);
                    return true;
                });
            await api.violations.createMany(items);
            message.success(`Đã ghi ${items.length} dòng hợp lệ`);
            setRows([]);
            setFileName(undefined);
            qc.invalidateQueries({ queryKey: ["violation"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
        } catch (e) {
            message.error((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Import Excel đi muộn / vi phạm"
                subtitle="Cột: Lớp, Họ tên, Ngày, Loại lỗi (bỏ trống ngày = ngày làm việc, bỏ trống loại = đi muộn)"
                extra={
                    <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
                        Tải file mẫu
                    </Button>
                }
            />
            {!rows.length ? (
                <Upload.Dragger accept=".xlsx" showUploadList={false} beforeUpload={handleFile}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p>Kéo thả hoặc bấm để chọn file .xlsx</p>
                </Upload.Dragger>
            ) : (
                <Card
                    title={fileName}
                    extra={
                        <Space>
                            <Button onClick={() => setRows([])}>Hủy</Button>
                            <Button type="primary" disabled={!valid.length} loading={saving} onClick={confirm}>
                                Xác nhận ghi {valid.length} dòng
                            </Button>
                        </Space>
                    }
                >
                    <Space size={32} style={{ marginBottom: 12 }} wrap>
                        <Statistic title="Hợp lệ" value={counts.ok} styles={{ content: { color: "#389e0d" } }} />
                        <Statistic title="Cần sửa" value={counts.bad} styles={{ content: { color: "#cf1322" } }} />
                        <Statistic title="Đã có trong hệ thống" value={counts.dup} />
                    </Space>
                    {rows.some((r) => r.date && isWeekLocked(r.date)) && <Alert type="warning" showIcon title="Có dòng thuộc tuần đã chốt – sẽ không được ghi." style={{ marginBottom: 12 }} />}
                    <Table
                        size="small"
                        rowKey="key"
                        dataSource={rows}
                        pagination={{ pageSize: 50 }}
                        scroll={{ x: 900 }}
                        onRow={(r) => ({
                            style: {
                                background:
                                    r.status === "ok" ? "#f6ffed" : r.status === "ambiguous" ? "#fffbe6" : r.status === "duplicate" ? "#fafafa" : "#fff1f0",
                            },
                        })}
                        columns={[
                            { title: "Dòng", dataIndex: "line", width: 60 },
                            { title: "Lớp", dataIndex: "classText", width: 70 },
                            { title: "Họ tên trong file", dataIndex: "nameText" },
                            { title: "Ngày", render: (_, r) => (r.date ? fmtDate(r.date) : r.dateText), width: 100 },
                            { title: "Lỗi", render: (_, r) => (r.type ? VIOLATION_LABEL[r.type] : r.typeText), width: 100 },
                            {
                                title: "Học sinh trong hệ thống",
                                width: 280,
                                render: (_, r) =>
                                    r.status === "invalid" ? (
                                        <Typography.Text type="danger">{r.error}</Typography.Text>
                                    ) : r.status === "duplicate" ? (
                                        <Typography.Text type="secondary">{students.find((s) => s._id === r.studentId)?.fullname}</Typography.Text>
                                    ) : (
                                        <Select
                                            style={{ width: "100%" }}
                                            value={r.studentId}
                                            placeholder={r.error || "Chọn học sinh"}
                                            showSearch={{
                                                filterOption: (input, opt) => removeAccent(String(opt?.label ?? "")).includes(removeAccent(input)),
                                            }}
                                            onChange={(v) => pickStudent(r.key, v)}
                                            options={(r.candidates.length && r.status !== "ok" ? r.candidates : byClass.get(r.classId!) || []).map((s) => ({
                                                value: s._id,
                                                label: `${s.fullname} (${s.code})`,
                                            }))}
                                        />
                                    ),
                            },
                            {
                                title: "Trạng thái",
                                width: 190,
                                render: (_, r) => <Tag color={STATUS_TAG[r.status][1]}>{STATUS_TAG[r.status][0]}</Tag>,
                            },
                            {
                                title: "",
                                width: 50,
                                render: (_, r) => <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => setRows((l) => l.filter((x) => x.key !== r.key))} />,
                            },
                        ]}
                    />
                    <Typography.Text type="secondary">Lớp: {[...new Set(rows.map((r) => r.classId).filter(Boolean))].map((id) => className(id)).join(", ")}</Typography.Text>
                </Card>
            )}
        </>
    );
}
