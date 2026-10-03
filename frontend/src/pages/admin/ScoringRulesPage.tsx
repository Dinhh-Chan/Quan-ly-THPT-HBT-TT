import { CopyOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Col, Descriptions, Empty, Form, InputNumber, Popconfirm, Row, Space, Tag } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { ACTIVITY_LABEL, DEDUCTION_LABEL, DEDUCTION_ORDER, DEFAULT_SCORING_RULES } from "@/constants";
import { useAllScoringRules, useLockedWeeks, useWorkingWeek } from "@/hooks/useData";
import type { ScoringRules } from "@/types";

type RulesForm = Omit<ScoringRules, "_id">;
const BONUS_KEYS = Object.keys(DEFAULT_SCORING_RULES.bonuses) as (keyof ScoringRules["bonuses"])[];

/**
 * Quy chế tính điểm theo phiên bản. Mỗi phiên bản có hiệu lực từ một tuần;
 * tuần đã chốt giữ nguyên kết quả nên chỉ sửa được phiên bản bắt đầu sau tuần chốt cuối.
 */
export default function ScoringRulesPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { data: all = [] } = useAllScoringRules();
    const { data: locked = [] } = useLockedWeeks();
    const { week, year } = useWorkingWeek();
    const lastLocked = Math.max(0, ...locked.map((w) => w.weekNo));
    const [selectedId, setSelectedId] = useState<string | "new">();
    const [form] = Form.useForm<RulesForm>();

    const versions = [...all].sort((a, b) => b.effectiveFromWeek - a.effectiveFromWeek);
    const active = versions.find((r) => r.effectiveFromWeek <= (week?.weekNo ?? 1)) ?? versions[versions.length - 1];
    const selected = selectedId === "new" ? undefined : (all.find((r) => r._id === selectedId) ?? active);
    const editable = selectedId === "new" || (!!selected && selected.effectiveFromWeek > lastLocked);

    useEffect(() => {
        if (selectedId === "new") return;
        form.setFieldsValue(selected ?? DEFAULT_SCORING_RULES);
    }, [selected, selectedId, form]);

    const newVersion = () => {
        const base = selected ?? active ?? DEFAULT_SCORING_RULES;
        setSelectedId("new");
        const { _id: _ignored, ...rest } = base as ScoringRules;
        form.setFieldsValue({ ...rest, effectiveFromWeek: Math.max(lastLocked + 1, (week?.weekNo ?? 1) + 1) });
    };

    const save = useMutation({
        mutationFn: (v: RulesForm) => {
            if (v.effectiveFromWeek <= lastLocked) throw new Error(`Tuần ${lastLocked} đã chốt: quy chế mới chỉ áp dụng từ tuần ${lastLocked + 1}`);
            if (all.some((r) => r.effectiveFromWeek === v.effectiveFromWeek && r._id !== selected?._id))
                throw new Error(`Đã có phiên bản áp dụng từ tuần ${v.effectiveFromWeek}`);
            const c = v.classification;
            if (!(c.xsMin >= c.tMin && c.tMin >= c.khMin)) throw new Error("Ngưỡng phải giảm dần: Xuất sắc ≥ Tốt ≥ Khá");
            return selectedId === "new" || !selected ? api.scoringRules.create(v) : api.scoringRules.update(selected._id, v);
        },
        onSuccess: (r) => {
            message.success(`Đã lưu quy chế áp dụng từ tuần ${r.effectiveFromWeek}`);
            setSelectedId(r._id);
            qc.invalidateQueries({ queryKey: ["scoring-rule"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
            qc.invalidateQueries({ queryKey: ["week-results-multi"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.scoringRules.remove(id),
        onSuccess: () => {
            setSelectedId(undefined);
            qc.invalidateQueries({ queryKey: ["scoring-rule"] });
        },
    });

    const num = (name: (string | number)[], props: { min?: number; max?: number; step?: number; addonAfter?: string } = {}) => (
        <Form.Item name={name} noStyle rules={[{ required: true }]}>
            <InputNumber min={props.min ?? 0} max={props.max} step={props.step} style={{ width: 110 }} suffix={props.addonAfter} />
        </Form.Item>
    );

    return (
        <>
            <PageHeader
                title="Quy chế thi đua"
                subtitle={year ? `Năm học ${year.name} · tuần chốt gần nhất: ${lastLocked || "chưa có"}` : undefined}
                extra={
                    <Button icon={<CopyOutlined />} onClick={newVersion}>
                        Tạo phiên bản mới
                    </Button>
                }
            />
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={6}>
                    <Card title="Phiên bản" styles={{ body: { padding: 0 } }}>
                        {!versions.length ? (
                            <Empty style={{ padding: 16 }} description="Đang dùng quy chế mặc định" />
                        ) : (
                            versions.map((r) => (
                                <div
                                    key={r._id}
                                    onClick={() => setSelectedId(r._id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer",
                                        padding: "10px 16px",
                                        borderBottom: "1px solid var(--ant-color-border-secondary)",
                                        background: selected?._id === r._id && selectedId !== "new" ? "var(--ant-color-primary-bg)" : undefined,
                                    }}
                                >
                                    <Space orientation="vertical" size={0}>
                                        <b>Từ tuần {r.effectiveFromWeek}</b>
                                        <span>
                                            {r._id === active?._id && <Tag color="blue">Đang áp dụng</Tag>}
                                            {r.effectiveFromWeek <= lastLocked && <Tag>Đã dùng cho tuần chốt</Tag>}
                                            {r.effectiveFromWeek > (week?.weekNo ?? 0) && <Tag color="gold">Sắp áp dụng</Tag>}
                                        </span>
                                    </Space>
                                    {r.effectiveFromWeek > lastLocked && versions.length > 1 && (
                                        <Popconfirm title="Xóa phiên bản này?" onConfirm={() => remove.mutate(r._id)}>
                                            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                                        </Popconfirm>
                                    )}
                                </div>
                            ))
                        )}
                        {selectedId === "new" && (
                            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--ant-color-border-secondary)" }}>
                                <Tag color="green">Phiên bản mới (chưa lưu)</Tag>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={18}>
                    <Form form={form} layout="vertical" disabled={!editable} onFinish={(v) => save.mutate(v)}>
                        {!editable && (
                            <Alert
                                type="info"
                                showIcon
                                style={{ marginBottom: 12 }}
                                title="Phiên bản này đã dùng để tính các tuần đã chốt nên không sửa được. Bấm “Tạo phiên bản mới” để thay đổi từ tuần sau."
                            />
                        )}
                        <Card
                            title={
                                <Space>
                                    Áp dụng từ tuần
                                    {num(["effectiveFromWeek"], { min: lastLocked + 1, max: year?.totalWeeks })}
                                </Space>
                            }
                            extra={
                                editable && (
                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={save.isPending}>
                                        Lưu quy chế
                                    </Button>
                                )
                            }
                        >
                            <Row gutter={[24, 16]}>
                                <Col xs={24} md={12}>
                                    <Descriptions title="Điểm học tập" column={1} size="small" bordered>
                                        <Descriptions.Item label="Hệ số điểm TB Sổ đầu bài">{num(["logbookMultiplier"], { step: 1 })}</Descriptions.Item>
                                        <Descriptions.Item label="KT miệng điểm cao (mỗi lượt)">{num(["oralHighPoint"], { addonAfter: "+" })}</Descriptions.Item>
                                        <Descriptions.Item label="KT miệng điểm thấp (mỗi lượt)">{num(["oralLowPoint"], { addonAfter: "−" })}</Descriptions.Item>
                                    </Descriptions>
                                    <Descriptions title="Xếp loại" column={1} size="small" bordered style={{ marginTop: 16 }}>
                                        <Descriptions.Item label="Xuất sắc: số hạng đầu toàn trường (0 = không giới hạn)">{num(["classification", "xsTopRank"])}</Descriptions.Item>
                                        <Descriptions.Item label="Xuất sắc: tổng điểm tối thiểu">{num(["classification", "xsMin"])}</Descriptions.Item>
                                        <Descriptions.Item label="Tốt: tổng điểm tối thiểu">{num(["classification", "tMin"])}</Descriptions.Item>
                                        <Descriptions.Item label="Khá: tổng điểm tối thiểu">{num(["classification", "khMin"])}</Descriptions.Item>
                                    </Descriptions>
                                    <Descriptions title="Điểm cộng" column={1} size="small" bordered style={{ marginTop: 16 }}>
                                        {BONUS_KEYS.map((k) => (
                                            <Descriptions.Item key={k} label={`${k} · ${ACTIVITY_LABEL[k]}`}>
                                                {num(["bonuses", k], { addonAfter: "+" })}
                                            </Descriptions.Item>
                                        ))}
                                    </Descriptions>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Descriptions title="Điểm trừ (mỗi lượt)" column={1} size="small" bordered>
                                        {DEDUCTION_ORDER.map((k) => (
                                            <Descriptions.Item key={k} label={DEDUCTION_LABEL[k]}>
                                                {num(["deductions", k], { addonAfter: "−" })}
                                            </Descriptions.Item>
                                        ))}
                                    </Descriptions>
                                    <Alert
                                        type="warning"
                                        style={{ marginTop: 16 }}
                                        title="Nghỉ cả ngày tính 2 buổi. Nghỉ không phép tính như bỏ giờ. Lớp không tham gia cuộc thi Đoàn (4.5) và sự việc 2.6–2.10 đã xác minh bị hạ 1 bậc."
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Form>
                </Col>
            </Row>
        </>
    );
}
