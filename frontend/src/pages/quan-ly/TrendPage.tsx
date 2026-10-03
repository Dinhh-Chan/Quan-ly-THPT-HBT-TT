import { Card, Col, Empty, Flex, Row, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/common/PageHeader";
import { CHART_COLORS } from "@/constants";
import { useMultiWeekResults } from "@/features/scoring/useWeekResults";
import { useClasses, useWorkingWeek } from "@/hooks/useData";
import { weeksOfSemester } from "@/utils/date";

/** Điểm và thứ hạng của một hoặc vài lớp qua các tuần */
export default function TrendPage() {
    const { week: curWeek, year } = useWorkingWeek();
    const { classes, className } = useClasses();
    const [semester, setSemester] = useState<1 | 2>(1);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (curWeek) setSemester(curWeek.semester);
    }, [curWeek]);
    useEffect(() => {
        if (!selected.length && classes.length) setSelected([classes[0]._id]);
    }, [classes, selected.length]);

    const weekNos = useMemo(
        () => weeksOfSemester(year ?? undefined, semester).filter((w) => !curWeek || w.weekNo <= curWeek.weekNo).map((w) => w.weekNo),
        [year, semester, curWeek],
    );
    const { data } = useMultiWeekResults(weekNos);

    const series = useMemo(
        () =>
            weekNos.map((w) => {
                const row: Record<string, number | string> = { week: `T${w}` };
                data?.byWeek.get(w)?.forEach((r) => {
                    if (selected.includes(r.classId)) {
                        row[`total:${r.classId}`] = r.total;
                        row[`rank:${r.classId}`] = r.rank;
                    }
                });
                return row;
            }),
        [weekNos, data, selected],
    );

    const lines = (kind: "total" | "rank") =>
        selected.map((id, i) => (
            <Line key={id} type="monotone" dataKey={`${kind}:${id}`} name={className(id)} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ));

    return (
        <>
            <PageHeader
                title="Diễn biến thi đua"
                subtitle="Điểm và thứ hạng toàn trường qua các tuần"
                extra={
                    <Flex gap={8} wrap>
                        <Select
                            mode="multiple"
                            maxCount={5}
                            value={selected}
                            onChange={setSelected}
                            placeholder="Chọn lớp (tối đa 5)"
                            style={{ minWidth: 280 }}
                            showSearch={{ optionFilterProp: "label" }}
                            options={classes.map((c) => ({ value: c._id, label: c.name }))}
                        />
                        <Select
                            value={semester}
                            onChange={setSemester}
                            style={{ width: 120 }}
                            options={[
                                { value: 1, label: "Học kỳ 1" },
                                { value: 2, label: "Học kỳ 2" },
                            ]}
                        />
                    </Flex>
                }
            />
            {!weekNos.length ? (
                <Empty description="Học kỳ chưa bắt đầu" />
            ) : (
                <Row gutter={[16, 16]}>
                    <Col xs={24} xl={12}>
                        <Card title="Tổng điểm">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={series}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="week" />
                                    <YAxis domain={["auto", "auto"]} />
                                    <Tooltip />
                                    <Legend />
                                    {lines("total")}
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col xs={24} xl={12}>
                        <Card title="Thứ hạng toàn trường (càng cao càng tốt)">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={series}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="week" />
                                    <YAxis reversed allowDecimals={false} domain={[1, Math.max(classes.length, 1)]} />
                                    <Tooltip />
                                    <Legend />
                                    {lines("rank")}
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
}
