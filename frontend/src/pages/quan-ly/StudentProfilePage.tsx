import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Descriptions, Empty, Row, Statistic, Table, Tabs, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import StudentPicker from "@/components/common/StudentPicker";
import { BRAND } from "@/config/brand";
import { INCIDENT_LABEL, INCIDENT_STATUS_COLOR, INCIDENT_STATUS_LABEL, VIOLATION_LABEL } from "@/constants";
import { useClasses, useScope, useStudents, useWorkingWeek } from "@/hooks/useData";
import type { StudentStatus } from "@/types";
import { fmtDate, fmtDateTime } from "@/utils/date";
import { exportXlsx } from "@/utils/excel";

const STATUS_LABEL: Record<StudentStatus, [string, string]> = {
    DANG_HOC: ["Đang học", "green"],
    CHUYEN_DI: ["Chuyển đi", "orange"],
    NGHI_HOC: ["Nghỉ học", "red"],
};
const SESSION_LABEL = { SANG: "Sáng", CHIEU: "Chiều", CA_NGAY: "Cả ngày" } as const;

/** Hồ sơ một học sinh: mọi lần vắng, vi phạm, sự việc trong năm học. In được. */
export default function StudentProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role, classId: myClass } = useScope();
    const { year } = useWorkingWeek();
    const { className } = useClasses();
    const isGvcn = role === "GVCN";
    const { data: searchList = [] } = useStudents(isGvcn ? myClass : undefined, true);

    const { data, isFetching, error } = useQuery({
        queryKey: ["student-profile", id, year?._id],
        enabled: !!id && !!year,
        queryFn: async () => {
            const student = await api.students.byId(id!);
            const classIds = [...new Set([student.classId, ...(student.classHistory ?? []).map((h) => h.classId)])];
            const yearEnd = dayjs(year!.week1StartDate).add(year!.totalWeeks * 7, "day").format("YYYY-MM-DD");
            const [attendance, violations, incidents] = await Promise.all([
                api.attendance.many({ filters: [F.in("classId", classIds), F.between("date", year!.week1StartDate, yearEnd)] }),
                api.violations.many({ filters: [F.eq("studentId", id)], sort: { date: -1 } }),
                api.incidents.many({ filters: [F.in("classIds", classIds)], sort: { occurredAt: -1 } }),
            ]);
            const absences = attendance
                .flatMap((r) => r.absences.filter((a) => a.studentId === id).map((a) => ({ ...a, date: r.date, classId: r.classId, key: `${r._id}-${a.studentId}` })))
                .sort((a, b) => b.date.localeCompare(a.date));
            return { student, absences, violations, incidents: incidents.filter((i) => i.students.some((s) => s.studentId === id)) };
        },
    });

    const s = data?.student;
    const forbidden = isGvcn && s && s.classId !== myClass;
    const sessionsOf = (a: { session: keyof typeof SESSION_LABEL }) => (a.session === "CA_NGAY" ? 2 : 1);
    const cp = data?.absences.filter((a) => a.excused).reduce((n, a) => n + sessionsOf(a), 0) ?? 0;
    const kp = data?.absences.filter((a) => !a.excused).reduce((n, a) => n + sessionsOf(a), 0) ?? 0;

    const exportExcel = () =>
        data &&
        exportXlsx(`Ho-so-${s!.code}`, [
            {
                name: "Vắng",
                title: `HỒ SƠ HỌC SINH ${s!.fullname.toUpperCase()} (${s!.code}) – LỚP ${className(s!.classId)}`,
                header: [["Ngày", "Lớp", "Buổi", "Có phép", "Lý do"]],
                rows: data.absences.map((a) => [fmtDate(a.date), className(a.classId), SESSION_LABEL[a.session], a.excused ? "Có" : "Không", a.reason ?? ""]),
                widths: [12, 8, 10, 10, 30],
            },
            {
                name: "Vi phạm",
                header: [["Ngày", "Lớp", "Lỗi", "Ghi chú", "Người nhập"]],
                rows: data.violations.map((v) => [fmtDate(v.date), className(v.classId), VIOLATION_LABEL[v.type], v.note ?? "", v.createdByName]),
                widths: [12, 8, 16, 30, 22],
            },
            {
                name: "Sự việc",
                header: [["Thời điểm", "Loại", "Trạng thái", "Xử lý"]],
                rows: data.incidents.map((i) => [fmtDateTime(i.occurredAt), INCIDENT_LABEL[i.type], INCIDENT_STATUS_LABEL[i.status], i.handling ?? ""]),
                widths: [18, 26, 14, 40],
            },
        ]);

    return (
        <>
            <PageHeader
                title="Hồ sơ học sinh"
                subtitle={isGvcn ? `Học sinh lớp ${className(myClass)}` : "Tìm học sinh toàn trường"}
                extra={
                    s &&
                    !forbidden && (
                        <span className="no-print">
                            <Button icon={<PrinterOutlined />} onClick={() => window.print()} style={{ marginRight: 8 }}>
                                In hồ sơ
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={exportExcel}>
                                Xuất Excel
                            </Button>
                        </span>
                    )
                }
            />
            <div className="no-print" style={{ maxWidth: 520, marginBottom: 16 }}>
                <StudentPicker students={searchList} className={className} onPick={(st) => navigate(`/quan-ly/ho-so/${st._id}`)} placeholder="Gõ tên học sinh để mở hồ sơ…" />
            </div>

            {!id && <Empty description="Chọn một học sinh để xem hồ sơ" />}
            {error && <Alert type="error" showIcon title="Không tìm thấy học sinh" />}
            {forbidden && <Alert type="warning" showIcon title="GVCN chỉ xem được hồ sơ học sinh lớp mình." />}
            {s && !forbidden && (
                <>
                    <div className="print-only" style={{ marginBottom: 12 }}>
                        <div style={{ textTransform: "uppercase" }}>{BRAND.authority}</div>
                        <b style={{ textTransform: "uppercase" }}>{BRAND.fullName}</b>
                    </div>
                    <Card loading={isFetching && !data}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Descriptions column={1} size="small" title={s.fullname}>
                                    <Descriptions.Item label="Mã học sinh">{s.code}</Descriptions.Item>
                                    <Descriptions.Item label="Lớp">{className(s.classId)}</Descriptions.Item>
                                    <Descriptions.Item label="Giới tính">{s.gender === "Male" ? "Nam" : s.gender === "Female" ? "Nữ" : "–"}</Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh">{fmtDate(s.dob) || "–"}</Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={STATUS_LABEL[s.status][1]}>{STATUS_LABEL[s.status][0]}</Tag>
                                    </Descriptions.Item>
                                    {!!s.classHistory?.length && (
                                        <Descriptions.Item label="Lịch sử lớp">
                                            {s.classHistory.map((h) => `${className(h.classId)} (${fmtDate(h.from)}${h.to ? ` – ${fmtDate(h.to)}` : ""})`).join(", ")}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={12}>
                                <Row gutter={12}>
                                    <Col span={8}>
                                        <Statistic title="Buổi nghỉ có phép" value={cp} />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic title="Buổi nghỉ không phép" value={kp} styles={{ content: { color: kp ? "#e8003a" : undefined } }} />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic title="Lượt vi phạm" value={data?.violations.length ?? 0} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                    <Card style={{ marginTop: 12 }}>
                        <Tabs
                            items={[
                                {
                                    key: "abs",
                                    label: `Vắng (${data?.absences.length ?? 0})`,
                                    children: (
                                        <Table
                                            size="small"
                                            rowKey="key"
                                            dataSource={data?.absences}
                                            pagination={{ pageSize: 20 }}
                                            columns={[
                                                { title: "Ngày", dataIndex: "date", render: fmtDate },
                                                { title: "Lớp", dataIndex: "classId", render: className },
                                                { title: "Buổi", dataIndex: "session", render: (v: keyof typeof SESSION_LABEL) => SESSION_LABEL[v] },
                                                { title: "Phép", dataIndex: "excused", render: (v) => (v ? <Tag color="blue">Có phép</Tag> : <Tag color="red">Không phép</Tag>) },
                                                { title: "Lý do", dataIndex: "reason" },
                                            ]}
                                        />
                                    ),
                                },
                                {
                                    key: "vio",
                                    label: `Vi phạm (${data?.violations.length ?? 0})`,
                                    children: (
                                        <Table
                                            size="small"
                                            rowKey="_id"
                                            dataSource={data?.violations}
                                            pagination={{ pageSize: 20 }}
                                            columns={[
                                                { title: "Ngày", dataIndex: "date", render: fmtDate },
                                                { title: "Lớp", dataIndex: "classId", render: className },
                                                { title: "Lỗi", dataIndex: "type", render: (t: keyof typeof VIOLATION_LABEL) => <Tag>{VIOLATION_LABEL[t]}</Tag> },
                                                { title: "Ghi chú", dataIndex: "note" },
                                                { title: "Người nhập", dataIndex: "createdByName" },
                                            ]}
                                        />
                                    ),
                                },
                                {
                                    key: "inc",
                                    label: `Sự việc (${data?.incidents.length ?? 0})`,
                                    children: (
                                        <Table
                                            size="small"
                                            rowKey="_id"
                                            dataSource={data?.incidents}
                                            pagination={false}
                                            columns={[
                                                { title: "Thời điểm", dataIndex: "occurredAt", render: fmtDateTime },
                                                { title: "Loại", dataIndex: "type", render: (t: keyof typeof INCIDENT_LABEL) => INCIDENT_LABEL[t] },
                                                {
                                                    title: "Trạng thái",
                                                    dataIndex: "status",
                                                    render: (st: keyof typeof INCIDENT_STATUS_LABEL) => <Tag color={INCIDENT_STATUS_COLOR[st]}>{INCIDENT_STATUS_LABEL[st]}</Tag>,
                                                },
                                                { title: "Xử lý", dataIndex: "handling" },
                                            ]}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </>
            )}
        </>
    );
}
