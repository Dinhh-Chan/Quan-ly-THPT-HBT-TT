import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Statistic, Table, Tabs, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { usePeriod } from "@/components/common/PeriodPicker";
import RankTag from "@/components/common/RankTag";
import { INCIDENT_LABEL, INCIDENT_STATUS_COLOR, INCIDENT_STATUS_LABEL, QUICK_VIOLATIONS, VIOLATION_LABEL } from "@/constants";
import ClassWeekDetail from "@/features/scoring/ClassWeekDetail";
import { expandAbsences } from "@/features/scoring/engine";
import { fetchWeekRaw, useMultiWeekResults } from "@/features/scoring/useWeekResults";
import { useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import { fmtDate } from "@/utils/date";
import { exportXlsx } from "@/utils/excel";

export default function ClassReportPage() {
    const { classId, role } = useScope();
    const { className } = useClasses();
    const { year } = useWorkingWeek();
    const { period, picker } = usePeriod("week");
    const { data: students = [] } = useStudents(classId, true);
    const weekNos = period?.weeks.map((w) => w.weekNo) ?? [];
    const { data: multi } = useMultiWeekResults(period?.mode === "day" ? [] : weekNos);

    const { data } = useQuery({
        queryKey: ["class-report", classId, period?.from, period?.to],
        enabled: !!classId && !!period,
        queryFn: async () => {
            const byDate = F.between("date", period!.from, period!.to);
            const [attendance, violations, incidents] = await Promise.all([
                api.attendance.many({ filters: [F.eq("classId", classId), byDate] }),
                api.violations.many({ filters: [F.eq("classId", classId), byDate] }),
                api.incidents.many({ filters: [F.eq("classIds", classId), byDate] }),
            ]);
            const raw = period!.mode === "week" && year ? await fetchWeekRaw(year, weekNos[0], classId) : null;
            return { attendance, violations, incidents, raw };
        },
    });

    const absences = useMemo(() => expandAbsences(data?.attendance ?? []), [data]);
    const weekRows = useMemo(
        () =>
            weekNos
                .map((w) => ({ weekNo: w, r: multi?.byWeek.get(w)?.find((x) => x.classId === classId), locked: multi?.lockedWeeks.has(w) }))
                .filter((x) => x.r),
        [multi, weekNos, classId],
    );

    const perStudent = useMemo(() => {
        const map = new Map<string, { _id: string; name: string; cp: number; kp: number; vio: Record<string, number>; total: number }>();
        students.forEach((s) => map.set(s._id, { _id: s._id, name: s.fullname, cp: 0, kp: 0, vio: {}, total: 0 }));
        absences.forEach((a) => {
            const s = map.get(a.studentId);
            if (s) a.excused ? s.cp++ : s.kp++;
        });
        data?.violations.forEach((v) => {
            const s = v.studentId ? map.get(v.studentId) : undefined;
            if (s) {
                s.vio[v.type] = (s.vio[v.type] || 0) + 1;
                s.total++;
            }
        });
        return [...map.values()].filter((s) => s.cp + s.kp + s.total > 0).sort((a, b) => b.cp + b.kp + b.total - (a.cp + a.kp + a.total));
    }, [students, absences, data]);

    if (!classId) return <Alert type="warning" title="Tài khoản chưa được gán lớp" />;
    const isGvcn = role === "GVCN";
    const weekResult = period?.mode === "week" ? weekRows[0]?.r : undefined;

    const exportStudents = () =>
        exportXlsx(`Thong-ke-hoc-sinh-${className(classId)}-${period?.label}`, [
            {
                name: "Theo học sinh",
                title: `Thống kê học sinh lớp ${className(classId)} – ${period?.label}`,
                header: [["Họ tên", "Nghỉ có phép", "Nghỉ không phép", ...QUICK_VIOLATIONS.map((t) => VIOLATION_LABEL[t]), "Tổng vi phạm"]],
                rows: perStudent.map((s) => [s.name, s.cp, s.kp, ...QUICK_VIOLATIONS.map((t) => s.vio[t] || 0), s.total]),
                widths: [28, 12, 14, 10, 10, 10, 10, 10, 10, 10, 12],
            },
        ]);

    const overview = (
        <>
            <Row gutter={[12, 12]}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lượt nghỉ có phép" value={absences.filter((a) => a.excused).length} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lượt nghỉ không phép" value={absences.filter((a) => !a.excused).length} styles={{ content: { color: "#cf1322" } }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title="Lượt vi phạm" value={data?.violations.length ?? 0} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={weekResult ? "Hạng toàn trường" : "Sự việc"} value={weekResult ? weekResult.rank : (data?.incidents.length ?? 0)} />
                    </Card>
                </Col>
            </Row>

            {period?.mode !== "day" && (
                <Card title="Điểm thi đua" style={{ marginTop: 12 }}>
                    {weekResult ? (
                        <>
                            <div style={{ marginBottom: 12 }}>
                                Tổng <b>{weekResult.total}</b> · Hạng <b>{weekResult.rank}</b> toàn trường · Xếp loại theo điểm <RankTag rank={weekResult.rankByScore} /> · Xếp loại cuối{" "}
                                <RankTag rank={weekResult.finalRank} full />
                                {!weekRows[0].locked && <Tag>Tạm tính – chưa chốt</Tag>}
                            </div>
                            <ClassWeekDetail result={weekResult} raw={data?.raw} />
                        </>
                    ) : (
                        <Table
                            size="small"
                            rowKey="weekNo"
                            pagination={false}
                            dataSource={weekRows}
                            columns={[
                                { title: "Tuần", dataIndex: "weekNo" },
                                { title: "Tổng điểm", render: (_, x) => x.r!.total },
                                { title: "Bị trừ", render: (_, x) => x.r!.totalDeduction },
                                { title: "Hạng", render: (_, x) => x.r!.rank },
                                { title: "Xếp loại", render: (_, x) => <RankTag rank={x.r!.finalRank} /> },
                                { title: "", render: (_, x) => (x.locked ? <Tag color="purple">Đã chốt</Tag> : <Tag>Tạm tính</Tag>) },
                            ]}
                        />
                    )}
                </Card>
            )}

            <Card title="Vi phạm nền nếp" style={{ marginTop: 12 }}>
                <Table
                    size="small"
                    rowKey="_id"
                    dataSource={data?.violations}
                    pagination={{ pageSize: 10 }}
                    columns={[
                        { title: "Ngày", dataIndex: "date", render: fmtDate, sorter: (a, b) => a.date.localeCompare(b.date) },
                        { title: "Học sinh", dataIndex: "studentName", render: (v) => v || "(Cả lớp)" },
                        { title: "Lỗi", dataIndex: "type", render: (t) => VIOLATION_LABEL[t as keyof typeof VIOLATION_LABEL] },
                        { title: "Người nhập", dataIndex: "createdByName", responsive: ["md"] },
                    ]}
                />
            </Card>

            {!!data?.incidents.length && (
                <Card title="Sự việc bất thường" style={{ marginTop: 12 }}>
                    <Table
                        size="small"
                        rowKey="_id"
                        pagination={false}
                        dataSource={data.incidents}
                        columns={[
                            { title: "Ngày", dataIndex: "date", render: fmtDate },
                            { title: "Loại", dataIndex: "type", render: (t) => INCIDENT_LABEL[t as keyof typeof INCIDENT_LABEL] },
                            { title: "Học sinh", render: (_, i) => i.students.map((s) => s.studentName).join(", ") },
                            { title: "Trạng thái", dataIndex: "status", render: (s) => <Tag color={INCIDENT_STATUS_COLOR[s as keyof typeof INCIDENT_STATUS_COLOR]}>{INCIDENT_STATUS_LABEL[s as keyof typeof INCIDENT_STATUS_LABEL]}</Tag> },
                        ]}
                    />
                </Card>
            )}
        </>
    );

    return (
        <>
            <PageHeader title={`Báo cáo lớp ${className(classId)}`} subtitle={period?.label} extra={picker} />
            {isGvcn ? (
                <Tabs
                    items={[
                        { key: "overview", label: "Tổng quan", children: overview },
                        {
                            key: "students",
                            label: "Theo học sinh",
                            children: (
                                <Card extra={<Button icon={<DownloadOutlined />} onClick={exportStudents}>Xuất Excel</Button>} title="Học sinh nghỉ / vi phạm nhiều">
                                    <Table
                                        size="small"
                                        rowKey="_id"
                                        dataSource={perStudent}
                                        scroll={{ x: 800 }}
                                        columns={[
                                            { title: "Họ tên", dataIndex: "name", fixed: "left", render: (n, s) => <Link to={`/quan-ly/ho-so/${s._id}`}>{n}</Link> },
                                            { title: "Nghỉ CP", dataIndex: "cp", sorter: (a, b) => a.cp - b.cp, align: "center" },
                                            { title: "Nghỉ KP", dataIndex: "kp", sorter: (a, b) => a.kp - b.kp, align: "center", render: (v) => (v ? <Tag color="red">{v}</Tag> : 0) },
                                            ...QUICK_VIOLATIONS.map((t) => ({ title: VIOLATION_LABEL[t], align: "center" as const, render: (_: unknown, s: (typeof perStudent)[number]) => s.vio[t] || "" })),
                                            { title: "Tổng vi phạm", dataIndex: "total", sorter: (a, b) => a.total - b.total, align: "center" },
                                        ]}
                                    />
                                </Card>
                            ),
                        },
                    ]}
                />
            ) : (
                overview
            )}
        </>
    );
}
