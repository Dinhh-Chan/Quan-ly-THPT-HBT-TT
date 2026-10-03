import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { App, Button, Card, DatePicker, Flex, Popconfirm, Segmented, Select, Table, Tag } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import ClassSelect from "@/components/common/ClassSelect";
import PageHeader from "@/components/common/PageHeader";
import { VIOLATION_LABEL } from "@/constants";
import { useClasses, useLockedWeeks, useScope, useWorkingWeek } from "@/hooks/useData";
import type { Violation, ViolationType } from "@/types";
import { fmtDate, getWeekInfo } from "@/utils/date";
import { exportXlsx } from "@/utils/excel";

/** Bố cục "Bảng theo dõi nền nếp học sinh" hiện tại */
const TRACKING_COLS: [string, ViolationType][] = [
    ["Vệ sinh", "VE_SINH_BAN"],
    ["Đi muộn", "DI_MUON"],
    ["Thẻ", "QUEN_THE"],
    ["Giày dép", "GIAY_DEP"],
    ["Đồng phục", "DONG_PHUC"],
    ["Đầu tóc", "DAU_TOC"],
];

export default function ViolationListPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user, isManager } = useScope();
    const { week, year } = useWorkingWeek();
    const { data: locked } = useLockedWeeks();
    const { classes, className } = useClasses();
    const [range, setRange] = useState<[string, string]>();
    const [classId, setClassId] = useState<string>();
    const [types, setTypes] = useState<ViolationType[]>([]);
    const [who, setWho] = useState<"all" | "mine">("all");

    useEffect(() => {
        if (week && !range) setRange([week.startDate, week.endDate]);
    }, [week, range]);

    const { data = [], isFetching } = useQuery({
        queryKey: ["violation", "list", range, classId, types, who],
        enabled: !!range,
        queryFn: () =>
            api.violations.many({
                filters: [
                    F.between("date", range![0], range![1]),
                    ...(classId ? [F.eq("classId", classId)] : []),
                    ...(types.length ? [F.in("type", types)] : []),
                    ...(who === "mine" ? [F.eq("createdById", user!._id)] : []),
                ],
                sort: { date: -1 },
            }),
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.violations.remove(id),
        onSuccess: () => {
            message.success("Đã xóa");
            qc.invalidateQueries({ queryKey: ["violation"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const canDelete = (v: Violation) => {
        const w = getWeekInfo(year ?? undefined, v.date);
        const isLocked = !!w && !!locked?.some((x) => x.weekNo === w.weekNo);
        return isManager || (v.createdById === user?._id && !isLocked);
    };

    const exportTracking = () => {
        const label = range ? `${fmtDate(range[0])} – ${fmtDate(range[1])}` : "";
        const cell = (list: Violation[]) => list.map((v) => (v.studentName ? `${v.studentName} (${dayjs(v.date).format("DD/MM")})` : dayjs(v.date).format("DD/MM"))).join("\n");
        exportXlsx(`Bang-theo-doi-nen-nep-${range?.[0]}`, [
            {
                name: "Theo dõi nền nếp",
                title: `BẢNG THEO DÕI NỀN NẾP HỌC SINH (${label})`,
                header: [["Lớp", ...TRACKING_COLS.map(([l]) => l)]],
                rows: classes
                    .filter((c) => !classId || c._id === classId)
                    .map((c) => [c.name, ...TRACKING_COLS.map(([, t]) => cell(data.filter((v) => v.classId === c._id && v.type === t)))]),
                widths: [8, 14, 34, 30, 30, 30, 30],
            },
            {
                name: "Danh sách",
                header: [["Ngày", "Lớp", "Học sinh", "Lỗi", "Ghi chú", "Người nhập", "Nguồn"]],
                rows: data.map((v) => [fmtDate(v.date), className(v.classId), v.studentName ?? "(Cả lớp)", VIOLATION_LABEL[v.type], v.note ?? "", v.createdByName, v.source === "EXCEL" ? "Excel" : "Nhập tay"]),
                widths: [12, 8, 28, 16, 24, 22, 10],
            },
        ]);
    };

    return (
        <>
            <PageHeader
                title="Danh sách vi phạm nền nếp"
                subtitle={`${data.length} lượt`}
                extra={
                    <Button icon={<DownloadOutlined />} onClick={exportTracking} disabled={!data.length}>
                        Xuất Excel (bảng theo dõi)
                    </Button>
                }
            />
            <Card>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                    <DatePicker.RangePicker
                        value={range ? [dayjs(range[0]), dayjs(range[1])] : null}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        onChange={(v) => v?.[0] && v[1] && setRange([v[0].format("YYYY-MM-DD"), v[1].format("YYYY-MM-DD")])}
                    />
                    <ClassSelect value={classId} onChange={setClassId} allowAll />
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Loại lỗi"
                        style={{ minWidth: 200 }}
                        value={types}
                        onChange={setTypes}
                        options={(Object.keys(VIOLATION_LABEL) as ViolationType[]).map((t) => ({ value: t, label: VIOLATION_LABEL[t] }))}
                    />
                    <Segmented
                        value={who}
                        onChange={(v) => setWho(v as "all" | "mine")}
                        options={[
                            { label: "Tất cả", value: "all" },
                            { label: "Tôi nhập", value: "mine" },
                        ]}
                    />
                </Flex>
                <Table
                    size="small"
                    rowKey="_id"
                    loading={isFetching}
                    dataSource={data}
                    scroll={{ x: 800 }}
                    pagination={{ pageSize: 30, showSizeChanger: true }}
                    columns={[
                        { title: "Ngày", dataIndex: "date", render: fmtDate, width: 100 },
                        { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                        { title: "Học sinh", dataIndex: "studentName", render: (v) => v || <i>(Cả lớp)</i> },
                        { title: "Lỗi", dataIndex: "type", render: (t: ViolationType) => <Tag>{VIOLATION_LABEL[t]}</Tag> },
                        { title: "Ghi chú", dataIndex: "note", responsive: ["lg"] },
                        { title: "Người nhập", dataIndex: "createdByName" },
                        { title: "Nguồn", dataIndex: "source", render: (s) => (s === "EXCEL" ? <Tag color="green">Excel</Tag> : "Tay"), width: 70 },
                        {
                            title: "",
                            width: 50,
                            render: (_, v) =>
                                canDelete(v) && (
                                    <Popconfirm title="Xóa bản ghi?" onConfirm={() => remove.mutate(v._id)}>
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                ),
                        },
                    ]}
                />
            </Card>
        </>
    );
}
