import { App, Button, Card, Input, Modal, Segmented, Table, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { F } from "@/api/query";
import { api } from "@/api/services";
import PageHeader from "@/components/common/PageHeader";
import { DEDUCTION_LABEL } from "@/constants";
import { useClasses, useLockedWeeks } from "@/hooks/useData";
import type { Complaint, DeductionKey } from "@/types";
import { fmtDateTime } from "@/utils/date";

/** Khiếu nại số liệu do hệ thống điền: thư ký gửi, cấp quản lý xem xét và phản hồi */
export default function ComplaintsPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { className } = useClasses();
    const { data: locked } = useLockedWeeks();
    const [status, setStatus] = useState<"MOI" | "DA_XU_LY" | "all">("MOI");
    const [current, setCurrent] = useState<Complaint | null>(null);
    const [response, setResponse] = useState("");

    const { data = [], isFetching } = useQuery({
        queryKey: ["complaint", status],
        queryFn: () => api.complaints.many({ filters: status === "all" ? [] : [F.eq("status", status)], sort: { createdAt: -1 } }),
    });

    const resolve = useMutation({
        mutationFn: () => api.complaints.update(current!._id, { status: "DA_XU_LY", response: response.trim() }),
        onSuccess: () => {
            message.success("Đã phản hồi khiếu nại");
            setCurrent(null);
            setResponse("");
            qc.invalidateQueries({ queryKey: ["complaint"] });
            qc.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const isLocked = (w: number) => !!locked?.some((x) => x.weekNo === w);

    return (
        <>
            <PageHeader title="Khiếu nại số liệu thi đua" subtitle="Sửa số liệu tại nguồn (vi phạm, sĩ số…) rồi phản hồi cho lớp. Tuần đã chốt cần mở chốt trước khi sửa." />
            <Card>
                <Segmented
                    style={{ marginBottom: 12 }}
                    value={status}
                    onChange={(v) => setStatus(v as typeof status)}
                    options={[
                        { label: "Chờ xử lý", value: "MOI" },
                        { label: "Đã xử lý", value: "DA_XU_LY" },
                        { label: "Tất cả", value: "all" },
                    ]}
                />
                <Table
                    size="small"
                    rowKey="_id"
                    loading={isFetching && !data.length}
                    dataSource={data}
                    scroll={{ x: 800 }}
                    columns={[
                        { title: "Gửi lúc", dataIndex: "createdAt", render: fmtDateTime, width: 140 },
                        { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                        {
                            title: "Tuần",
                            dataIndex: "weekNo",
                            width: 100,
                            render: (w: number) => (
                                <>
                                    {w} {isLocked(w) && <Tag color="purple">Đã chốt</Tag>}
                                </>
                            ),
                        },
                        { title: "Chỉ tiêu", dataIndex: "field", width: 130, render: (f: string) => DEDUCTION_LABEL[f as DeductionKey] ?? f },
                        { title: "Nội dung", dataIndex: "content" },
                        { title: "Người gửi", dataIndex: "createdByName", responsive: ["lg"] },
                        {
                            title: "",
                            width: 120,
                            render: (_, c) =>
                                c.status === "MOI" ? (
                                    <Button size="small" type="primary" onClick={() => setCurrent(c)}>
                                        Phản hồi
                                    </Button>
                                ) : (
                                    <Typography.Text type="secondary" title={c.response}>
                                        Đã xử lý
                                    </Typography.Text>
                                ),
                        },
                    ]}
                    expandable={{
                        rowExpandable: (c) => !!c.response,
                        expandedRowRender: (c) => (
                            <span>
                                <b>Phản hồi:</b> {c.response}
                            </span>
                        ),
                    }}
                />
            </Card>
            <Modal
                open={!!current}
                title={current && `Khiếu nại lớp ${className(current.classId)} – tuần ${current.weekNo}`}
                onCancel={() => setCurrent(null)}
                onOk={() => resolve.mutate()}
                okText="Gửi phản hồi"
                okButtonProps={{ disabled: !response.trim(), loading: resolve.isPending }}
            >
                <Typography.Paragraph>{current?.content}</Typography.Paragraph>
                <Typography.Paragraph type="secondary">
                    Kiểm tra số liệu tại <Link to="/giam-thi/danh-sach">Danh sách vi phạm</Link> hoặc <Link to="/quan-ly/thi-dua">Bảng thi đua tuần</Link>.
                </Typography.Paragraph>
                <Input.TextArea rows={4} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Ví dụ: Đã xóa lượt đi muộn ngày 15/9 của em A vì em đã chuyển lớp." />
            </Modal>
        </>
    );
}
