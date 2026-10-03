import { CheckCircleOutlined, DeleteOutlined, SendOutlined } from "@ant-design/icons";
import { Alert, App, AutoComplete, Button, Card, Col, Empty, Flex, Popconfirm, Row, Segmented, Space, Statistic, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import LockedNotice from "@/components/common/LockedNotice";
import PageHeader from "@/components/common/PageHeader";
import StudentPicker from "@/components/common/StudentPicker";
import { ABSENCE_REASONS } from "@/constants";
import { useAppConfig, useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { Absence, AbsenceSession, Session } from "@/types";
import { fmtDate, fmtDateTime, todayStr, WEEKDAY_LABEL } from "@/utils/date";

export default function AttendancePage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user, classId, canEdit, role } = useScope();
    const { date, isLocked, year } = useWorkingWeek();
    const { data: cfg } = useAppConfig();
    const { className } = useClasses();
    const { data: students = [] } = useStudents(classId);
    const [session, setSession] = useState<Session>("SANG");
    const [absences, setAbsences] = useState<Absence[]>([]);

    const { data: report, isFetched } = useQuery({
        queryKey: ["attendance-report", classId, date, session],
        enabled: !!classId,
        queryFn: () => api.attendance.one({ filters: [F.eq("classId", classId), F.eq("date", date), F.eq("session", session)] }),
    });

    useEffect(() => {
        if (isFetched) setAbsences(report?.absences ?? []);
    }, [report, isFetched]);

    const editable = canEdit(isLocked);
    const total = students.length;
    const isHoliday = dayjs(date).day() === 0 || year?.holidays.includes(date);
    const lateNow = date === todayStr() && !report && cfg && dayjs().format("HH:mm") > cfg.attendanceDeadline;

    const save = useMutation({
        mutationFn: async (list: Absence[]) => {
            const dto = {
                classId,
                date,
                session,
                total,
                absentCount: list.length,
                presentCount: total - list.length,
                absences: list,
                reporterId: user!._id,
                reporterName: `${user!.fullname}${role === "GVCN" ? " (GVCN)" : ""}`,
                submittedAt: new Date().toISOString(),
            };
            return report ? api.attendance.update(report._id, dto) : api.attendance.create(dto);
        },
        onSuccess: () => {
            message.success(report ? "Đã cập nhật báo cáo sĩ số" : "Đã gửi báo cáo sĩ số");
            qc.invalidateQueries({ queryKey: ["attendance-report"] });
            qc.invalidateQueries({ queryKey: ["notifications"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const patch = (studentId: string, p: Partial<Absence>) =>
        setAbsences((list) => list.map((a) => (a.studentId === studentId ? { ...a, ...p } : a)));

    if (!classId) return <Alert type="warning" title="Tài khoản chưa được gán lớp" />;

    return (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <PageHeader
                title={`Sĩ số lớp ${className(classId)}`}
                subtitle={`${WEEKDAY_LABEL[dayjs(date).day()]}, ${fmtDate(date)} · chốt trước ${cfg?.attendanceDeadline ?? "08:00"}`}
                extra={
                    <Segmented
                        value={session}
                        onChange={(v) => setSession(v as Session)}
                        options={[
                            { label: "Buổi sáng", value: "SANG" },
                            { label: "Buổi chiều", value: "CHIEU" },
                        ]}
                    />
                }
            />
            <LockedNotice locked={isLocked} isManager={role === "QUAN_LY"} />
            {isHoliday && <Alert type="info" showIcon title="Ngày nghỉ (Chủ nhật / ngày lễ)" style={{ marginBottom: 12 }} />}
            {lateNow && <Alert type="error" showIcon title="Đã quá giờ chốt sĩ số – vui lòng báo cáo ngay" style={{ marginBottom: 12 }} />}
            {report && (
                <Alert
                    type="success"
                    showIcon
                    style={{ marginBottom: 12 }}
                    title={`Đã báo cáo lúc ${fmtDateTime(report.submittedAt)} bởi ${report.reporterName}`}
                    description={editable ? "Vẫn có thể sửa (ví dụ học sinh đến muộn sau khi đã báo vắng). Mỗi lần sửa được ghi nhật ký." : undefined}
                />
            )}

            <Card>
                <Row gutter={12}>
                    <Col span={8}>
                        <Statistic title="Sĩ số" value={total} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Vắng" value={absences.length} styles={{ content: { color: absences.length ? "#cf1322" : undefined } }} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Có mặt" value={total - absences.length} styles={{ content: { color: "#389e0d" } }} />
                    </Col>
                </Row>
            </Card>

            <Card style={{ marginTop: 12 }} title="Học sinh vắng">
                <StudentPicker
                    students={students}
                    excludeIds={absences.map((a) => a.studentId)}
                    disabled={!editable}
                    onPick={(s) => setAbsences((l) => [...l, { studentId: s._id, studentName: s.fullname, excused: false, reason: "", session: session === "SANG" ? "SANG" : "CHIEU" }])}
                />
                <div style={{ marginTop: 12 }}>
                    {absences.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có học sinh vắng" />
                    ) : (
                        <Space orientation="vertical" style={{ width: "100%" }} size={8}>
                            {absences.map((a, i) => (
                                <Card key={a.studentId} size="small" styles={{ body: { padding: 10 } }}>
                                    <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                                        <Typography.Text strong>
                                            {i + 1}. {a.studentName}
                                        </Typography.Text>
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} disabled={!editable} onClick={() => setAbsences((l) => l.filter((x) => x.studentId !== a.studentId))} />
                                    </Flex>
                                    <Flex gap={8} wrap>
                                        <Segmented
                                            disabled={!editable}
                                            value={a.excused ? "P" : "K"}
                                            onChange={(v) => patch(a.studentId, { excused: v === "P" })}
                                            options={[
                                                { label: "Có phép", value: "P" },
                                                { label: <span style={{ color: "#cf1322" }}>Không phép</span>, value: "K" },
                                            ]}
                                        />
                                        <Segmented
                                            disabled={!editable}
                                            value={a.session}
                                            onChange={(v) => patch(a.studentId, { session: v as AbsenceSession })}
                                            options={[
                                                { label: "Sáng", value: "SANG" },
                                                { label: "Chiều", value: "CHIEU" },
                                                { label: "Cả ngày", value: "CA_NGAY" },
                                            ]}
                                        />
                                        <AutoComplete
                                            disabled={!editable}
                                            value={a.reason}
                                            onChange={(v) => patch(a.studentId, { reason: v })}
                                            options={ABSENCE_REASONS.map((r) => ({ value: r }))}
                                            placeholder="Lý do"
                                            style={{ flex: 1, minWidth: 160 }}
                                        />
                                    </Flex>
                                </Card>
                            ))}
                        </Space>
                    )}
                </div>
            </Card>

            <Flex gap={12} style={{ marginTop: 16 }} wrap>
                <Popconfirm
                    title="Xác nhận lớp đủ sĩ số?"
                    description={absences.length ? "Danh sách vắng hiện tại sẽ bị xóa." : undefined}
                    onConfirm={() => {
                        setAbsences([]);
                        save.mutate([]);
                    }}
                    disabled={!editable}
                >
                    <Button className="big-btn" icon={<CheckCircleOutlined />} style={{ flex: 1 }} disabled={!editable} loading={save.isPending}>
                        Lớp đủ sĩ số
                    </Button>
                </Popconfirm>
                <Button
                    className="big-btn"
                    type="primary"
                    icon={<SendOutlined />}
                    style={{ flex: 1 }}
                    disabled={!editable || (absences.length === 0 && !report)}
                    loading={save.isPending}
                    onClick={() => save.mutate(absences)}
                >
                    {report ? "Cập nhật báo cáo" : `Gửi báo cáo (${absences.length} vắng)`}
                </Button>
            </Flex>
            {absences.some((a) => !a.excused) && (
                <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                    <Tag color="red">Lưu ý</Tag>Nghỉ không phép bị trừ như bỏ giờ (−10 điểm / buổi).
                </Typography.Paragraph>
            )}
        </div>
    );
}
