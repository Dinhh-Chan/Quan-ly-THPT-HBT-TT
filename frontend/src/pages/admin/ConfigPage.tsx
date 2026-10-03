import { SaveOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Form, InputNumber, Radio, Row, Select, TimePicker } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect } from "react";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { useAppConfig } from "@/hooks/useData";
import type { AppConfig } from "@/types";
import { WEEKDAY_LABEL } from "@/utils/date";

type ConfigForm = Omit<AppConfig, "_id" | "attendanceDeadline" | "weeklyReportDeadlineTime"> & {
    attendanceDeadline: Dayjs;
    weeklyReportDeadlineTime: Dayjs;
};

const DEFAULTS: Omit<AppConfig, "_id"> = {
    attendanceDeadline: "08:00",
    weeklyReportDeadlineDay: 6,
    weeklyReportDeadlineTime: "17:00",
    emergencyPhones: [],
    emergencyChannel: "ZALO",
    absenceWarnAt: 7,
    absenceLimit: 10,
    emergencyRemindMinutes: 15,
};

dayjs.extend(customParseFormat);

const toTime = (s: string) => dayjs(s, "HH:mm");

/** Hạn báo cáo, mốc cảnh báo nghỉ học, kênh báo sự việc khẩn cấp */
export default function ConfigPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { data: cfg } = useAppConfig();
    const [form] = Form.useForm<ConfigForm>();

    useEffect(() => {
        const c = { ...DEFAULTS, ...cfg };
        form.setFieldsValue({ ...c, attendanceDeadline: toTime(c.attendanceDeadline), weeklyReportDeadlineTime: toTime(c.weeklyReportDeadlineTime) });
    }, [cfg, form]);

    const save = useMutation({
        mutationFn: (v: ConfigForm) => {
            if (v.absenceWarnAt >= v.absenceLimit) throw new Error("Mốc cảnh báo sớm phải nhỏ hơn mốc xử lý");
            const dto = {
                ...v,
                attendanceDeadline: v.attendanceDeadline.format("HH:mm"),
                weeklyReportDeadlineTime: v.weeklyReportDeadlineTime.format("HH:mm"),
                emergencyPhones: (v.emergencyPhones || []).map((p) => p.replace(/\s/g, "")).filter(Boolean),
            };
            return cfg ? api.appConfig.update(cfg._id, dto) : api.appConfig.create(dto);
        },
        onSuccess: () => {
            message.success("Đã lưu cấu hình");
            qc.invalidateQueries({ queryKey: ["app-config"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    return (
        <>
            <PageHeader title="Cấu hình hệ thống" />
            <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)} style={{ maxWidth: 960 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card title="Hạn báo cáo" style={{ height: "100%" }}>
                            <Form.Item name="attendanceDeadline" label="Hạn báo sĩ số mỗi buổi sáng" rules={[{ required: true }]} extra="Sau giờ này lớp chưa báo sẽ hiện trong danh sách nhắc.">
                                <TimePicker format="HH:mm" minuteStep={5} needConfirm={false} />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name="weeklyReportDeadlineDay" label="Thư ký nộp báo cáo tuần" rules={[{ required: true }]}>
                                        <Select options={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ value: d, label: WEEKDAY_LABEL[d] }))} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="weeklyReportDeadlineTime" label="Trước giờ" rules={[{ required: true }]}>
                                        <TimePicker format="HH:mm" minuteStep={5} needConfirm={false} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card title="Theo dõi nghỉ học (trong một học kỳ)" style={{ height: "100%" }}>
                            <Form.Item name="absenceWarnAt" label="Cảnh báo sớm khi nghỉ từ" rules={[{ required: true }]}>
                                <InputNumber min={1} suffix="buổi" style={{ width: 160 }} />
                            </Form.Item>
                            <Form.Item name="absenceLimit" label="Mốc xử lý khi nghỉ từ" rules={[{ required: true }]} extra="Cả có phép và không phép; nghỉ cả ngày tính 2 buổi.">
                                <InputNumber min={1} suffix="buổi" style={{ width: 160 }} />
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col xs={24}>
                        <Card title="Sự việc khẩn cấp">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="emergencyPhones" label="Số điện thoại nhận báo động" extra="Gõ số rồi nhấn Enter để thêm.">
                                        <Select mode="tags" tokenSeparators={[",", ";", " "]} open={false} placeholder="0912 000 111" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Item name="emergencyChannel" label="Kênh gửi">
                                        <Radio.Group
                                            optionType="button"
                                            options={[
                                                { value: "ZALO", label: "Zalo" },
                                                { value: "SMS", label: "SMS" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Item name="emergencyRemindMinutes" label="Nhắc lại nếu chưa tiếp nhận sau">
                                        <InputNumber min={1} suffix="phút" style={{ width: 140 }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={save.isPending} style={{ marginTop: 16 }}>
                    Lưu cấu hình
                </Button>
            </Form>
        </>
    );
}
