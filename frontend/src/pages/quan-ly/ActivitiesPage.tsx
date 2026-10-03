import { DeleteOutlined, MinusCircleOutlined, PlusOutlined, TrophyOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Table, Tag } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import ClassSelect from "@/components/common/ClassSelect";
import LockedNotice from "@/components/common/LockedNotice";
import PageHeader from "@/components/common/PageHeader";
import WeekSelect from "@/components/common/WeekSelect";
import { ACTIVITY_LABEL } from "@/constants";
import { pickRules, useAllScoringRules, useClasses, useLockedWeeks, useScope, useWorkingWeek } from "@/hooks/useData";
import type { ActivityCriterion, ActivityPoint } from "@/types";

const SIMPLE: ActivityCriterion[] = ["3.1", "3.2", "4.6"];
const PRIZES: ActivityCriterion[] = ["4.1", "4.2", "4.3", "4.4"];

/** Điểm cộng hoạt động Đoàn (3.1, 3.2, 4.6) và kết quả cuộc thi (4.1–4.4, 4.5 không tham gia = hạ bậc) */
export default function ActivitiesPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user } = useScope();
    const { week: curWeek, year } = useWorkingWeek();
    const { data: locked } = useLockedWeeks();
    const { classes, className } = useClasses();
    const { data: rulesAll } = useAllScoringRules();
    const [weekNo, setWeekNo] = useState<number>();
    const [contestOpen, setContestOpen] = useState(false);
    const [simpleForm] = Form.useForm<{ criterion: ActivityCriterion; classIds: string[]; note?: string }>();
    const [contestForm] = Form.useForm<{ contestName: string; prizes: { classId: string; criterion: ActivityCriterion }[]; absent: string[] }>();

    useEffect(() => {
        if (!weekNo && curWeek) setWeekNo(curWeek.weekNo);
    }, [curWeek, weekNo]);

    const isLocked = !!locked?.some((w) => w.weekNo === weekNo);
    const rules = pickRules(rulesAll, weekNo ?? 1);
    const points = (c: ActivityCriterion) => (c === "4.5" ? "Hạ 1 bậc" : `+${rules?.bonuses[c as keyof NonNullable<typeof rules>["bonuses"]] ?? 0}`);

    const { data = [], isFetching } = useQuery({
        queryKey: ["activity-point", weekNo],
        enabled: !!year && !!weekNo,
        queryFn: () => api.activities.many({ filters: [F.eq("schoolYearId", year!._id), F.eq("weekNo", weekNo)], sort: { criterion: 1 } }),
    });

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["activity-point"] });
        qc.invalidateQueries({ queryKey: ["week-results"] });
        qc.invalidateQueries({ queryKey: ["week-results-multi"] });
    };

    const create = useMutation({
        mutationFn: (items: Partial<ActivityPoint>[]) => api.activities.createMany(items),
        onSuccess: (res) => {
            message.success(`Đã ghi ${res.length} mục cho tuần ${weekNo}`);
            invalidate();
        },
        onError: (e) => message.error((e as Error).message),
    });
    const remove = useMutation({ mutationFn: (id: string) => api.activities.remove(id), onSuccess: invalidate });

    const base = () => ({ schoolYearId: year!._id, weekNo, createdByName: user!.fullname });

    const addSimple = async () => {
        const v = await simpleForm.validateFields();
        await create.mutateAsync(v.classIds.map((classId) => ({ ...base(), classId, criterion: v.criterion, note: v.note })));
        simpleForm.resetFields(["classIds", "note"]);
    };

    const addContest = async () => {
        const v = await contestForm.validateFields();
        const prizeItems = (v.prizes || []).filter((p) => p?.classId && p?.criterion).map((p) => ({ ...base(), classId: p.classId, criterion: p.criterion, contestName: v.contestName }));
        const absentItems = (v.absent || []).map((classId) => ({ ...base(), classId, criterion: "4.5" as const, contestName: v.contestName }));
        await create.mutateAsync([...prizeItems, ...absentItems]);
        contestForm.resetFields();
        setContestOpen(false);
    };

    return (
        <>
            <PageHeader
                title="Hoạt động Đoàn"
                subtitle="Điểm cộng tự vào bảng thi đua của tuần được chọn"
                extra={
                    <>
                        <WeekSelect value={weekNo} onChange={setWeekNo} />
                        <Button type="primary" icon={<TrophyOutlined />} disabled={isLocked} onClick={() => setContestOpen(true)}>
                            Nhập kết quả cuộc thi
                        </Button>
                    </>
                }
            />
            <LockedNotice locked={isLocked} isManager />
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={9}>
                    <Card title="Ghi điểm cộng">
                        <Form form={simpleForm} layout="vertical" initialValues={{ criterion: "3.1" }} disabled={isLocked}>
                            <Form.Item name="criterion" label="Tiêu chí">
                                <Select options={SIMPLE.map((c) => ({ value: c, label: `${c} · ${ACTIVITY_LABEL[c]} (${points(c)})` }))} />
                            </Form.Item>
                            <Form.Item name="classIds" label="Lớp" rules={[{ required: true, message: "Chọn ít nhất một lớp" }]}>
                                <Select mode="multiple" showSearch={{ optionFilterProp: "label" }} options={classes.map((c) => ({ value: c._id, label: c.name }))} placeholder="Chọn lớp" />
                            </Form.Item>
                            <Form.Item name="note" label="Ghi chú">
                                <Input placeholder="Ví dụ: chăm sóc bồn cây khu A" />
                            </Form.Item>
                            <Button type="primary" icon={<PlusOutlined />} block onClick={addSimple} loading={create.isPending}>
                                Ghi vào tuần {weekNo}
                            </Button>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} lg={15}>
                    <Card title={`Đã ghi trong tuần ${weekNo ?? ""} (${data.length})`}>
                        <Table
                            size="small"
                            rowKey="_id"
                            loading={isFetching && !data.length}
                            dataSource={data}
                            pagination={false}
                            columns={[
                                { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                                {
                                    title: "Tiêu chí",
                                    dataIndex: "criterion",
                                    render: (c: ActivityCriterion) => (
                                        <>
                                            <Tag color={c === "4.5" ? "red" : "green"}>{c}</Tag>
                                            {ACTIVITY_LABEL[c]}
                                        </>
                                    ),
                                },
                                { title: "Điểm", dataIndex: "criterion", width: 90, render: points },
                                { title: "Cuộc thi / ghi chú", render: (_, a) => a.contestName || a.note || "" },
                                {
                                    title: "",
                                    width: 50,
                                    render: (_, a) =>
                                        !isLocked && (
                                            <Popconfirm title="Xóa mục này?" onConfirm={() => remove.mutate(a._id)}>
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        ),
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal open={contestOpen} title={`Kết quả cuộc thi – cộng vào tuần ${weekNo}`} onCancel={() => setContestOpen(false)} onOk={addContest} okText="Ghi kết quả" width={640} confirmLoading={create.isPending}>
                <Alert type="info" showIcon style={{ marginBottom: 12 }} title="Điểm giải cộng vào tuần trao giải. Lớp không nộp bài bị hạ 1 bậc (tiêu chí 4.5)." />
                <Form form={contestForm} layout="vertical" initialValues={{ prizes: [{}] }}>
                    <Form.Item name="contestName" label="Tên cuộc thi" rules={[{ required: true, message: "Nhập tên cuộc thi" }]}>
                        <Input placeholder="Ví dụ: Rung chuông vàng" />
                    </Form.Item>
                    <Form.List name="prizes">
                        {(fields, { add, remove: rm }) => (
                            <>
                                {fields.map((f) => (
                                    <Space key={f.key} align="baseline" style={{ display: "flex" }}>
                                        <Form.Item name={[f.name, "classId"]} style={{ marginBottom: 8 }}>
                                            <ClassSelect onChange={() => {}} placeholder="Lớp" style={{ width: 140 }} />
                                        </Form.Item>
                                        <Form.Item name={[f.name, "criterion"]} style={{ marginBottom: 8 }}>
                                            <Select placeholder="Giải" style={{ width: 260 }} options={PRIZES.map((c) => ({ value: c, label: `${ACTIVITY_LABEL[c]} (${points(c)})` }))} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => rm(f.name)} />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                                    Thêm lớp đạt giải
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Form.Item name="absent" label="Lớp không tham gia / không nộp bài (hạ 1 bậc)">
                        <Select mode="multiple" showSearch={{ optionFilterProp: "label" }} options={classes.map((c) => ({ value: c._id, label: c.name }))} placeholder="Chọn lớp" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
