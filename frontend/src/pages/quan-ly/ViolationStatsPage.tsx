import { UnorderedListOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Segmented, Statistic, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { usePeriod } from "@/components/common/PeriodPicker";
import { CHART_COLORS, VIOLATION_LABEL } from "@/constants";
import { violationKey } from "@/features/scoring/engine";
import { useClasses } from "@/hooks/useData";
import type { Violation, ViolationType } from "@/types";
import { WEEKDAY_LABEL } from "@/utils/date";

const REPEAT_AT = 3;

/** Vi phạm nền nếp: theo loại lỗi, theo lớp, theo thứ trong tuần; học sinh tái phạm */
export default function ViolationStatsPage() {
    const { classes, className } = useClasses();
    const { period, picker } = usePeriod("month");
    const [grade, setGrade] = useState("all");

    const { data: raw = [] } = useQuery({
        queryKey: ["violation", "stats", period?.from, period?.to],
        enabled: !!period,
        queryFn: () => api.violations.many({ filters: [F.between("date", period!.from, period!.to)] }),
    });

    // Bỏ bản ghi trùng như khi tính điểm, lọc theo khối
    const list = useMemo(() => {
        const gradeOf = new Map(classes.map((c) => [c._id, String(c.grade)]));
        const seen = new Set<string>();
        return raw.filter((v: Violation) => {
            const k = violationKey(v);
            if (seen.has(k)) return false;
            seen.add(k);
            return grade === "all" || gradeOf.get(v.classId) === grade;
        });
    }, [raw, classes, grade]);

    const byType = useMemo(() => {
        const m = new Map<ViolationType, number>();
        list.forEach((v) => m.set(v.type, (m.get(v.type) || 0) + 1));
        return [...m.entries()].map(([t, n]) => ({ name: VIOLATION_LABEL[t], n })).sort((a, b) => b.n - a.n);
    }, [list]);

    const byClass = useMemo(() => {
        const m = new Map<string, number>();
        list.forEach((v) => m.set(v.classId, (m.get(v.classId) || 0) + 1));
        return [...m.entries()].map(([id, n]) => ({ name: className(id), n })).sort((a, b) => b.n - a.n).slice(0, 15);
    }, [list, className]);

    const byWeekday = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        list.forEach((v) => counts[dayjs(v.date).day()]++);
        return [1, 2, 3, 4, 5, 6].map((d) => ({ name: WEEKDAY_LABEL[d], n: counts[d] }));
    }, [list]);

    const repeaters = useMemo(() => {
        const m = new Map<string, { studentId: string; name: string; classId: string; total: number; types: Partial<Record<ViolationType, number>> }>();
        list.filter((v) => v.studentId).forEach((v) => {
            const s = m.get(v.studentId!) ?? { studentId: v.studentId!, name: v.studentName!, classId: v.classId, total: 0, types: {} };
            s.total++;
            s.types[v.type] = (s.types[v.type] || 0) + 1;
            m.set(v.studentId!, s);
        });
        return [...m.values()].filter((s) => s.total >= REPEAT_AT).sort((a, b) => b.total - a.total);
    }, [list]);

    const chart = (data: { name: string; n: number }[], height = 280, color?: string) => (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => [v, "Lượt"]} />
                <Bar dataKey="n" name="Lượt">
                    {data.map((_, i) => (
                        <Cell key={i} fill={color ?? CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <>
            <PageHeader
                title="Thống kê vi phạm nền nếp"
                subtitle={period?.label}
                extra={
                    <>
                        {picker}
                        <Link to="/giam-thi/danh-sach">
                            <Button icon={<UnorderedListOutlined />}>Danh sách chi tiết</Button>
                        </Link>
                    </>
                }
            />
            <Segmented
                style={{ marginBottom: 12 }}
                value={grade}
                onChange={(v) => setGrade(String(v))}
                options={[
                    { label: "Toàn trường", value: "all" },
                    { label: "Khối 10", value: "10" },
                    { label: "Khối 11", value: "11" },
                    { label: "Khối 12", value: "12" },
                ]}
            />
            <Row gutter={[12, 12]}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Tổng lượt vi phạm" value={list.length} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lỗi phổ biến nhất" value={byType[0]?.name ?? "–"} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lớp nhiều lượt nhất" value={byClass[0] ? `${byClass[0].name} (${byClass[0].n})` : "–"} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={`Học sinh tái phạm (≥ ${REPEAT_AT} lượt)`} value={repeaters.length} styles={{ content: { color: "#e8003a" } }} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Theo loại lỗi">{chart(byType)}</Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Theo thứ trong tuần">{chart(byWeekday, 280, CHART_COLORS[0])}</Card>
                </Col>
                <Col xs={24}>
                    <Card title="Theo lớp (15 lớp nhiều nhất)">{chart(byClass, 300, CHART_COLORS[1])}</Card>
                </Col>
                <Col xs={24}>
                    <Card title="Học sinh tái phạm">
                        <Table
                            size="small"
                            rowKey="studentId"
                            dataSource={repeaters}
                            pagination={{ pageSize: 15 }}
                            locale={{ emptyText: "Không có học sinh tái phạm trong kỳ" }}
                            columns={[
                                { title: "Họ tên", dataIndex: "name", render: (n, s) => <Link to={`/quan-ly/ho-so/${s.studentId}`}>{n}</Link> },
                                { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                                { title: "Số lượt", dataIndex: "total", align: "center", width: 80, sorter: (a, b) => a.total - b.total },
                                {
                                    title: "Chi tiết",
                                    render: (_, s) =>
                                        Object.entries(s.types).map(([t, n]) => (
                                            <Tag key={t}>
                                                {VIOLATION_LABEL[t as ViolationType]}: {n}
                                            </Tag>
                                        )),
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
}
