import { DownloadOutlined, LockOutlined, PrinterOutlined, UnlockOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Drawer, Form, InputNumber, Input, Segmented, Space, Table, Tag, Tooltip, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import RankTag from "@/components/common/RankTag";
import WeekSelect from "@/components/common/WeekSelect";
import { DEDUCTION_LABEL, DEDUCTION_ORDER } from "@/constants";
import ClassWeekDetail from "@/features/scoring/ClassWeekDetail";
import { exportWeeks } from "@/features/scoring/exportBoard";
import { fetchWeekRaw, useMultiWeekResults, useWeekResults } from "@/features/scoring/useWeekResults";
import { useScope, useWorkingWeek } from "@/hooks/useData";
import type { ClassWeekResult, DeductionKey, WeeklyReport } from "@/types";
import { fmtDate, fmtDateTime, getWeekRange, weeksOfSemester } from "@/utils/date";
import { parseDecimal } from "@/utils/text";

const COLS = DEDUCTION_ORDER.filter((k) => k !== "KHAC");

/** Tiêu đề cột ngắn gọn cho bảng rộng; tên đầy đủ hiện khi rê chuột */
const SHORT_LABEL: Record<DeductionKey, string> = {
    DI_MUON: "Đi muộn",
    QUEN_THE: "Thẻ",
    DONG_PHUC: "Đồng phục",
    GIAY_DEP: "Giày dép",
    DAU_TOC: "Đầu tóc",
    NGHI_CO_PHEP: "Nghỉ P",
    NGHI_KHONG_PHEP: "Nghỉ KP",
    TRON_TIET: "Bỏ giờ",
    GHI_SDB: "Ghi SĐB",
    HDTN_QUA_7P: "HĐTN",
    VE_SINH_BAN: "Vệ sinh",
    KHAC: "Khác",
};

export default function WeeklyBoardPage() {
    const { message, modal } = App.useApp();
    const qc = useQueryClient();
    const { user } = useScope();
    const { week: curWeek, year } = useWorkingWeek();
    const [weekNo, setWeekNo] = useState<number>();
    const [grade, setGrade] = useState<string>("all");
    const [selected, setSelected] = useState<ClassWeekResult | null>(null);
    const [exportSem, setExportSem] = useState<1 | 2 | null>(null);

    useEffect(() => {
        if (!weekNo && curWeek) setWeekNo(Math.max(1, curWeek.weekNo - (curWeek.weekNo > 1 ? 1 : 0)));
    }, [curWeek, weekNo]);

    const { data, isFetching } = useWeekResults(weekNo);
    const results = data?.results ?? [];
    const locked = data?.locked;
    const range = year && weekNo ? getWeekRange(year, weekNo) : null;
    const shown = results.filter((r) => grade === "all" || String(r.grade) === grade);
    const missing = results.filter((r) => r.reportStatus === "CHUA_NOP" || r.reportStatus === "NHAP");
    const zero = results.filter((r) => r.reportStatus !== "CHUA_NOP" && !r.logbookAvg);

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["week-results"] });
        qc.invalidateQueries({ queryKey: ["week-results-multi"] });
        qc.invalidateQueries({ queryKey: ["competition-week"] });
        qc.invalidateQueries({ queryKey: ["weekly-report"] });
    };

    const lock = useMutation({
        mutationFn: async () => {
            await api.competitionWeeks.create({
                schoolYearId: year!._id,
                weekNo,
                status: "LOCKED",
                lockedAt: new Date().toISOString(),
                lockedByName: user!.fullname,
                results,
            });
            const reports = await api.weeklyReports.many({ filters: [F.eq("schoolYearId", year!._id), F.eq("weekNo", weekNo)] });
            await Promise.all(reports.map((r) => api.weeklyReports.update(r._id, { status: "DA_CHOT" })));
        },
        onSuccess: () => {
            message.success(`Đã chốt tuần ${weekNo} và công bố kết quả`);
            invalidate();
        },
        onError: (e) => message.error((e as Error).message),
    });

    const unlock = useMutation({
        mutationFn: async () => {
            await api.competitionWeeks.remove(locked!._id);
            const reports = await api.weeklyReports.many({ filters: [F.eq("schoolYearId", year!._id), F.eq("weekNo", weekNo)] });
            await Promise.all(reports.map((r) => api.weeklyReports.update(r._id, { status: "DA_NOP" })));
        },
        onSuccess: () => {
            message.success("Đã mở chốt – sửa xong cần chốt lại");
            invalidate();
        },
    });

    const confirmLock = () =>
        modal.confirm({
            title: `Chốt tuần ${weekNo}?`,
            content: (
                <>
                    Sau khi chốt: khóa dữ liệu tuần, công bố kết quả cho các lớp. Lớp trưởng, thư ký, giám thị không sửa được nữa.
                    {missing.length > 0 && <Alert style={{ marginTop: 8 }} type="warning" title={`${missing.length} lớp chưa nộp báo cáo tuần: ${missing.map((m) => m.className).join(", ")}`} />}
                </>
            ),
            okText: "Chốt tuần",
            onOk: () => lock.mutateAsync(),
        });

    const { data: semData } = useMultiWeekResults(exportSem ? weeksOfSemester(year ?? undefined, exportSem).filter((w) => w.weekNo <= (curWeek?.weekNo ?? 0)).map((w) => w.weekNo) : []);
    useEffect(() => {
        if (exportSem && semData) {
            const weeks = weeksOfSemester(year ?? undefined, exportSem);
            exportWeeks(`Thi-dua-HK${exportSem}-${year?.name}`, weeks, semData.byWeek, `HK${exportSem}`);
            setExportSem(null);
        }
    }, [exportSem, semData, year]);

    const columns = [
        { title: "Hạng", dataIndex: "rank", width: 72, fixed: "left" as const, sorter: (a: ClassWeekResult, b: ClassWeekResult) => a.rank - b.rank },
        {
            title: "Lớp",
            dataIndex: "className",
            width: 70,
            fixed: "left" as const,
            render: (n: string, r: ClassWeekResult) => (
                <a onClick={() => setSelected(r)}>
                    <b>{n}</b>
                </a>
            ),
        },
        {
            title: "Học tập",
            children: [
                {
                    title: "ĐTB SĐB",
                    dataIndex: "logbookAvg",
                    width: 70,
                    align: "center" as const,
                    render: (v: number | null, r: ClassWeekResult) =>
                        r.reportStatus === "CHUA_NOP" ? <Tag color="orange">Chưa nộp</Tag> : v ? v : <Tag color="red">0</Tag>,
                },
                { title: "≥8", dataIndex: "oralHigh", width: 50, align: "center" as const },
                { title: "<5", dataIndex: "oralLow", width: 50, align: "center" as const },
            ],
        },
        {
            title: "Nền nếp (số lượt)",
            children: COLS.map((k) => ({
                title: <Tooltip title={DEDUCTION_LABEL[k]}>{SHORT_LABEL[k]}</Tooltip>,
                width: 62,
                align: "center" as const,
                render: (_: unknown, r: ClassWeekResult) => r.counts[k] || "",
            })),
        },
        { title: "Cộng", dataIndex: "bonusPoints", width: 60, align: "center" as const, render: (v: number) => (v ? `+${v}` : "") },
        { title: "Tổng trừ", dataIndex: "totalDeduction", width: 70, align: "center" as const },
        { title: "Tổng điểm", dataIndex: "total", width: 80, align: "center" as const, render: (v: number) => <b>{v}</b>, sorter: (a: ClassWeekResult, b: ClassWeekResult) => a.total - b.total },
        { title: "XL điểm", dataIndex: "rankByScore", width: 70, align: "center" as const, render: (v: ClassWeekResult["rankByScore"]) => <RankTag rank={v} /> },
        {
            title: "Hạ bậc",
            width: 80,
            align: "center" as const,
            render: (_: unknown, r: ClassWeekResult) =>
                r.downgrades.length ? (
                    <Tooltip title={r.downgrades.map((d) => d.label).join("; ")}>
                        <Tag color="red">−{r.downgrades.length}</Tag>
                    </Tooltip>
                ) : (
                    ""
                ),
        },
        { title: "Xếp loại", dataIndex: "finalRank", width: 80, align: "center" as const, fixed: "right" as const, render: (v: ClassWeekResult["finalRank"]) => <RankTag rank={v} /> },
    ];

    return (
        <>
            <PageHeader
                title="Bảng đánh giá thi đua tuần"
                subtitle={range ? `${fmtDate(range.startDate)} – ${fmtDate(range.endDate)} · Thứ hạng toàn trường theo tổng điểm` : undefined}
                extra={
                    <>
                        <WeekSelect value={weekNo} onChange={setWeekNo} maxWeek={curWeek?.weekNo} />
                        <Button icon={<DownloadOutlined />} onClick={() => range && exportWeeks(`Thi-dua-T${weekNo}`, [range], new Map([[weekNo!, results]]))}>
                            Excel tuần
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={() => setExportSem(range?.semester ?? 1)} loading={!!exportSem}>
                            Excel cả học kỳ
                        </Button>
                        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                            In / PDF
                        </Button>
                        {locked ? (
                            <Button icon={<UnlockOutlined />} onClick={() => modal.confirm({ title: "Mở chốt tuần để sửa?", content: "Kết quả đã công bố sẽ được tính lại khi chốt lần nữa.", onOk: () => unlock.mutateAsync() })}>
                                Mở chốt
                            </Button>
                        ) : (
                            <Button type="primary" icon={<LockOutlined />} onClick={confirmLock} loading={lock.isPending} disabled={!results.length}>
                                Chốt tuần
                            </Button>
                        )}
                    </>
                }
            />
            {locked ? (
                <Alert type="success" showIcon style={{ marginBottom: 12 }} title={`Đã chốt lúc ${fmtDateTime(locked.lockedAt)} bởi ${locked.lockedByName}. Số liệu được lưu cố định.`} />
            ) : (
                <Alert type="info" showIcon style={{ marginBottom: 12 }} title="Tạm tính – số liệu cập nhật trực tiếp từ dữ liệu nhập. Bấm tên lớp để xem chi tiết và sửa." />
            )}
            {!locked && (missing.length > 0 || zero.length > 0) && (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 12 }}
                    title="Cần rà soát trước khi chốt"
                    description={
                        <>
                            {missing.length > 0 && <div>Chưa nộp báo cáo tuần: {missing.map((m) => m.className).join(", ")}</div>}
                            {zero.length > 0 && <div>ĐTB Sổ đầu bài = 0 (có thể do quên nhập): {zero.map((m) => m.className).join(", ")}</div>}
                        </>
                    }
                />
            )}
            <Card>
                <Segmented
                    className="no-print"
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
                    loading={isFetching && !results.length}
                    dataSource={shown}
                    columns={columns}
                    pagination={false}
                    scroll={{ x: 1500 }}
                    sticky
                />
            </Card>
            <ClassDrawer result={selected} weekNo={weekNo} locked={!!locked} onClose={() => setSelected(null)} onChanged={invalidate} />
        </>
    );
}

