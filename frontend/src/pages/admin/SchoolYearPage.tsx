import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Segmented, Select, Space, Table, Tag } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { useClasses, useLockedWeeks, useSchoolYear, useStudents } from "@/hooks/useData";
import type { SchoolClass, SchoolYear } from "@/types";
import { DATE_FMT, fmtDate, getWeekInfo, listWeeks, todayStr } from "@/utils/date";

interface YearForm {
    name: string;
    week1StartDate: Dayjs;
    totalWeeks: number;
    semester2StartWeek: number;
    holidays: Dayjs[];
}

/** Năm học (mốc tuần, học kỳ, ngày nghỉ) và danh sách lớp */
export default function SchoolYearPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { data: year } = useSchoolYear();
    const { data: locked = [] } = useLockedWeeks();
    const { classes } = useClasses();
    const { data: students = [] } = useStudents();
    const [grade, setGrade] = useState("all");
    const [editingClass, setEditingClass] = useState<Partial<SchoolClass> | null>(null);
    const [form] = Form.useForm<YearForm>();
    const [classForm] = Form.useForm<SchoolClass>();

    useEffect(() => {
        if (year)
            form.setFieldsValue({
                ...year,
                week1StartDate: dayjs(year.week1StartDate),
                holidays: (year.holidays || []).map((d) => dayjs(d)),
            });
    }, [year, form]);

    // Xem trước các tuần theo giá trị đang nhập
    const watched = Form.useWatch([], form);
    const preview = useMemo<SchoolYear | undefined>(() => {
        if (!watched?.week1StartDate || !watched.totalWeeks) return undefined;
        return {
            ...(year as SchoolYear),
            week1StartDate: watched.week1StartDate.format(DATE_FMT),
            totalWeeks: watched.totalWeeks,
            semester2StartWeek: watched.semester2StartWeek || watched.totalWeeks + 1,
            holidays: (watched.holidays || []).map((d) => d.format(DATE_FMT)),
        };
    }, [watched, year]);
    const weeks = listWeeks(preview);
    const currentWeek = getWeekInfo(preview, todayStr());
    const lockedNos = new Set(locked.map((w) => w.weekNo));
    const startChanged = !!year && !!preview && preview.week1StartDate !== year.week1StartDate;

    const saveYear = useMutation({
        mutationFn: (v: YearForm) => {
            const dto = {
                name: v.name,
                week1StartDate: v.week1StartDate.format(DATE_FMT),
                totalWeeks: v.totalWeeks,
                semester2StartWeek: v.semester2StartWeek,
                holidays: (v.holidays || []).map((d) => d.format(DATE_FMT)).sort(),
            };
            return year ? api.schoolYear.update(year._id, dto) : api.schoolYear.create({ ...dto, isCurrent: true });
        },
        onSuccess: () => {
            message.success("Đã lưu năm học");
            qc.invalidateQueries({ queryKey: ["school-year"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const saveClass = useMutation({
        mutationFn: (v: SchoolClass) => {
            const dto = { ...v, name: v.name.trim().toUpperCase() };
            if (classes.some((c) => c.name === dto.name && c._id !== editingClass?._id)) throw new Error(`Lớp ${dto.name} đã tồn tại`);
            return editingClass?._id ? api.classes.update(editingClass._id, dto) : api.classes.create(dto);
        },
        onSuccess: () => {
            message.success("Đã lưu lớp");
            setEditingClass(null);
            qc.invalidateQueries({ queryKey: ["class"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const removeClass = useMutation({
        mutationFn: (c: SchoolClass) => {
            if (students.some((s) => s.classId === c._id)) throw new Error(`Lớp ${c.name} còn học sinh đang học, chuyển học sinh đi trước khi xóa`);
            return api.classes.remove(c._id);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["class"] }),
        onError: (e) => message.error((e as Error).message),
    });

    const size = useMemo(() => {
        const m = new Map<string, number>();
        students.forEach((s) => m.set(s.classId, (m.get(s.classId) || 0) + 1));
        return m;
    }, [students]);

    const openClass = (c?: SchoolClass) => {
        setEditingClass(c ?? {});
        classForm.resetFields();
        if (c) classForm.setFieldsValue(c);
        else if (grade !== "all") classForm.setFieldsValue({ grade: Number(grade) as SchoolClass["grade"] });
    };

    return (
        <>
            <PageHeader title="Năm học & lớp" subtitle={year ? `Năm học ${year.name}` : "Chưa có năm học"} />
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={10}>
                    <Card title="Thiết lập năm học">
                        <Form form={form} layout="vertical" onFinish={(v) => saveYear.mutate(v)}>
                            <Form.Item name="name" label="Năm học" rules={[{ required: true, message: "Nhập năm học" }]}>
                                <Input placeholder="2026-2027" />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={10}>
                                    <Form.Item name="week1StartDate" label="Ngày bắt đầu tuần 1" rules={[{ required: true, message: "Chọn ngày" }]}>
                                        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="totalWeeks" label="Số tuần" rules={[{ required: true }]}>
                                        <InputNumber min={1} max={60} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="semester2StartWeek" label="HK2 bắt đầu tuần" rules={[{ required: true }]}>
                                        <InputNumber min={2} max={60} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="holidays" label="Ngày nghỉ lễ (không tính báo cáo sĩ số)">
                                <DatePicker multiple format="DD/MM/YYYY" style={{ width: "100%" }} />
                            </Form.Item>
                            {startChanged && !!locked.length && (
                                <Alert
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 12 }}
                                    title={`Đã chốt ${locked.length} tuần. Đổi ngày bắt đầu sẽ làm lệch số tuần của dữ liệu đã chốt.`}
                                />
                            )}
                            <Button type="primary" htmlType="submit" loading={saveYear.isPending}>
                                Lưu năm học
                            </Button>
                        </Form>
                    </Card>
                    <Card title="Các tuần" style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}>
                        <Table
                            size="small"
                            rowKey="weekNo"
                            dataSource={weeks}
                            pagination={false}
                            scroll={{ y: 360 }}
                            rowClassName={(w) => (w.weekNo === currentWeek?.weekNo ? "ant-table-row-selected" : "")}
                            columns={[
                                { title: "Tuần", dataIndex: "weekNo", width: 60, align: "center" },
                                { title: "Từ", dataIndex: "startDate", render: fmtDate },
                                { title: "Đến", dataIndex: "endDate", render: fmtDate },
                                { title: "HK", dataIndex: "semester", width: 50, align: "center" },
                                {
                                    title: "",
                                    width: 130,
                                    render: (_, w) => (
                                        <>
                                            {w.weekNo === currentWeek?.weekNo && <Tag color="blue">Hiện tại</Tag>}
                                            {lockedNos.has(w.weekNo) && <Tag color="green">Đã chốt</Tag>}
                                            {preview?.holidays.some((h) => h >= w.startDate && h <= w.endDate) && <Tag color="orange">Có ngày nghỉ</Tag>}
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>

                <Col xs={24} xl={14}>
                    <Card
                        title={`Lớp (${classes.length})`}
                        extra={
                            <Space>
                                <Segmented
                                    size="small"
                                    value={grade}
                                    onChange={(v) => setGrade(String(v))}
                                    options={[
                                        { label: "Tất cả", value: "all" },
                                        { label: "K10", value: "10" },
                                        { label: "K11", value: "11" },
                                        { label: "K12", value: "12" },
                                    ]}
                                />
                                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openClass()}>
                                    Thêm lớp
                                </Button>
                            </Space>
                        }
                    >
                        <Table
                            size="small"
                            rowKey="_id"
                            dataSource={classes.filter((c) => grade === "all" || String(c.grade) === grade)}
                            pagination={false}
                            scroll={{ y: 640 }}
                            columns={[
                                { title: "Lớp", dataIndex: "name", width: 80 },
                                { title: "Khối", dataIndex: "grade", width: 60, align: "center" },
                                { title: "GVCN", dataIndex: "homeroomTeacherName" },
                                { title: "Sĩ số", width: 70, align: "center", render: (_, c) => size.get(c._id) || 0 },
                                {
                                    title: "",
                                    width: 80,
                                    render: (_, c) => (
                                        <Space size={4}>
                                            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openClass(c)} />
                                            <Popconfirm title={`Xóa lớp ${c.name}?`} onConfirm={() => removeClass.mutate(c)}>
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                open={!!editingClass}
                title={editingClass?._id ? `Sửa lớp ${editingClass.name}` : "Thêm lớp"}
                onCancel={() => setEditingClass(null)}
                onOk={() => classForm.validateFields().then((v) => saveClass.mutate(v))}
                confirmLoading={saveClass.isPending}
                okText="Lưu"
            >
                <Form form={classForm} layout="vertical">
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên lớp" rules={[{ required: true, message: "Nhập tên lớp" }]}>
                                <Input placeholder="10A1" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="grade" label="Khối" rules={[{ required: true, message: "Chọn khối" }]}>
                                <Select options={[10, 11, 12].map((g) => ({ value: g, label: `Khối ${g}` }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="homeroomTeacherName" label="Giáo viên chủ nhiệm">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
