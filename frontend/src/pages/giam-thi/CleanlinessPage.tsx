import { Alert, App, Card, Col, Flex, Row, Segmented, Switch, Tabs, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { F } from "@/api/query";
import { api } from "@/api/services";
import LockedNotice from "@/components/common/LockedNotice";
import PageHeader from "@/components/common/PageHeader";
import { useClasses, useScope, useWorkingWeek } from "@/hooks/useData";
import type { SchoolClass, ViolationType } from "@/types";
import { fmtDate, WEEKDAY_LABEL } from "@/utils/date";

/** Kiểm tra vệ sinh lớp (mặc định Sạch) và HĐTN dưới cờ thứ Hai (tập trung quá 7 phút) – lỗi cấp lớp */
export default function CleanlinessPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { user, role, canEdit } = useScope();
    const { date, isLocked } = useWorkingWeek();
    const { classes } = useClasses();
    const editable = canEdit(isLocked);
    const isMonday = dayjs(date).day() === 1;

    const { data: list = [] } = useQuery({
        queryKey: ["violation", "class-level", date],
        queryFn: () => api.violations.many({ filters: [F.eq("date", date), F.in("type", ["VE_SINH_BAN", "HDTN_QUA_7P"])] }),
        refetchInterval: 15_000,
    });

    const toggle = useMutation({
        mutationFn: async ({ cls, type, on }: { cls: SchoolClass; type: ViolationType; on: boolean }) => {
            const existing = list.find((v) => v.classId === cls._id && v.type === type);
            if (on && !existing)
                return api.violations.create({
                    type,
                    classId: cls._id,
                    date,
                    source: "MANUAL",
                    createdById: user!._id,
                    createdByName: user!.fullname,
                    createdByRole: role!,
                    createdAt: new Date().toISOString(),
                });
            if (!on && existing) return api.violations.remove(existing._id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["violation"] });
            qc.invalidateQueries({ queryKey: ["week-results"] });
        },
        onError: (e) => message.error((e as Error).message),
    });

    const grid = (type: ViolationType, labels: [string, string]) => (
        <>
            {[10, 11, 12].map((g) => (
                <Card key={g} size="small" title={`Khối ${g}`} style={{ marginBottom: 12 }}>
                    <Row gutter={[8, 8]}>
                        {classes
                            .filter((c) => c.grade === g)
                            .map((c) => {
                                const bad = list.some((v) => v.classId === c._id && v.type === type);
                                return (
                                    <Col key={c._id} xs={12} sm={8} md={6} lg={4}>
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                            style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: "8px 10px", background: bad ? "#fff1f0" : "#f6ffed" }}
                                        >
                                            <Typography.Text strong>{c.name}</Typography.Text>
                                            {type === "VE_SINH_BAN" ? (
                                                <Segmented
                                                    size="small"
                                                    disabled={!editable}
                                                    value={bad ? "bad" : "ok"}
                                                    onChange={(v) => toggle.mutate({ cls: c, type, on: v === "bad" })}
                                                    options={[
                                                        { label: labels[0], value: "ok" },
                                                        { label: labels[1], value: "bad" },
                                                    ]}
                                                />
                                            ) : (
                                                <Switch
                                                    disabled={!editable}
                                                    checked={bad}
                                                    checkedChildren={labels[1]}
                                                    unCheckedChildren={labels[0]}
                                                    onChange={(on) => toggle.mutate({ cls: c, type, on })}
                                                />
                                            )}
                                        </Flex>
                                    </Col>
                                );
                            })}
                    </Row>
                </Card>
            ))}
        </>
    );

    const dirty = list.filter((v) => v.type === "VE_SINH_BAN").length;
    const hdtn = list.filter((v) => v.type === "HDTN_QUA_7P").length;

    return (
        <>
            <PageHeader title="Vệ sinh lớp & HĐTN dưới cờ" subtitle={`${WEEKDAY_LABEL[dayjs(date).day()]}, ${fmtDate(date)}`} />
            <LockedNotice locked={isLocked} />
            <Tabs
                defaultActiveKey={isMonday ? "hdtn" : "vs"}
                items={[
                    { key: "vs", label: `Vệ sinh (${dirty} lớp bẩn)`, children: grid("VE_SINH_BAN", ["Sạch", "Bẩn"]) },
                    {
                        key: "hdtn",
                        label: `HĐTN dưới cờ (${hdtn})`,
                        children: (
                            <>
                                {!isMonday && <Alert type="warning" showIcon title="HĐTN dưới cờ thường vào thứ Hai – kiểm tra lại ngày làm việc." style={{ marginBottom: 12 }} />}
                                <Typography.Paragraph type="secondary">Bật cho lớp tập trung quá 7 phút chưa ổn định (−10 điểm).</Typography.Paragraph>
                                {grid("HDTN_QUA_7P", ["Ổn", "Quá 7'"])}
                            </>
                        ),
                    },
                ]}
            />
        </>
    );
}
