import { App, Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Space, Statistic, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import LockedNotice from "@/components/common/LockedNotice";
import PageHeader from "@/components/common/PageHeader";
import StudentPicker from "@/components/common/StudentPicker";
import WeekSelect from "@/components/common/WeekSelect";
import ClassWeekDetail from "@/features/scoring/ClassWeekDetail";
import { computeWeek } from "@/features/scoring/engine";
import { fetchWeekRaw } from "@/features/scoring/useWeekResults";
import { pickRules, useAllScoringRules, useAppConfig, useClasses, useLockedWeeks, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { WeeklyReport } from "@/types";
import { fmtDate, fmtDateTime, WEEKDAY_LABEL } from "@/utils/date";
import { parseDecimal } from "@/utils/text";

const STATUS: Record<string, [string, string]> = {
    NHAP: ["Nháp", "default"],
    DA_NOP: ["Đã nộp", "blue"],
    DA_CHOT: ["Đã chốt", "purple"],
};

interface FormValues {
    logbookAvg: string;
    oralHigh: number;
    oralLow: number;
    logbookErrors: number;
}

export default function WeeklyReportPage() {
    const { message, modal } = App.useApp();
    const qc = useQueryClient();
    const { user, role, classId, canEdit } = useScope();
    const { week: curWeek, year } = useWorkingWeek();
    const { data: locked } = useLockedWeeks();
    const { data: cfg } = useAppConfig();
    const { classMap, className } = useClasses();
    const { data: rulesAll } = useAllScoringRules();
    const { data: students = [] } = useStudents(classId);
    const [weekNo, setWeekNo] = useState<number>();
    const [form] = Form.useForm<FormValues>();
    const values = Form.useWatch([], form);
    const [errorStudents, setErrorStudents] = useState<string[]>([]);
    const [complain, setComplain] = useState<{ field: string; label: string } | null>(null);
    const [complainText, setComplainText] = useState("");

    useEffect(() => {
        if (!weekNo && curWeek) setWeekNo(curWeek.weekNo);
    }, [curWeek, weekNo]);

    const isLocked = !!locked?.some((w) => w.weekNo === weekNo);
    const editable = canEdit(isLocked);

    const { data, refetch } = useQuery({
        queryKey: ["weekly-report", classId, weekNo],
        enabled: !!year && !!weekNo && !!classId,
        queryFn: async () => {
            const [report, raw] = await Promise.all([
                api.weeklyReports.one({ filters: [F.eq("schoolYearId", year!._id), F.eq("classId", classId), F.eq("weekNo", weekNo)] }),
                fetchWeekRaw(year!, weekNo!, classId),
            ]);
            return { report, raw };
        },
    });
    const report = data?.report;

    useEffect(() => {
        form.setFieldsValue({
            logbookAvg: report?.logbookAvg != null ? String(report.logbookAvg) : "",
            oralHigh: report?.oralHigh ?? 0,
            oralLow: report?.oralLow ?? 0,
            logbookErrors: report?.logbookErrors ?? 0,
        });
        setErrorStudents(report?.logbookErrorStudents ?? []);
    }, [report, form]);

    // Xem trước tổng điểm tạm tính theo giá trị đang nhập
    const preview = useMemo(() => {
        const cls = classId ? classMap.get(classId) : undefined;
        const rules = pickRules(rulesAll, weekNo ?? 1);
        if (!data || !cls || !rules) return null;
        const draft: WeeklyReport = {
            _id: "draft",
            classId: cls._id,
            schoolYearId: year!._id,
            weekNo: weekNo!,
            logbookAvg: parseDecimal(values?.logbookAvg),
            oralHigh: values?.oralHigh || 0,
            oralLow: values?.oralLow || 0,
            logbookErrors: values?.logbookErrors || 0,
            status: "NHAP",
        };
        return computeWeek({ classes: [cls], rules, ...data.raw, weeklyReports: [draft] })[0];
    }, [data, values, classId, classMap, rulesAll, weekNo, year]);

    const save = useMutation({
        mutationFn: async (status: "NHAP" | "DA_NOP") => {
            const v = await form.validateFields();
            const dto: Partial<WeeklyReport> = {
                classId,
                schoolYearId: year!._id,
                weekNo,
                logbookAvg: parseDecimal(v.logbookAvg),
                oralHigh: v.oralHigh || 0,
                oralLow: v.oralLow || 0,
                logbookErrors: v.logbookErrors || 0,
                logbookErrorStudents: errorStudents,
                status,
                ...(status === "DA_NOP" ? { submittedAt: new Date().toISOString(), submittedByName: `${user!.fullname}${role === "GVCN" ? " (GVCN)" : ""}` } : {}),
            };
            return report ? api.weeklyReports.update(report._id, dto) : api.weeklyReports.create(dto);
        },
        onSuccess: (_, status) => {
            message.success(status === "DA_NOP" ? "Đã nộp báo cáo tuần" : "Đã lưu nháp");
            refetch();
            qc.invalidateQueries({ queryKey: ["week-results"] });
            qc.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const submit = async () => {
        await form.validateFields();
        const avg = parseDecimal(form.getFieldValue("logbookAvg"));
        if (!avg) {
            modal.confirm({
                title: "Điểm TB Sổ đầu bài đang là 0",
                content: "Lớp sẽ bị xếp loại Yếu. Bạn có chắc đã nhập đúng?",
                okText: "Vẫn nộp",
                cancelText: "Xem lại",
                onOk: () => save.mutate("DA_NOP"),
            });
        } else save.mutate("DA_NOP");
    };

    const sendComplaint = async () => {
        if (!complain || !complainText.trim()) return;
        await api.complaints.create({
            classId,
            weekNo,
            field: complain.field,
            content: `[${complain.label}] ${complainText.trim()}`,
            status: "MOI",
            createdByName: user!.fullname,
            createdAt: new Date().toISOString(),
        });
        message.success("Đã gửi khiếu nại tới cấp quản lý");
        setComplain(null);
        setComplainText("");
    };

    const deadline = cfg ? `${WEEKDAY_LABEL[cfg.weeklyReportDeadlineDay]} ${cfg.weeklyReportDeadlineTime}` : "";
    const status = isLocked ? "DA_CHOT" : report?.status;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <PageHeader
                title={`Báo cáo thi đua tuần – ${className(classId)}`}
                subtitle={`Hạn nộp: ${deadline}`}
                extra={<WeekSelect value={weekNo} onChange={setWeekNo} maxWeek={curWeek?.weekNo} style={{ minWidth: 0, width: "100%" }} />}
            />
            <LockedNotice locked={isLocked} isManager={role === "QUAN_LY"} />
            <Space style={{ marginBottom: 12 }} wrap>
                Trạng thái: <Tag color={STATUS[status ?? "NHAP"][1]}>{status ? STATUS[status][0] : "Chưa nhập"}</Tag>
                {report?.submittedAt && (
                    <Typography.Text type="secondary">
                        Nộp lúc {fmtDateTime(report.submittedAt)} bởi {report.submittedByName}
                    </Typography.Text>
                )}
            </Space>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Phần thư ký nhập">
                        <Form form={form} layout="vertical" disabled={!editable}>
                            <Form.Item
                                name="logbookAvg"
                                label="Điểm TB Sổ đầu bài (0–10)"
                                extra="Cho phép 2 số thập phân, nhập dấu phẩy hoặc dấu chấm"
                                rules={[
                                    { required: true, message: "Nhập điểm TB" },
                                    {
                                        validator: (_, v) => {
                                            const n = parseDecimal(v);
                                            if (n === null) return Promise.reject(new Error("Không phải số"));
                                            if (n < 0 || n > 10) return Promise.reject(new Error("Phải trong khoảng 0–10"));
                                            if (!/^\d+([.,]\d{1,2})?$/.test(String(v).trim())) return Promise.reject(new Error("Tối đa 2 số thập phân"));
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input size="large" inputMode="decimal" placeholder="Ví dụ 9,85" />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name="oralHigh" label="Số điểm miệng ≥ 8 (cả tuần)" rules={[{ type: "number", min: 0, message: "Không âm" }]}>
                                        <InputNumber size="large" min={0} precision={0} style={{ width: "100%" }} inputMode="numeric" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="oralLow" label="Số điểm miệng < 5 (cả tuần)" rules={[{ type: "number", min: 0, message: "Không âm" }]}>
                                        <InputNumber size="large" min={0} precision={0} style={{ width: "100%" }} inputMode="numeric" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="logbookErrors" label="Số lỗi bị ghi Sổ đầu bài" rules={[{ type: "number", min: 0, message: "Không âm" }]}>
                                <InputNumber size="large" min={0} precision={0} style={{ width: "100%" }} inputMode="numeric" />
                            </Form.Item>
                            <Form.Item label="Học sinh bị ghi SĐB (để GVCN theo dõi)">
                                <StudentPicker students={students} disabled={!editable} onPick={(s) => setErrorStudents((l) => [...l, s._id])} />
                                <div style={{ marginTop: 8 }}>
                                    {errorStudents.map((id, i) => (
                                        <Tag key={`${id}-${i}`} closable={editable} onClose={() => setErrorStudents((l) => l.filter((_, j) => j !== i))}>
                                            {students.find((s) => s._id === id)?.fullname ?? id}
                                        </Tag>
                                    ))}
                                </div>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title="Tổng điểm tạm tính"
                        extra={preview && <Statistic value={preview.total} styles={{ content: { fontSize: 22, color: "#1d4ed8" } }} />}
                    >
                        <Alert
                            type="info"
                            showIcon
                            style={{ marginBottom: 12 }}
                            title="Các mục nghỉ học, đi muộn, thẻ, đồng phục… do hệ thống tự điền từ dữ liệu lớp trưởng và giám thị. Bấm vào số để xem tên và ngày."
                        />
                        {preview && <ClassWeekDetail result={preview} raw={data?.raw} onComplain={editable ? (field, label) => setComplain({ field, label }) : undefined} />}
                        <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                            Thứ hạng toàn trường có sau khi các lớp nộp báo cáo. Tuần {weekNo}: {data?.raw.range && `${fmtDate(data.raw.range.startDate)} – ${fmtDate(data.raw.range.endDate)}`}
                        </Typography.Paragraph>
                    </Card>
                </Col>
            </Row>

            {editable && (
                <Space style={{ marginTop: 16, width: "100%", justifyContent: "flex-end" }} wrap>
                    <Button size="large" onClick={() => save.mutate("NHAP")} loading={save.isPending}>
                        Lưu nháp
                    </Button>
                    <Button size="large" type="primary" onClick={submit} loading={save.isPending}>
                        {report?.status === "DA_NOP" ? "Nộp lại" : "Nộp báo cáo"}
                    </Button>
                </Space>
            )}

            <Modal open={!!complain} title={`Khiếu nại: ${complain?.label}`} onCancel={() => setComplain(null)} onOk={sendComplaint} okText="Gửi">
                <Typography.Paragraph type="secondary">Khiếu nại được gửi tới cấp quản lý xem xét, số liệu không tự thay đổi.</Typography.Paragraph>
                <Input.TextArea rows={4} value={complainText} onChange={(e) => setComplainText(e.target.value)} placeholder="Ví dụ: em Nguyễn Văn A đi muộn ngày 15/9 đã chuyển sang lớp 10A3" />
            </Modal>
        </div>
    );
}
