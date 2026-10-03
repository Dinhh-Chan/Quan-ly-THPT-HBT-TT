import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Segmented, Table, Tag } from "antd";
import { useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { usePeriod } from "@/components/common/PeriodPicker";
import { RANK_COLOR } from "@/constants";
import { exportWeeks, summarize } from "@/features/scoring/exportBoard";
import { useMultiWeekResults } from "@/features/scoring/useWeekResults";
import { useWorkingWeek } from "@/hooks/useData";

/** Tổng hợp thi đua nhiều tuần: tổng / trung bình điểm, số tuần đạt từng mức xếp loại */
export default function SummaryPage() {
    const { week: curWeek } = useWorkingWeek();
    const { period, picker } = usePeriod("month");
    const [grade, setGrade] = useState("all");
    // Chỉ tổng hợp các tuần đã diễn ra
    const weeks = useMemo(() => (period?.weeks ?? []).filter((w) => !curWeek || w.weekNo <= curWeek.weekNo), [period, curWeek]);
    const { data, isFetching } = useMultiWeekResults(weeks.map((w) => w.weekNo));

    const rows = useMemo(() => (data ? summarize(data.byWeek) : []), [data]);
    const shown = rows.filter((r) => grade === "all" || String(r.grade) === grade);
    const unlocked = weeks.filter((w) => data && !data.lockedWeeks.has(w.weekNo));

    const rankCell = (n: number, rank: keyof typeof RANK_COLOR) => (n ? <Tag color={RANK_COLOR[rank]}>{n}</Tag> : "");

    return (
        <>
            <PageHeader
                title="Tổng hợp thi đua tháng / học kỳ"
                subtitle={period ? `${period.label} · ${weeks.length} tuần` : undefined}
                extra={
                    <>
                        {picker}
                        <Button
                            icon={<DownloadOutlined />}
                            disabled={!data}
                            onClick={() => data && period && exportWeeks(`Tong-hop-thi-dua-${period.label.replace(/\s|\//g, "-")}`, weeks, data.byWeek, period.label)}
                        >
                            Xuất Excel
                        </Button>
                    </>
                }
            />
            {unlocked.length > 0 && (
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 12 }}
                    title={`Tuần ${unlocked.map((w) => w.weekNo).join(", ")} chưa chốt – số liệu các tuần này là tạm tính.`}
                />
            )}
            <Card>
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
                <Table
                    size="small"
                    bordered
                    rowKey="classId"
                    loading={isFetching && !rows.length}
                    dataSource={shown}
                    pagination={false}
                    scroll={{ x: 800 }}
                    columns={[
                        { title: "Hạng", dataIndex: "rank", width: 70, sorter: (a, b) => a.rank - b.rank },
                        { title: "Lớp", dataIndex: "className", width: 80, render: (v) => <b>{v}</b> },
                        { title: "Số tuần", dataIndex: "weeks", align: "center" },
                        { title: "Tổng điểm", dataIndex: "sum", align: "center", sorter: (a, b) => a.sum - b.sum, render: (v) => <b>{v}</b> },
                        { title: "TB / tuần", dataIndex: "avg", align: "center", sorter: (a, b) => a.avg - b.avg },
                        { title: "Tuần XS", dataIndex: "XS", align: "center", render: (v) => rankCell(v, "XS") },
                        { title: "Tuần T", dataIndex: "T", align: "center", render: (v) => rankCell(v, "T") },
                        { title: "Tuần Kh", dataIndex: "Kh", align: "center", render: (v) => rankCell(v, "Kh") },
                        { title: "Tuần Y", dataIndex: "Y", align: "center", render: (v) => rankCell(v, "Y") },
                        { title: "Hạng TB", dataIndex: "avgRank", align: "center", sorter: (a, b) => a.avgRank - b.avgRank },
                    ]}
                />
            </Card>
        </>
    );
}
