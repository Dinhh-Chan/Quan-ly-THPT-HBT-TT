import { DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Input, List, Popconfirm, Row, Segmented, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import ClassSelect from "@/components/common/ClassSelect";
import LockedNotice from "@/components/common/LockedNotice";
import PageHeader from "@/components/common/PageHeader";
import StudentPicker from "@/components/common/StudentPicker";
import { QUICK_VIOLATIONS, VIOLATION_LABEL } from "@/constants";
import { violationKey } from "@/features/scoring/engine";
import { useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { Student, ViolationType } from "@/types";
import { fmtDate } from "@/utils/date";

export default function QuickViolationPage() {
    const { message, modal } = App.useApp();
    const qc = useQueryClient();
    const { user, role, canEdit } = useScope();
    const { date, isLocked } = useWorkingWeek();
    const { className } = useClasses();
    const [type, setType] = useState<ViolationType>("DI_MUON");
    const [filterClass, setFilterClass] = useState<string>();
    const [picked, setPicked] = useState<Student[]>([]);
    const [note, setNote] = useState("");
    const [listFilter, setListFilter] = useState<"all" | "mine">("all");
    const { data: allStudents = [] } = useStudents();
    const students = useMemo(() => (filterClass ? allStudents.filter((s) => s.classId === filterClass) : allStudents), [allStudents, filterClass]);
    const editable = canEdit(isLocked);

    // "Hôm nay đã nhập" cập nhật liên tục để các giám thị thấy nhau
    const { data: today = [] } = useQuery({
        queryKey: ["violation", "day", date],
        queryFn: () => api.violations.many({ filters: [F.eq("date", date), F.in("type", QUICK_VIOLATIONS)], sort: { createdAt: -1 } }),
        refetchInterval: 10_000,
    });

    const save = useMutation({
        mutationFn: async () => {
            const fresh = await api.violations.many({ filters: [F.eq("date", date), F.eq("type", type)] });
            const existing = new Map(fresh.map((v) => [violationKey(v), v]));
            const dup: string[] = [];
            const items = picked
                .map((s) => ({
                    type,
                    studentId: s._id,
                    studentName: s.fullname,
                    classId: s.classId,
                    date,
                    note: note || undefined,
                    source: "MANUAL" as const,
                    createdById: user!._id,
                    createdByName: user!.fullname,
                    createdByRole: role!,
                    createdAt: new Date().toISOString(),
                }))
                .filter((v) => {
                    const old = existing.get(violationKey(v));
                    if (old) dup.push(`${v.studentName} (đã nhập bởi ${old.createdByName})`);
                    return !old;
                });
            const res = await api.violations.createMany(items);
            return { res, dup };
        },
        onSuccess: ({ res, dup }) => {
            if (res.length) message.success(`Đã lưu ${res.length} lượt ${VIOLATION_LABEL[type].toLowerCase()}`);
            if (dup.length)
                modal.warning({
                    title: "Trùng – chỉ tính 1 lần",
                    content: (
                        <ul>
                            {dup.map((d) => (
                                <li key={d}>{d}</li>
                            ))}
                        </ul>
                    ),
                });
            setPicked([]);
            setNote("");
            qc.invalidateQueries({ queryKey: ["violation"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.violations.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["violation"] }),
    });

    const shown = today.filter((v) => listFilter === "all" || v.createdById === user?._id);
    const countByType = (t: ViolationType) => today.filter((v) => v.type === t).length;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={13}>
                <PageHeader title="Nhập nhanh vi phạm" subtitle={`Ngày ${fmtDate(date)}`} />
                <LockedNotice locked={isLocked} />
                <Card>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, marginBottom: 16 }}>
                        {QUICK_VIOLATIONS.map((t) => (
                            <div key={t} className="vio-btn">
                                <Button block className="big-btn" type={type === t ? "primary" : "default"} onClick={() => setType(t)}>
                                    {VIOLATION_LABEL[t]}
                                </Button>
                                {countByType(t) > 0 && <span className="vio-count">{countByType(t)}</span>}
                            </div>
                        ))}
                    </div>
                    <Row gutter={8}>
                        <Col xs={24} sm={8} style={{ marginBottom: 8 }}>
                            <ClassSelect value={filterClass} onChange={setFilterClass} allowAll style={{ width: "100%" }} />
                        </Col>
                        <Col xs={24} sm={16}>
                            <StudentPicker
                                students={students}
                                className={className}
                                excludeIds={picked.map((p) => p._id)}
                                disabled={!editable}
                                onPick={(s) => setPicked((l) => [...l, s])}
                                placeholder="Tìm học sinh toàn trường…"
                            />
                        </Col>
                    </Row>
                    <div style={{ margin: "12px 0", minHeight: 32 }}>
                        {picked.map((s) => (
                            <Tag key={s._id} closable onClose={() => setPicked((l) => l.filter((x) => x._id !== s._id))} style={{ padding: "4px 8px", marginBottom: 6, fontSize: 14 }}>
                                {s.fullname} – {className(s.classId)}
                            </Tag>
                        ))}
                    </div>
                    {(type === "KHAC" || type === "TRON_TIET") && (
                        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tiết, nội dung lỗi…)" style={{ marginBottom: 12 }} />
                    )}
                    <Button type="primary" block className="big-btn" icon={<SaveOutlined />} disabled={!picked.length || !editable} loading={save.isPending} onClick={() => save.mutate()}>
                        Lưu {VIOLATION_LABEL[type]} {picked.length ? `(${picked.length})` : ""}
                    </Button>
                </Card>
            </Col>
            <Col xs={24} lg={11}>
                <Card
                    title={`Hôm nay đã nhập (${today.length})`}
                    extra={
                        <Segmented
                            size="small"
                            value={listFilter}
                            onChange={(v) => setListFilter(v as "all" | "mine")}
                            options={[
                                { label: "Tất cả", value: "all" },
                                { label: "Của tôi", value: "mine" },
                            ]}
                        />
                    }
                    styles={{ body: { maxHeight: 640, overflow: "auto" } }}
                >
                    <List
                        size="small"
                        dataSource={shown}
                        locale={{ emptyText: "Chưa có" }}
                        renderItem={(v) => (
                            <List.Item
                                actions={
                                    v.createdById === user?._id && editable
                                        ? [
                                              <Popconfirm key="d" title="Xóa bản ghi?" onConfirm={() => remove.mutate(v._id)}>
                                                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                              </Popconfirm>,
                                          ]
                                        : []
                                }
                            >
                                <List.Item.Meta
                                    title={
                                        <>
                                            {v.studentName} <Tag color="blue">{className(v.classId)}</Tag>
                                        </>
                                    }
                                    description={
                                        <Typography.Text type="secondary">
                                            <Tag>{VIOLATION_LABEL[v.type]}</Tag>
                                            {v.createdByName}
                                            {v.source === "EXCEL" && " · Excel"}
                                        </Typography.Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>
        </Row>
    );
}
