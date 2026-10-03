import { Badge, Card, Col, Empty, List, Row, Statistic, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { F } from "@/api/query";
import { api } from "@/api/services";
import { BRAND } from "@/config/brand";
import { CHART_COLORS, INCIDENT_LABEL, INCIDENT_STATUS_COLOR, INCIDENT_STATUS_LABEL, VIOLATION_LABEL } from "@/constants";
import { expandAbsences } from "@/features/scoring/engine";
import { useAppConfig, useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { ViolationType } from "@/types";
import { fmtDate, fmtDateTime, WEEKDAY_LABEL } from "@/utils/date";

const greeting = () => {
    const h = dayjs().hour();
    return h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
};

export default function DashboardPage() {
    const { date, week } = useWorkingWeek();
    const { user } = useScope();
    const { classes, className } = useClasses();
    const { data: students = [] } = useStudents();
    const { data: cfg } = useAppConfig();

    const { data } = useQuery({
        queryKey: ["dashboard", date],
        refetchInterval: 30_000,
        queryFn: async () => {
            const [attendance, violations, incidents] = await Promise.all([
                api.attendance.many({ filters: [F.eq("date", date)] }),
                api.violations.many({ filters: [F.eq("date", date)] }),
                api.incidents.many({ filters: [F.in("status", ["MOI", "DA_TIEP_NHAN", "DA_XAC_MINH"])], sort: { createdAt: -1 } }),
            ]);
            return { attendance, violations, incidents };
        },
    });

    const stats = useMemo(() => {
        const reported = new Set(data?.attendance.map((a) => a.classId));
        const morning = data?.attendance.filter((a) => a.session === "SANG") ?? [];
        const abs = expandAbsences(morning).filter((_, i, arr) => arr.findIndex((x) => x.studentId === arr[i].studentId) === i);
        const excused = abs.filter((a) => a.excused).length;
        const unexcused = abs.length - excused;
        const missing = classes.filter((c) => !reported.has(c._id));
        const byType = Object.entries(
            (data?.violations ?? []).reduce<Record<string, Record<string, number>>>((acc, v) => {
                const g = String(classes.find((c) => c._id === v.classId)?.grade ?? "?");
                acc[v.type] ??= {};
                acc[v.type][g] = (acc[v.type][g] || 0) + 1;
                return acc;
            }, {}),
        ).map(([type, g]) => ({ name: VIOLATION_LABEL[type as ViolationType], "Khối 10": g["10"] || 0, "Khối 11": g["11"] || 0, "Khối 12": g["12"] || 0 }));
        return { excused, unexcused, missing, byType, reportedCount: reported.size };
    }, [data, classes]);

    const incidents = [...(data?.incidents ?? [])].sort(
        (a, b) => Number(b.severity === "KHAN_CAP") - Number(a.severity === "KHAN_CAP") || Number(a.status !== "MOI") - Number(b.status !== "MOI"),
    );
    const late = dayjs().format("YYYY-MM-DD") === date && cfg && dayjs().format("HH:mm") > cfg.attendanceDeadline;

    return (
        <>
            <div className="dash-banner" style={{ backgroundImage: `url(${BRAND.photos.assembly})` }}>
                <div className="dash-banner-inner">
                    <div className="dash-banner-title">
                        {greeting()}, {user?.fullname}
                    </div>
                    <div className="dash-banner-sub">
                        {WEEKDAY_LABEL[dayjs(date).day()]}, {fmtDate(date)}
                        {week && ` · Tuần ${week.weekNo} – Học kỳ ${week.semester}`} · {BRAND.fullName}
                    </div>
                </div>
                <div className="brand-stripe" />
            </div>
            <Row gutter={[12, 12]}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Có mặt (buổi sáng)" value={students.length - stats.excused - stats.unexcused} suffix={`/ ${students.length}`} styles={{ content: { color: "#389e0d" } }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Vắng có phép" value={stats.excused} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Vắng không phép" value={stats.unexcused} styles={{ content: { color: "#cf1322" } }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lớp đã báo cáo" value={stats.reportedCount} suffix={`/ ${classes.length}`} />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title={<Badge status={stats.missing.length ? (late ? "error" : "warning") : "success"} text={`Lớp chưa báo cáo sĩ số (${stats.missing.length})`} />}>
                        {stats.missing.length ? (
                            stats.missing.map((c) => (
                                <Tag key={c._id} color={late ? "red" : "orange"} style={{ marginBottom: 6 }}>
                                    {c.name}
                                </Tag>
                            ))
                        ) : (
                            <Typography.Text type="success">Tất cả các lớp đã báo cáo</Typography.Text>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={`Sự việc đang mở (${incidents.length})`} extra={<Link to="/quan-ly/su-viec">Xem tất cả</Link>} styles={{ body: { maxHeight: 320, overflow: "auto" } }}>
                        <List
                            size="small"
                            dataSource={incidents}
                            locale={{ emptyText: "Không có sự việc đang mở" }}
                            renderItem={(i) => (
                                <List.Item extra={<Tag color={INCIDENT_STATUS_COLOR[i.status]}>{INCIDENT_STATUS_LABEL[i.status]}</Tag>}>
                                    <List.Item.Meta
                                        title={
                                            <Link to={`/quan-ly/su-viec?id=${i._id}`}>
                                                {i.severity === "KHAN_CAP" && <Tag color="red">KHẨN</Tag>}
                                                {INCIDENT_LABEL[i.type]} – {i.classIds.map(className).join(", ")}
                                            </Link>
                                        }
                                        description={`${fmtDateTime(i.occurredAt)} · ${i.location ?? ""}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title={`Vi phạm nền nếp trong ngày (${data?.violations.length ?? 0} lượt) theo loại lỗi và khối`}>
                        {stats.byType.length ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.byType}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Khối 10" stackId="a" fill={CHART_COLORS[0]} />
                                    <Bar dataKey="Khối 11" stackId="a" fill={CHART_COLORS[1]} />
                                    <Bar dataKey="Khối 12" stackId="a" fill={CHART_COLORS[2]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Chưa có vi phạm" />
                        )}
                    </Card>
                </Col>
            </Row>
        </>
    );
}
