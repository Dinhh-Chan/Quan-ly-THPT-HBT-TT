import { Button, Modal, Table, Tag, Typography } from "antd";
import { useState } from "react";
import { ACTIVITY_LABEL, DEDUCTION_LABEL, DEDUCTION_ORDER, ROLE_LABEL } from "@/constants";
import type { ClassWeekResult, DeductionKey } from "@/types";
import { fmtDate } from "@/utils/date";
import { expandAbsences } from "./engine";
import type { fetchWeekRaw } from "./useWeekResults";

type Raw = Awaited<ReturnType<typeof fetchWeekRaw>>;

interface Props {
    result: ClassWeekResult;
    raw?: Raw | null;
    /** Chỉ tiêu do hệ thống điền: hiện nút khiếu nại */
    onComplain?: (field: string, label: string) => void;
}

const detailRows = (raw: Raw, classId: string, key: DeductionKey) => {
    if (key === "NGHI_CO_PHEP" || key === "NGHI_KHONG_PHEP") {
        return expandAbsences(raw.attendance.filter((a) => a.classId === classId))
            .filter((a) => a.excused === (key === "NGHI_CO_PHEP"))
            .map((a, i) => ({ key: i, name: a.studentName, date: a.date, by: "Báo cáo sĩ số" }));
    }
    return raw.violations
        .filter((v) => v.classId === classId && (v.type as string) === key)
        .map((v) => ({ key: v._id, name: v.studentName || "(Cả lớp)", date: v.date, by: `${v.createdByName} (${ROLE_LABEL[v.createdByRole]})${v.note ? ` – ${v.note}` : ""}` }));
};

/** Bảng các tiêu chí của một lớp trong tuần; mỗi con số bấm vào xem danh sách tên và ngày */
export default function ClassWeekDetail({ result, raw, onComplain }: Props) {
    const [detail, setDetail] = useState<{ title: string; rows: { key: string | number; name: string; date: string; by: string }[] } | null>(null);

    const rows = [
        { key: "logbook", label: "1.1 Điểm TB Sổ đầu bài", count: result.logbookAvg ?? "–", points: result.logbookPoints, source: "Thư ký" },
        { key: "oralHigh", label: "1.2 KT miệng ≥ 8", count: result.oralHigh, points: result.oralHighPoints, source: "Thư ký" },
        { key: "oralLow", label: "1.3 KT miệng < 5", count: result.oralLow, points: -result.oralLowPoints, source: "Thư ký" },
        ...DEDUCTION_ORDER.filter((k) => k !== "KHAC" || result.counts.KHAC).map((k) => ({
            key: k,
            label: DEDUCTION_LABEL[k],
            count: result.counts[k],
            points: -result.deductionPoints[k],
            source: k === "GHI_SDB" ? "Thư ký" : "Hệ thống",
        })),
        ...result.bonusDetail.map((b, i) => ({ key: `bonus-${i}`, label: `${b.criterion} ${ACTIVITY_LABEL[b.criterion as keyof typeof ACTIVITY_LABEL]}`, count: b.note || "", points: b.points, source: "Đoàn trường" })),
    ];

    return (
        <>
            <Table
                size="small"
                pagination={false}
                rowKey="key"
                dataSource={rows}
                columns={[
                    { title: "Tiêu chí", dataIndex: "label" },
                    {
                        title: "Số lượt",
                        dataIndex: "count",
                        align: "center",
                        render: (v, r) =>
                            raw && typeof v === "number" && v > 0 && r.source === "Hệ thống" ? (
                                <span className="clickable" onClick={() => setDetail({ title: r.label, rows: detailRows(raw, result.classId, r.key as DeductionKey) })}>
                                    {v}
                                </span>
                            ) : (
                                v
                            ),
                    },
                    {
                        title: "Điểm",
                        dataIndex: "points",
                        align: "center",
                        render: (v: number) => <Typography.Text type={v < 0 ? "danger" : v > 0 ? "success" : undefined}>{v > 0 ? `+${v}` : v}</Typography.Text>,
                    },
                    {
                        title: "Nguồn",
                        dataIndex: "source",
                        responsive: ["sm"],
                        render: (v, r) => (
                            <>
                                <Tag>{v}</Tag>
                                {onComplain && v === "Hệ thống" && typeof r.count === "number" && r.count > 0 && (
                                    <Button size="small" type="link" onClick={() => onComplain(r.key, r.label)}>
                                        Khiếu nại
                                    </Button>
                                )}
                            </>
                        ),
                    },
                ]}
                summary={() => (
                    <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                <b>Tổng điểm bị trừ</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} />
                            <Table.Summary.Cell index={2} align="center">
                                <Typography.Text type="danger">-{result.totalDeduction}</Typography.Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} />
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                <b>Tổng điểm</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} />
                            <Table.Summary.Cell index={2} align="center">
                                <b style={{ fontSize: 16 }}>{result.total}</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} />
                        </Table.Summary.Row>
                    </>
                )}
            />
            {result.downgrades.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <Typography.Text strong>Hạ bậc: </Typography.Text>
                    {result.downgrades.map((d) => (
                        <Tag color="red" key={d.source}>
                            {d.label}
                        </Tag>
                    ))}
                </div>
            )}
            <Modal open={!!detail} title={detail?.title} footer={null} onCancel={() => setDetail(null)}>
                <Table
                    size="small"
                    pagination={false}
                    dataSource={detail?.rows}
                    columns={[
                        { title: "Học sinh", dataIndex: "name" },
                        { title: "Ngày", dataIndex: "date", render: fmtDate },
                        { title: "Nguồn", dataIndex: "by" },
                    ]}
                />
            </Modal>
        </>
    );
}