/** Chi tiết một lớp; cấp quản lý sửa trực tiếp phần thư ký (ghi nhật ký) khi tuần chưa chốt */
function ClassDrawer({ result, weekNo, locked, onClose, onChanged }: { result: ClassWeekResult | null; weekNo?: number; locked: boolean; onClose: () => void; onChanged: () => void }) {
    const { message } = App.useApp();
    const { year } = useWorkingWeek();
    const [form] = Form.useForm();
    const { data } = useQuery({
        queryKey: ["board-class", result?.classId, weekNo],
        enabled: !!result && !!year && !!weekNo,
        queryFn: async () => {
            const [raw, report] = await Promise.all([
                fetchWeekRaw(year!, weekNo!, result!.classId),
                api.weeklyReports.one({ filters: [F.eq("schoolYearId", year!._id), F.eq("classId", result!.classId), F.eq("weekNo", weekNo)] }),
            ]);
            return { raw, report };
        },
    });

    useEffect(() => {
        if (data) form.setFieldsValue({ logbookAvg: data.report?.logbookAvg ?? "", oralHigh: data.report?.oralHigh ?? 0, oralLow: data.report?.oralLow ?? 0, logbookErrors: data.report?.logbookErrors ?? 0 });
    }, [data, form]);

    const save = async () => {
        const v = await form.validateFields();
        const dto: Partial<WeeklyReport> = { ...v, logbookAvg: parseDecimal(v.logbookAvg) };
        if (data?.report) await api.weeklyReports.update(data.report._id, dto);
        else await api.weeklyReports.create({ ...dto, classId: result!.classId, schoolYearId: year!._id, weekNo, status: "DA_NOP", submittedByName: "Cấp quản lý", submittedAt: new Date().toISOString() });
        message.success("Đã sửa – đã ghi nhật ký");
        onChanged();
        onClose();
    };

    return (
        <Drawer open={!!result} onClose={onClose} size={620} title={result && `Lớp ${result.className} – Tuần ${weekNo}`}>
            {result && (
                <>
                    <Space style={{ marginBottom: 12 }} wrap>
                        Tổng <b>{result.total}</b> · Hạng <b>{result.rank}</b> · <RankTag rank={result.rankByScore} /> → <RankTag rank={result.finalRank} full />
                    </Space>
                    <ClassWeekDetail result={result} raw={data?.raw} />
                    {!locked && (
                        <Card size="small" title="Sửa phần thư ký nhập" style={{ marginTop: 16 }}>
                            <Form form={form} layout="inline" style={{ rowGap: 8 }}>
                                <Form.Item name="logbookAvg" label="ĐTB SĐB" rules={[{ validator: (_, v) => { const n = parseDecimal(v); return n === null || (n >= 0 && n <= 10) ? Promise.resolve() : Promise.reject(new Error("0–10")); } }]}>
                                    <Input style={{ width: 80 }} />
                                </Form.Item>
                                <Form.Item name="oralHigh" label="Miệng ≥8">
                                    <InputNumber min={0} style={{ width: 70 }} />
                                </Form.Item>
                                <Form.Item name="oralLow" label="Miệng <5">
                                    <InputNumber min={0} style={{ width: 70 }} />
                                </Form.Item>
                                <Form.Item name="logbookErrors" label="Ghi SĐB">
                                    <InputNumber min={0} style={{ width: 70 }} />
                                </Form.Item>
                                <Button type="primary" onClick={save}>
                                    Lưu
                                </Button>
                            </Form>
                            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                                Vi phạm nền nếp sửa tại Báo cáo – thống kê › Vi phạm nền nếp; sự việc hạ bậc sửa tại Sự việc bất thường.
                            </Typography.Paragraph>
                        </Card>
                    )}
                </>
            )}
        </Drawer>
    );
}
