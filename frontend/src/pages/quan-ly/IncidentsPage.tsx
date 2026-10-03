import { Alert, App, Button, Card, Descriptions, Drawer, Flex, Image, Input, Select, Space, Steps, Table, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { DOWNGRADE_INCIDENTS, INCIDENT_LABEL, INCIDENT_STATUS_COLOR, INCIDENT_STATUS_LABEL } from "@/constants";
import { useClasses, useLockedWeeks, useScope, useWorkingWeek } from "@/hooks/useData";
import type { Incident, IncidentStatus, IncidentType } from "@/types";
import { fmtDateTime, getWeekInfo } from "@/utils/date";

const STEP_INDEX: Record<IncidentStatus, number> = { MOI: 0, DA_TIEP_NHAN: 1, DA_XAC_MINH: 2, DA_XU_LY: 3 };

const minutesBetween = (a?: string, b?: string) => (a && b ? dayjs(b).diff(dayjs(a), "minute") : null);
const fmtDuration = (m: number | null) => (m === null ? "–" : m < 60 ? `${m} phút` : `${Math.floor(m / 60)} giờ ${m % 60} phút`);

export default function IncidentsPage() {
    const [params, setParams] = useSearchParams();
    const { className } = useClasses();
    const [status, setStatus] = useState<IncidentStatus[]>(["MOI", "DA_TIEP_NHAN", "DA_XAC_MINH"]);
    const [types, setTypes] = useState<IncidentType[]>([]);

    const { data = [], isFetching } = useQuery({
        queryKey: ["incident", "admin", status, types],
        queryFn: () =>
            api.incidents.many({
                filters: [...(status.length ? [F.in("status", status)] : []), ...(types.length ? [F.in("type", types)] : [])],
                sort: { createdAt: -1 },
            }),
        refetchInterval: 30_000,
    });
    const sorted = [...data].sort(
        (a, b) => Number(b.status === "MOI") - Number(a.status === "MOI") || Number(b.severity === "KHAN_CAP") - Number(a.severity === "KHAN_CAP"),
    );
    const openId = params.get("id");

    return (
        <>
            <PageHeader title="Sự việc bất thường" subtitle="Tiếp nhận → xác minh → xử lý. Chỉ sự việc xác minh là vi phạm (tiêu chí 2.6–2.10) mới hạ bậc thi đua." />
            <Card>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Mọi trạng thái"
                        style={{ minWidth: 300 }}
                        value={status}
                        onChange={setStatus}
                        options={(Object.keys(INCIDENT_STATUS_LABEL) as IncidentStatus[]).map((s) => ({ value: s, label: INCIDENT_STATUS_LABEL[s] }))}
                    />
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Mọi loại sự việc"
                        style={{ minWidth: 260 }}
                        value={types}
                        onChange={setTypes}
                        options={(Object.keys(INCIDENT_LABEL) as IncidentType[]).map((t) => ({ value: t, label: INCIDENT_LABEL[t] }))}
                    />
                </Flex>
                <Table
                    size="small"
                    rowKey="_id"
                    loading={isFetching && !data.length}
                    dataSource={sorted}
                    scroll={{ x: 900 }}
                    onRow={(r) => ({ onClick: () => setParams({ id: r._id }), style: { cursor: "pointer" } })}
                    columns={[
                        { title: "Thời điểm", dataIndex: "occurredAt", render: fmtDateTime, width: 140 },
                        {
                            title: "Loại",
                            render: (_, i) => (
                                <>
                                    {i.severity === "KHAN_CAP" && <Tag color="red">KHẨN</Tag>}
                                    {INCIDENT_LABEL[i.type]}
                                </>
                            ),
                        },
                        { title: "Lớp", render: (_, i) => i.classIds.map(className).join(", "), width: 90 },
                        { title: "Học sinh", render: (_, i) => i.students.map((s) => s.studentName).join(", ") || "–" },
                        { title: "Người báo", dataIndex: "reporterName", responsive: ["lg"] },
                        { title: "Trạng thái", dataIndex: "status", width: 120, render: (s: IncidentStatus) => <Tag color={INCIDENT_STATUS_COLOR[s]}>{INCIDENT_STATUS_LABEL[s]}</Tag> },
                        {
                            title: "Tiếp nhận sau",
                            width: 120,
                            render: (_, i) => {
                                const m = minutesBetween(i.createdAt, i.receivedAt ?? (i.status === "MOI" ? new Date().toISOString() : undefined));
                                return <Typography.Text type={i.status === "MOI" && (m ?? 0) >= 15 ? "danger" : undefined}>{fmtDuration(m)}</Typography.Text>;
                            },
                        },
                    ]}
                />
            </Card>
            <IncidentDrawer id={openId} onClose={() => setParams({})} />
        </>
    );
}

function IncidentDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user } = useScope();
    const { year } = useWorkingWeek();
    const { data: locked } = useLockedWeeks();
    const { className } = useClasses();
    const [handling, setHandling] = useState("");

    const { data: inc } = useQuery({ queryKey: ["incident", "one", id], enabled: !!id, queryFn: () => api.incidents.byId(id!) });

    const update = useMutation({
        mutationFn: (dto: Partial<Incident>) => api.incidents.update(id!, dto),
        onSuccess: () => {
            message.success("Đã cập nhật sự việc");
            qc.invalidateQueries({ queryKey: ["incident"] });
            qc.invalidateQueries({ queryKey: ["notifications"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const now = () => new Date().toISOString();
    const week = inc ? getWeekInfo(year ?? undefined, inc.date) : null;
    const weekLocked = !!week && !!locked?.some((w) => w.weekNo === week.weekNo);
    const affectsScore = inc && DOWNGRADE_INCIDENTS.includes(inc.type);

    return (
        <Drawer open={!!id} onClose={onClose} size={560} title={inc ? INCIDENT_LABEL[inc.type] : "Sự việc"}>
            {inc && (
                <>
                    {inc.severity === "KHAN_CAP" && <Alert type="error" showIcon title="Mức độ KHẨN CẤP – cần can thiệp ngay" style={{ marginBottom: 12 }} />}
                    <Steps
                        size="small"
                        current={STEP_INDEX[inc.status]}
                        style={{ marginBottom: 16 }}
                        items={[
                            { title: "Mới", content: fmtDateTime(inc.createdAt) },
                            { title: "Tiếp nhận", content: inc.receivedByName },
                            { title: "Xác minh", content: inc.verifyResult === "VI_PHAM" ? "Vi phạm" : inc.verifyResult === "KHONG_VI_PHAM" ? "Không vi phạm" : undefined },
                            { title: "Xử lý", content: fmtDateTime(inc.handledAt) },
                        ]}
                    />
                    <Descriptions size="small" column={1} bordered>
                        <Descriptions.Item label="Thời điểm">{fmtDateTime(inc.occurredAt)}</Descriptions.Item>
                        <Descriptions.Item label="Địa điểm">{inc.location || "–"}</Descriptions.Item>
                        <Descriptions.Item label="Học sinh">
                            {inc.students.length ? inc.students.map((s) => `${s.studentName} (${className(s.classId)})`).join(", ") : "–"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">{inc.description || "–"}</Descriptions.Item>
                        <Descriptions.Item label="Người báo">{inc.reporterName}</Descriptions.Item>
                        {inc.handling && <Descriptions.Item label="Hình thức xử lý">{inc.handling}</Descriptions.Item>}
                    </Descriptions>
                    {!!inc.photos?.length && (
                        <Image.PreviewGroup>
                            <Space style={{ marginTop: 12 }} wrap>
                                {inc.photos.map((p, i) => (
                                    <Image key={i} src={p} width={100} height={100} style={{ objectFit: "cover", borderRadius: 6 }} />
                                ))}
                            </Space>
                        </Image.PreviewGroup>
                    )}

                    <Card size="small" title="Thao tác" style={{ marginTop: 16 }}>
                        {inc.status === "MOI" && (
                            <Button type="primary" block loading={update.isPending} onClick={() => update.mutate({ status: "DA_TIEP_NHAN", receivedByName: user!.fullname, receivedAt: now() })}>
                                Tiếp nhận
                            </Button>
                        )}
                        {inc.status === "DA_TIEP_NHAN" && (
                            <>
                                {affectsScore && (
                                    <Alert
                                        type={weekLocked ? "warning" : "info"}
                                        showIcon
                                        style={{ marginBottom: 8 }}
                                        title={`Xác minh "Vi phạm thật" sẽ hạ 1 bậc thi đua tuần ${week?.weekNo ?? "?"} của lớp ${inc.classIds.map(className).join(", ")}.${weekLocked ? " Tuần này đã chốt – cần mở chốt để tính lại." : ""}`}
                                    />
                                )}
                                <Flex gap={8}>
                                    <Button danger type="primary" style={{ flex: 1 }} onClick={() => update.mutate({ status: "DA_XAC_MINH", verifyResult: "VI_PHAM", verifiedAt: now() })}>
                                        Vi phạm thật
                                    </Button>
                                    <Button style={{ flex: 1 }} onClick={() => update.mutate({ status: "DA_XAC_MINH", verifyResult: "KHONG_VI_PHAM", verifiedAt: now() })}>
                                        Không vi phạm
                                    </Button>
                                </Flex>
                            </>
                        )}
                        {inc.status === "DA_XAC_MINH" && (
                            <>
                                <Input.TextArea rows={3} placeholder="Hình thức xử lý (mời phụ huynh, kiểm điểm…)" value={handling} onChange={(e) => setHandling(e.target.value)} />
                                <Button
                                    type="primary"
                                    block
                                    style={{ marginTop: 8 }}
                                    disabled={!handling.trim()}
                                    onClick={() => {
                                        update.mutate({ status: "DA_XU_LY", handling: handling.trim(), handledAt: now() });
                                        setHandling("");
                                    }}
                                >
                                    Hoàn tất xử lý
                                </Button>
                            </>
                        )}
                        {inc.status === "DA_XU_LY" && (
                            <Typography.Text type="success">
                                Đã xử lý xong · thời gian từ khi báo đến khi xử lý: {fmtDuration(minutesBetween(inc.createdAt, inc.handledAt))}
                            </Typography.Text>
                        )}
                    </Card>
                </>
            )}
        </Drawer>
    );
}
