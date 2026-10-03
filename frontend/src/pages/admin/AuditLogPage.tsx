import { Card, DatePicker, Flex, Input, Select, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { type Dayjs } from "dayjs";
import { useState } from "react";
import { F, type Filter } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import type { AuditLog } from "@/types";
import { fmtDateTime } from "@/utils/date";

const RESOURCE_LABEL: Record<string, string> = {
    "school-year": "Năm học",
    "school-class": "Lớp",
    student: "Học sinh",
    "attendance-report": "Sĩ số",
    violation: "Vi phạm",
    incident: "Sự việc",
    "weekly-report": "Báo cáo tuần",
    complaint: "Khiếu nại",
    "activity-point": "Hoạt động Đoàn",
    "scoring-rule": "Quy chế",
    "competition-week": "Chốt tuần",
    "app-config": "Cấu hình",
    user: "Tài khoản",
};
const ACTION: Record<AuditLog["action"], [string, string]> = { CREATE: ["Thêm", "green"], UPDATE: ["Sửa", "blue"], DELETE: ["Xóa", "red"] };
// Trường hệ thống, không cần hiện trong phần so sánh
const HIDDEN = new Set(["_id", "createdAt", "updatedAt", "password", "results", "nameNoAccent"]);

const show = (v: unknown) => {
    if (v === undefined || v === null || v === "") return <i style={{ color: "#aaa" }}>trống</i>;
    if (typeof v === "object") return <code style={{ fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(v)}</code>;
    return String(v);
};

/** Bảng các trường thay đổi giữa bản cũ và bản mới */
function Diff({ log }: { log: AuditLog }) {
    const oldV = (log.oldValue ?? {}) as Record<string, unknown>;
    const newV = (log.newValue ?? {}) as Record<string, unknown>;
    const keys = [...new Set([...Object.keys(oldV), ...Object.keys(newV)])].filter(
        (k) => !HIDDEN.has(k) && (log.action !== "UPDATE" || JSON.stringify(oldV[k]) !== JSON.stringify(newV[k])),
    );
    if (!keys.length) return <span style={{ color: "#888" }}>Không có trường nào thay đổi</span>;
    return (
        <Table
            size="small"
            rowKey="k"
            pagination={false}
            dataSource={keys.map((k) => ({ k }))}
            columns={[
                { title: "Trường", dataIndex: "k", width: 180 },
                ...(log.action !== "CREATE" ? [{ title: "Giá trị cũ", render: (_: unknown, r: { k: string }) => show(oldV[r.k]) }] : []),
                ...(log.action !== "DELETE" ? [{ title: "Giá trị mới", render: (_: unknown, r: { k: string }) => show(newV[r.k]) }] : []),
            ]}
        />
    );
}

/** Nhật ký thao tác: ai thêm/sửa/xóa gì, lúc nào */
export default function AuditLogPage() {
    const [page, setPage] = useState(1);
    const [resource, setResource] = useState<string>();
    const [action, setAction] = useState<AuditLog["action"]>();
    const [userName, setUserName] = useState("");
    const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const filters: Filter[] = [
        ...(resource ? [F.eq("resource", resource)] : []),
        ...(action ? [F.eq("action", action)] : []),
        ...(userName.trim() ? [F.contain("userName", userName.trim())] : []),
        ...(range?.[0] && range[1] ? [F.between("createdAt", range[0].startOf("day").toISOString(), range[1].endOf("day").toISOString())] : []),
    ];

    const { data, isFetching } = useQuery({
        queryKey: ["audit-log", page, resource, action, userName, range?.map((d) => d?.valueOf())],
        queryFn: () => api.auditLogs.page({ filters, sort: { createdAt: -1 }, page, limit: 20 }),
        placeholderData: (prev) => prev,
    });

    const reset = <T,>(fn: (v: T) => void) => (v: T) => {
        fn(v);
        setPage(1);
    };

    return (
        <>
            <PageHeader title="Nhật ký thao tác" subtitle={data ? `${data.total} bản ghi` : undefined} />
            <Card>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                    <Select
                        allowClear
                        placeholder="Mọi dữ liệu"
                        style={{ width: 170 }}
                        value={resource}
                        onChange={reset(setResource)}
                        options={Object.entries(RESOURCE_LABEL).map(([value, label]) => ({ value, label }))}
                    />
                    <Select
                        allowClear
                        placeholder="Mọi thao tác"
                        style={{ width: 140 }}
                        value={action}
                        onChange={reset(setAction)}
                        options={Object.entries(ACTION).map(([value, [label]]) => ({ value, label }))}
                    />
                    <Input.Search allowClear placeholder="Người thao tác" style={{ width: 220 }} onSearch={reset(setUserName)} />
                    <DatePicker.RangePicker format="DD/MM/YYYY" value={range} onChange={reset(setRange)} />
                </Flex>
                <Table
                    size="small"
                    rowKey="_id"
                    loading={isFetching}
                    dataSource={data?.result}
                    expandable={{ expandedRowRender: (log) => <Diff log={log} /> }}
                    pagination={{ current: page, pageSize: 20, total: data?.total, onChange: setPage, showSizeChanger: false }}
                    columns={[
                        { title: "Thời điểm", dataIndex: "createdAt", width: 150, render: fmtDateTime },
                        { title: "Người thao tác", dataIndex: "userName", width: 200 },
                        { title: "Thao tác", dataIndex: "action", width: 90, render: (a: AuditLog["action"]) => <Tag color={ACTION[a][1]}>{ACTION[a][0]}</Tag> },
                        { title: "Dữ liệu", dataIndex: "resource", width: 140, render: (r: string) => RESOURCE_LABEL[r] ?? r },
                        {
                            title: "Bản ghi",
                            render: (_, log) => {
                                const v = (log.newValue ?? log.oldValue ?? {}) as Record<string, unknown>;
                                const label = v.fullname ?? v.name ?? v.username ?? v.studentName ?? (v.weekNo ? `Tuần ${v.weekNo}` : undefined);
                                return label ? String(label) : <span style={{ color: "#aaa" }}>{log.recordId}</span>;
                            },
                        },
                    ]}
                />
            </Card>
        </>
    );
}
