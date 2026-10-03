import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { usePeriod } from "@/components/common/PeriodPicker";
import { CHART_COLORS } from "@/constants";
import { expandAbsences } from "@/features/scoring/engine";
import { useAppConfig, useClasses, useStudents, useWorkingWeek } from "@/hooks/useData";
import { absenceAlerts, semesterRange } from "@/hooks/useNotifications";
import { exportXlsx } from "@/utils/excel";

/** Chuyên cần: tỉ lệ vắng theo lớp, học sinh nghỉ nhiều, học sinh chạm mốc nghỉ trong học kỳ */
export default function AttendanceStatsPage() {
    const { date, year } = useWorkingWeek();
    const { data: cfg } = useAppConfig();
    const { classes, className } = useClasses();
    const { data: students = [] } = useStudents();
    const { period, picker } = usePeriod("month");
    const sem = year ? semesterRange(year, date) : null;

    const { data } = useQuery({
        queryKey: ["attendance-stats", period?.from, period?.to, sem?.from],
        enabled: !!period && !!sem,
        queryFn: async () => {
            const [inPeriod, inSemester] = await Promise.all([
                api.attendance.many({ filters: [F.between("date", period!.from, period!.to)] }),
                api.attendance.many({ filters: [F.between("date", sem!.from, sem!.to)] }),
            ]);
            return { inPeriod, inSemester };
        },
    });

    const byClass = useMemo(() => {
        if (!data) return [];
        const size = new Map<string, number>();
        students.forEach((s) => size.set(s.classId, (size.get(s.classId) || 0) + 1));
        const abs = expandAbsences(data.inPeriod);
        return classes
            .map((c) => {
                const reports = data.inPeriod.filter((r) => r.classId === c._id);
                const sessions = reports.length;
                const list = abs.filter((a) => a.classId === c._id);
                const cp = list.filter((a) => a.excused).length;
                const kp = list.length - cp;
                const capacity = sessions * (size.get(c._id) || 0);
                return { classId: c._id, name: c.name, sessions, cp, kp, total: cp + kp, rate: capacity ? Math.round(((cp + kp) / capacity) * 1000) / 10 : 0 };
            })
            .sort((a, b) => b.rate - a.rate);
    }, [data, classes, students]);

    const topStudents = useMemo(() => {
        if (!data) return [];
        const map = new Map<string, { studentId: string; name: string; classId: string; cp: number; kp: number }>();
        expandAbsences(data.inPeriod).forEach((a) => {
            const s = map.get(a.studentId) ?? { studentId: a.studentId, name: a.studentName, classId: a.classId, cp: 0, kp: 0 };
            a.excused ? s.cp++ : s.kp++;
            map.set(a.studentId, s);
        });
        return [...map.values()].sort((a, b) => b.cp + b.kp - (a.cp + a.kp)).slice(0, 20);
    }, [data]);

    const alerts = useMemo(() => (data && cfg ? absenceAlerts(data.inSemester, cfg).filter((a) => a.level || a.consecutiveUnexcused) : []), [data, cfg]);
    const totals = byClass.reduce((s, c) => ({ cp: s.cp + c.cp, kp: s.kp + c.kp }), { cp: 0, kp: 0 });

    const exportExcel = () =>
        exportXlsx(`Chuyen-can-${period?.label.replace(/\s|\//g, "-")}`, [
            {
                name: "Theo lớp",
                title: `THỐNG KÊ CHUYÊN CẦN – ${period?.label.toUpperCase()}`,
                header: [["Lớp", "Số buổi báo cáo", "Vắng có phép", "Vắng không phép", "Tổng lượt vắng", "Tỉ lệ vắng (%)"]],
                rows: byClass.map((c) => [c.name, c.sessions, c.cp, c.kp, c.total, c.rate]),
                widths: [8, 16, 14, 16, 14, 14],
            },
            {
                name: "Chạm mốc nghỉ",
                title: `HỌC SINH CẦN THEO DÕI – HỌC KỲ ${sem?.semester}`,
                header: [["Họ tên", "Lớp", "Số buổi nghỉ trong HK", "Mức", "Nghỉ KP 2 buổi liên tiếp"]],
                rows: alerts.map((a) => [a.name, className(a.classId), a.total, a.level === "limit" ? "Đạt mốc xử lý" : a.level === "warn" ? "Cảnh báo sớm" : "", a.consecutiveUnexcused ? "Có" : ""]),
                widths: [28, 8, 20, 16, 24],
            },
        ]);

    return (
        <>
            <PageHeader
                title="Thống kê chuyên cần"
                subtitle={period?.label}
                extra={
                    <>
                        {picker}
                        <Button icon={<DownloadOutlined />} onClick={exportExcel} disabled={!data}>
                            Xuất Excel
                        </Button>
                    </>
                }
            />
            <Row gutter={[12, 12]}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lượt vắng có phép" value={totals.cp} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lượt vắng không phép" value={totals.kp} styles={{ content: { color: "#e8003a" } }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={`Chạm mốc ${cfg?.absenceLimit ?? 10} buổi (HK${sem?.semester ?? ""})`} value={alerts.filter((a) => a.level === "limit").length} styles={{ content: { color: "#e8003a" } }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={`Cảnh báo sớm (≥ ${cfg?.absenceWarnAt ?? 7} buổi)`} value={alerts.filter((a) => a.level === "warn").length} styles={{ content: { color: "#f56a0c" } }} />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="Lượt vắng theo lớp (15 lớp cao nhất)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={byClass.slice(0, 15)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="cp" name="Có phép" stackId="a" fill={CHART_COLORS[0]} />
                                <Bar dataKey="kp" name="Không phép" stackId="a" fill={CHART_COLORS[3]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} xl={12}>
                    <Card title={`Học sinh cần theo dõi – học kỳ ${sem?.semester ?? ""}`}>
                        <Table
                            size="small"
                            rowKey="studentId"
                            dataSource={alerts}
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: "Chưa có học sinh chạm mốc" }}
                            columns={[
                                { title: "Họ tên", dataIndex: "name", render: (n, a) => <Link to={`/quan-ly/ho-so/${a.studentId}`}>{n}</Link> },
                                { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                                { title: "Buổi nghỉ", dataIndex: "total", align: "center", width: 90 },
                                {
                                    title: "Mức",
                                    render: (_, a) => (
                                        <>
                                            {a.level === "limit" && <Tag color="red">Đạt mốc xử lý</Tag>}
                                            {a.level === "warn" && <Tag color="orange">Cảnh báo sớm</Tag>}
                                            {a.consecutiveUnexcused && <Tag color="volcano">KP 2 buổi liền</Tag>}
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card title={`Học sinh nghỉ nhiều nhất – ${period?.label ?? ""}`}>
                        <Table
                            size="small"
                            rowKey="studentId"
                            dataSource={topStudents}
                            pagination={{ pageSize: 10 }}
                            columns={[
                                { title: "Họ tên", dataIndex: "name", render: (n, a) => <Link to={`/quan-ly/ho-so/${a.studentId}`}>{n}</Link> },
                                { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                                { title: "Có phép", dataIndex: "cp", align: "center", width: 80 },
                                { title: "Không phép", dataIndex: "kp", align: "center", width: 100, render: (v) => (v ? <Tag color="red">{v}</Tag> : 0) },
                            ]}
                        />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="Tỉ lệ vắng theo lớp">
                        <Table
                            size="small"
                            rowKey="classId"
                            dataSource={byClass}
                            pagination={false}
                            scroll={{ y: 400 }}
                            columns={[
                                { title: "Lớp", dataIndex: "name", width: 80 },
                                { title: "Số buổi báo cáo", dataIndex: "sessions", align: "center" },
                                { title: "Có phép", dataIndex: "cp", align: "center", sorter: (a, b) => a.cp - b.cp },
                                { title: "Không phép", dataIndex: "kp", align: "center", sorter: (a, b) => a.kp - b.kp },
                                { title: "Tỉ lệ vắng", dataIndex: "rate", align: "center", sorter: (a, b) => a.rate - b.rate, render: (v) => `${v}%` },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
}
