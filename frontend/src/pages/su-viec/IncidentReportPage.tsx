import { CameraOutlined, SendOutlined } from "@ant-design/icons";
import { App, Button, Card, DatePicker, Form, Image, Input, List, Radio, Segmented, Space, Tag, Typography, Upload } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import StudentPicker from "@/components/common/StudentPicker";
import { INCIDENT_LABEL, INCIDENT_STATUS_COLOR, INCIDENT_STATUS_LABEL } from "@/constants";
import { useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { Incident, IncidentStudent, IncidentType } from "@/types";
import { fmtDateTime } from "@/utils/date";

/** Thu nhỏ ảnh trước khi gửi để nhanh trên mạng điện thoại */
const resizeImage = (file: File, max = 1280): Promise<string> =>
    new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });

interface FormValues {
    type: IncidentType;
    severity: Incident["severity"];
    occurredAt: Dayjs;
    location?: string;
    description?: string;
}

export default function IncidentReportPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user, classId } = useScope();
    const { date } = useWorkingWeek();
    const { className } = useClasses();
    const { data: allStudents = [] } = useStudents();
    const [form] = Form.useForm<FormValues>();
    const [picked, setPicked] = useState<IncidentStudent[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);

    // Ưu tiên học sinh lớp mình lên đầu gợi ý
    const students = classId ? [...allStudents].sort((a, b) => Number(b.classId === classId) - Number(a.classId === classId)) : allStudents;

    const { data: mine = [] } = useQuery({
        queryKey: ["incident", "mine", user?._id],
        queryFn: () => api.incidents.many({ filters: [F.eq("reporterId", user!._id)], sort: { createdAt: -1 }, limit: 20 }),
    });

    const submit = useMutation({
        mutationFn: async (v: FormValues) => {
            const occurred = v.occurredAt ?? dayjs();
            return api.incidents.create({
                type: v.type,
                severity: v.severity,
                students: picked,
                classIds: [...new Set(picked.map((p) => p.classId))],
                date: occurred.format("YYYY-MM-DD"),
                occurredAt: occurred.toISOString(),
                location: v.location,
                description: v.description,
                photos,
                status: "MOI",
                reporterId: user!._id,
                reporterName: user!.fullname,
                createdAt: new Date().toISOString(),
            });
        },
        onSuccess: (inc) => {
            message.success(
                inc.severity === "KHAN_CAP" ? "Đã gửi cảnh báo KHẨN tới cấp quản lý và GVCN (kèm tin nhắn tới số trực)" : "Đã gửi báo cáo sự việc",
            );
            form.resetFields();
            setPicked([]);
            setPhotos([]);
            qc.invalidateQueries({ queryKey: ["incident"] });
            qc.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    return (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <PageHeader title="Báo cáo sự việc bất thường" subtitle="Cấp quản lý và GVCN nhận cảnh báo ngay khi gửi" />
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ severity: "THONG_THUONG", occurredAt: date === dayjs().format("YYYY-MM-DD") ? dayjs() : dayjs(`${date}T${dayjs().format("HH:mm")}`) }}
                    onFinish={(v) => {
                        if (!picked.length && v.type !== "KHAC" && v.type !== "TAI_NAN") return message.warning("Chọn học sinh liên quan");
                        submit.mutate(v);
                    }}
                >
                    <Form.Item name="type" label="Loại sự việc" rules={[{ required: true, message: "Chọn loại sự việc" }]}>
                        <Radio.Group style={{ width: "100%" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                                {(Object.keys(INCIDENT_LABEL) as IncidentType[]).map((t) => (
                                    <Radio.Button key={t} value={t} style={{ height: 48, display: "flex", alignItems: "center", borderRadius: 8 }}>
                                        {INCIDENT_LABEL[t]}
                                    </Radio.Button>
                                ))}
                            </div>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="severity" label="Mức độ">
                        <Segmented
                            block
                            options={[
                                { label: "Thông thường", value: "THONG_THUONG" },
                                { label: <b style={{ color: "#cf1322" }}>Khẩn cấp – cần can thiệp ngay</b>, value: "KHAN_CAP" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Học sinh liên quan (tìm toàn trường)">
                        <StudentPicker
                            students={students}
                            className={className}
                            excludeIds={picked.map((p) => p.studentId)}
                            onPick={(s) => setPicked((l) => [...l, { studentId: s._id, studentName: s.fullname, classId: s.classId }])}
                        />
                        <div style={{ marginTop: 8 }}>
                            {picked.map((p) => (
                                <Tag key={p.studentId} closable onClose={() => setPicked((l) => l.filter((x) => x.studentId !== p.studentId))} style={{ padding: "4px 8px", marginBottom: 6 }}>
                                    {p.studentName} – {className(p.classId)}
                                </Tag>
                            ))}
                        </div>
                    </Form.Item>
                    <Space wrap style={{ width: "100%" }} align="start">
                        <Form.Item name="occurredAt" label="Thời gian">
                            <DatePicker showTime={{ format: "HH:mm" }} format="HH:mm DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item name="location" label="Địa điểm">
                            <Input placeholder="Ví dụ: Cổng sau, nhà B tầng 2" style={{ minWidth: 240 }} />
                        </Form.Item>
                    </Space>
                    <Form.Item name="description" label="Mô tả ngắn">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item label="Ảnh (tùy chọn)">
                        <Space wrap>
                            {photos.map((p, i) => (
                                <Image key={i} src={p} width={80} height={80} style={{ objectFit: "cover", borderRadius: 6 }} />
                            ))}
                            {photos.length < 3 && (
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={async (file) => {
                                        const url = await resizeImage(file);
                                        setPhotos((l) => [...l, url]);
                                        return false;
                                    }}
                                >
                                    <Button icon={<CameraOutlined />} style={{ height: 80, width: 80 }} />
                                </Upload>
                            )}
                        </Space>
                    </Form.Item>
                    <Button type="primary" danger htmlType="submit" block className="big-btn" icon={<SendOutlined />} loading={submit.isPending}>
                        Gửi báo cáo
                    </Button>
                </Form>
            </Card>

            <Card title="Sự việc tôi đã báo" style={{ marginTop: 12 }}>
                <List
                    dataSource={mine}
                    locale={{ emptyText: "Chưa có" }}
                    renderItem={(i) => (
                        <List.Item extra={<Tag color={INCIDENT_STATUS_COLOR[i.status]}>{INCIDENT_STATUS_LABEL[i.status]}</Tag>}>
                            <List.Item.Meta
                                title={
                                    <>
                                        {i.severity === "KHAN_CAP" && <Tag color="red">Khẩn</Tag>}
                                        {INCIDENT_LABEL[i.type]}
                                    </>
                                }
                                description={
                                    <Typography.Text type="secondary">
                                        {fmtDateTime(i.occurredAt)} · {i.students.map((s) => `${s.studentName} (${className(s.classId)})`).join(", ")}
                                        {i.receivedByName && ` · Tiếp nhận: ${i.receivedByName}`}
                                    </Typography.Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}
