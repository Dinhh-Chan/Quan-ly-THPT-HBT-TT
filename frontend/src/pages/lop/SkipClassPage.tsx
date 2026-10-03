import { DeleteOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Input, List, Popconfirm, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import LockedNotice from "@/components/common/LockedNotice";
import PageHeader from "@/components/common/PageHeader";
import StudentPicker from "@/components/common/StudentPicker";
import { ROLE_LABEL } from "@/constants";
import { violationKey } from "@/features/scoring/engine";
import { useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { Student } from "@/types";
import { fmtDate } from "@/utils/date";

/** Bỏ giờ / trốn tiết: GV bộ môn phát hiện và yêu cầu lớp trưởng nhập (giám thị cũng nhập được ở màn của mình) */
export default function SkipClassPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user, role, classId, canEdit } = useScope();
    const { date, isLocked } = useWorkingWeek();
    const { className } = useClasses();
    const { data: students = [] } = useStudents(classId);
    const [picked, setPicked] = useState<Student[]>([]);
    const [note, setNote] = useState("");
    const editable = canEdit(isLocked);

    const { data: list = [] } = useQuery({
        queryKey: ["violation", "skip", classId, date],
        enabled: !!classId,
        queryFn: () => api.violations.many({ filters: [F.eq("classId", classId), F.eq("date", date), F.eq("type", "TRON_TIET")] }),
    });

    const save = useMutation({
        mutationFn: async () => {
            const existing = new Set(list.map(violationKey));
            const items = picked
                .map((s) => ({
                    type: "TRON_TIET" as const,
                    studentId: s._id,
                    studentName: s.fullname,
                    classId: s.classId,
                    date,
                    note,
                    source: "MANUAL" as const,
                    createdById: user!._id,
                    createdByName: user!.fullname,
                    createdByRole: role!,
                }))
                .filter((v) => !existing.has(violationKey(v)));
            if (items.length < picked.length) message.warning(`${picked.length - items.length} học sinh đã được ghi trốn tiết hôm nay – bỏ qua`);
            return api.violations.createMany(items);
        },
        onSuccess: (res) => {
            if (res.length) message.success(`Đã ghi ${res.length} lượt bỏ giờ`);
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

    if (!classId) return <Alert type="warning" title="Tài khoản chưa được gán lớp" />;

    return (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <PageHeader title={`Bỏ giờ / trốn tiết – ${className(classId)}`} subtitle={`${fmtDate(date)} · −10 điểm / lượt`} />
            <LockedNotice locked={isLocked} isManager={role === "QUAN_LY"} />
            <Card>
                <StudentPicker students={students} excludeIds={picked.map((p) => p._id)} disabled={!editable} onPick={(s) => setPicked((l) => [...l, s])} />
                <div style={{ margin: "12px 0" }}>
                    {picked.map((s) => (
                        <Tag key={s._id} closable onClose={() => setPicked((l) => l.filter((x) => x._id !== s._id))} style={{ marginBottom: 6, fontSize: 14, padding: "4px 8px" }}>
                            {s.fullname}
                        </Tag>
                    ))}
                </div>
                <Input.TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tiết, môn, GV phát hiện (ví dụ: Tiết 3 – Toán – cô Lan)" rows={2} disabled={!editable} />
                <Button type="primary" block className="big-btn" style={{ marginTop: 12 }} disabled={!editable || !picked.length} loading={save.isPending} onClick={() => save.mutate()}>
                    Lưu {picked.length ? `(${picked.length} học sinh)` : ""}
                </Button>
            </Card>
            <Card title="Đã ghi trong ngày" style={{ marginTop: 12 }}>
                <List
                    dataSource={list}
                    locale={{ emptyText: "Chưa có" }}
                    renderItem={(v) => (
                        <List.Item
                            actions={
                                v.createdById === user?._id && editable
                                    ? [
                                          <Popconfirm key="d" title="Xóa bản ghi?" onConfirm={() => remove.mutate(v._id)}>
                                              <Button size="small" danger type="text" icon={<DeleteOutlined />} />
                                          </Popconfirm>,
                                      ]
                                    : []
                            }
                        >
                            <List.Item.Meta
                                title={v.studentName}
                                description={
                                    <>
                                        {v.note && <div>{v.note}</div>}
                                        <Typography.Text type="secondary">
                                            Nhập bởi {v.createdByName} ({ROLE_LABEL[v.createdByRole]})
                                        </Typography.Text>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}
