import { DownloadOutlined, EditOutlined, PlusOutlined, SwapOutlined, UploadOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, DatePicker, Dropdown, Flex, Form, Input, Modal, Select, Table, Tag, Upload } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/services";
import ClassSelect from "@/components/common/ClassSelect";
import PageHeader from "@/components/common/PageHeader";
import { useClasses, useWorkingWeek } from "@/hooks/useData";
import type { Student, StudentStatus } from "@/types";
import { fmtDate, todayStr } from "@/utils/date";
import { exportXlsx, readXlsx } from "@/utils/excel";
import { removeAccent } from "@/utils/text";

const STATUS: Record<StudentStatus, [string, string]> = {
    DANG_HOC: ["Đang học", "green"],
    CHUYEN_DI: ["Chuyển đi", "orange"],
    NGHI_HOC: ["Nghỉ học", "red"],
};

interface ImportRow {
    key: number;
    code: string;
    fullname: string;
    className: string;
    classId?: string;
    gender?: "Male" | "Female";
    dob?: string;
    error?: string;
}

/** Danh sách học sinh nguồn. Không xóa học sinh – chỉ đổi trạng thái để giữ lịch sử. */
export default function StudentsPage() {
    const { message } = App.useApp();
    const qc = useQueryClient();
    const { classes, className } = useClasses();
    const { date } = useWorkingWeek();
    const [classId, setClassId] = useState<string>();
    const [status, setStatus] = useState<StudentStatus | "all">("DANG_HOC");
    const [keyword, setKeyword] = useState("");
    const [editing, setEditing] = useState<Partial<Student> | null>(null);
    const [transfer, setTransfer] = useState<Student | null>(null);
    const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
    const [form] = Form.useForm();
    const [transferForm] = Form.useForm();

    const { data = [], isFetching } = useQuery({ queryKey: ["student", "admin"], queryFn: () => api.students.many({ sort: { fullname: 1 } }) });

    const shown = useMemo(() => {
        const kw = removeAccent(keyword);
        return data
            .filter((s) => (!classId || s.classId === classId) && (status === "all" || s.status === status))
            .filter((s) => !kw || s.nameNoAccent.includes(kw) || s.code.toLowerCase().includes(kw))
            .sort((a, b) => className(a.classId).localeCompare(className(b.classId), "vi", { numeric: true }) || a.fullname.split(" ").pop()!.localeCompare(b.fullname.split(" ").pop()!, "vi"));
    }, [data, classId, status, keyword, className]);

    const invalidate = () => qc.invalidateQueries({ queryKey: ["student"] });

    const save = useMutation({
        mutationFn: async (v: Partial<Student> & { dobDay?: dayjs.Dayjs }) => {
            const dto: Partial<Student> = {
                code: v.code!.trim(),
                fullname: v.fullname!.trim().replace(/\s+/g, " "),
                nameNoAccent: removeAccent(v.fullname!),
                gender: v.gender,
                dob: v.dobDay ? v.dobDay.format("YYYY-MM-DD") : undefined,
            };
            if (editing?._id) return api.students.update(editing._id, dto);
            if (data.some((s) => s.code === dto.code)) throw new Error(`Mã học sinh ${dto.code} đã tồn tại`);
            return api.students.create({ ...dto, classId: v.classId, status: "DANG_HOC", classHistory: [{ classId: v.classId!, from: date }] });
        },
        onSuccess: () => {
            message.success("Đã lưu học sinh");
            setEditing(null);
            invalidate();
        },
        onError: (e) => message.error((e as Error).message),
    });

    const doTransfer = useMutation({
        mutationFn: async (v: { classId: string; from: dayjs.Dayjs }) => {
            const from = v.from.format("YYYY-MM-DD");
            const history = (transfer!.classHistory ?? [{ classId: transfer!.classId, from: "" }]).map((h) => (h.to ? h : { ...h, to: dayjs(from).subtract(1, "day").format("YYYY-MM-DD") }));
            return api.students.update(transfer!._id, { classId: v.classId, classHistory: [...history, { classId: v.classId, from }] });
        },
        onSuccess: () => {
            message.success("Đã chuyển lớp – vi phạm cũ vẫn tính cho lớp cũ");
            setTransfer(null);
            invalidate();
        },
    });

    const setStudentStatus = (s: Student, st: StudentStatus) =>
        api.students.update(s._id, { status: st }).then(() => {
            message.success(`${s.fullname}: ${STATUS[st][0]}`);
            invalidate();
        });

    // ---------- Import Excel ----------
    const template = () =>
        exportXlsx("Mau-import-hoc-sinh", [
            {
                name: "Học sinh",
                header: [["Mã HS", "Họ tên", "Lớp", "Giới tính (Nam/Nữ)", "Ngày sinh (dd/mm/yyyy)"]],
                rows: [["HS10001", "Nguyễn Văn An", "10A1", "Nam", "15/03/2011"]],
                widths: [12, 28, 8, 18, 22],
            },
        ]);

    const handleImport = async (file: File) => {
        const rows = await readXlsx(file);
        const hi = rows.findIndex((r) => r.some((c) => removeAccent(String(c ?? "")).includes("ho ten")));
        if (hi < 0) {
            message.error("Không tìm thấy cột 'Họ tên'");
            return false;
        }
        const h = rows[hi].map((c) => removeAccent(String(c ?? "")));
        const col = (k: string) => h.findIndex((x) => x.includes(k));
        const [ci, ni, li, gi, di] = [col("ma"), col("ho ten"), col("lop"), col("gioi"), col("ngay sinh")];
        const classByName = new Map(classes.map((c) => [c.name.toUpperCase(), c._id]));
        const existing = new Set(data.map((s) => s.code));
        const seen = new Set<string>();
        const out = rows.slice(hi + 1).filter((r) => String(r[ni] ?? "").trim()).map((r, i): ImportRow => {
            const code = String(r[ci] ?? "").trim();
            const cname = String(r[li] ?? "").trim().toUpperCase();
            const g = removeAccent(String(r[gi] ?? ""));
            const dRaw = r[di];
            const d = dRaw instanceof Date ? dayjs(dRaw) : dayjs(String(dRaw ?? ""), ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD"], true);
            const row: ImportRow = {
                key: i,
                code,
                fullname: String(r[ni]).trim().replace(/\s+/g, " "),
                className: cname,
                classId: classByName.get(cname),
                gender: g.startsWith("nam") ? "Male" : g.startsWith("nu") ? "Female" : undefined,
                dob: d.isValid() ? d.format("YYYY-MM-DD") : undefined,
            };
            if (!code) row.error = "Thiếu mã HS";
            else if (existing.has(code)) row.error = "Mã HS đã có";
            else if (seen.has(code)) row.error = "Trùng mã trong file";
            else if (!row.classId) row.error = `Không có lớp "${cname}"`;
            seen.add(code);
            return row;
        });
        setImportRows(out);
        return false;
    };

    const confirmImport = useMutation({
        mutationFn: () =>
            api.students.createMany(
                importRows!
                    .filter((r) => !r.error)
                    .map((r) => ({
                        code: r.code,
                        fullname: r.fullname,
                        nameNoAccent: removeAccent(r.fullname),
                        classId: r.classId,
                        gender: r.gender,
                        dob: r.dob,
                        status: "DANG_HOC" as const,
                        classHistory: [{ classId: r.classId!, from: todayStr() }],
                    })),
            ),
        onSuccess: (res) => {
            message.success(`Đã thêm ${res.length} học sinh`);
            setImportRows(null);
            invalidate();
        },
        onError: (e) => message.error((e as Error).message),
    });

    const exportList = () =>
        exportXlsx("Danh-sach-hoc-sinh", [
            {
                name: "Học sinh",
                title: `DANH SÁCH HỌC SINH${classId ? ` LỚP ${className(classId)}` : ""}`,
                header: [["STT", "Mã HS", "Họ tên", "Lớp", "Giới tính", "Ngày sinh", "Trạng thái"]],
                rows: shown.map((s, i) => [i + 1, s.code, s.fullname, className(s.classId), s.gender === "Male" ? "Nam" : s.gender === "Female" ? "Nữ" : "", fmtDate(s.dob), STATUS[s.status][0]]),
                widths: [6, 12, 28, 8, 10, 12, 12],
            },
        ]);

    const openEdit = (s?: Student) => {
        setEditing(s ?? {});
        form.setFieldsValue(s ? { ...s, dobDay: s.dob ? dayjs(s.dob) : undefined } : { code: "", fullname: "", classId, gender: undefined, dobDay: undefined });
    };

    return (
        <>
            <PageHeader
                title="Danh sách học sinh"
                subtitle={`${shown.length} học sinh`}
                extra={
                    <>
                        <Button icon={<DownloadOutlined />} onClick={template}>
                            File mẫu
                        </Button>
                        <Upload accept=".xlsx" showUploadList={false} beforeUpload={handleImport}>
                            <Button icon={<UploadOutlined />}>Import Excel</Button>
                        </Upload>
                        <Button icon={<DownloadOutlined />} onClick={exportList}>
                            Xuất Excel
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
                            Thêm học sinh
                        </Button>
                    </>
                }
            />
            <Card>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                    <Input.Search allowClear placeholder="Tìm theo tên (không dấu) hoặc mã HS" style={{ maxWidth: 320 }} onChange={(e) => setKeyword(e.target.value)} />
                    <ClassSelect value={classId} onChange={setClassId} allowAll />
                    <Select
                        value={status}
                        onChange={setStatus}
                        style={{ width: 150 }}
                        options={[{ value: "all", label: "Mọi trạng thái" }, ...(Object.keys(STATUS) as StudentStatus[]).map((s) => ({ value: s, label: STATUS[s][0] }))]}
                    />
                </Flex>
                <Table
                    size="small"
                    rowKey="_id"
                    loading={isFetching && !data.length}
                    dataSource={shown}
                    pagination={{ pageSize: 50, showSizeChanger: true }}
                    scroll={{ x: 800 }}
                    columns={[
                        { title: "Mã HS", dataIndex: "code", width: 100 },
                        { title: "Họ tên", dataIndex: "fullname", render: (n, s) => <Link to={`/quan-ly/ho-so/${s._id}`}>{n}</Link> },
                        { title: "Lớp", dataIndex: "classId", render: className, width: 70 },
                        { title: "Giới tính", dataIndex: "gender", width: 90, render: (g) => (g === "Male" ? "Nam" : g === "Female" ? "Nữ" : "") },
                        { title: "Ngày sinh", dataIndex: "dob", width: 110, render: fmtDate },
                        { title: "Trạng thái", dataIndex: "status", width: 110, render: (s: StudentStatus) => <Tag color={STATUS[s][1]}>{STATUS[s][0]}</Tag> },
                        {
                            title: "",
                            width: 130,
                            render: (_, s) => (
                                <Flex gap={4}>
                                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(s)} />
                                    <Button
                                        size="small"
                                        icon={<SwapOutlined />}
                                        title="Chuyển lớp"
                                        disabled={s.status !== "DANG_HOC"}
                                        onClick={() => {
                                            setTransfer(s);
                                            transferForm.setFieldsValue({ classId: undefined, from: dayjs(date) });
                                        }}
                                    />
                                    <Dropdown
                                        menu={{
                                            items: (Object.keys(STATUS) as StudentStatus[]).filter((st) => st !== s.status).map((st) => ({ key: st, label: `Đặt: ${STATUS[st][0]}` })),
                                            onClick: ({ key }) => setStudentStatus(s, key as StudentStatus),
                                        }}
                                    >
                                        <Button size="small">…</Button>
                                    </Dropdown>
                                </Flex>
                            ),
                        },
                    ]}
                />
            </Card>

            <Modal open={!!editing} title={editing?._id ? "Sửa học sinh" : "Thêm học sinh"} onCancel={() => setEditing(null)} onOk={() => form.validateFields().then((v) => save.mutate(v))} confirmLoading={save.isPending}>
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã học sinh" rules={[{ required: true }]}>
                        <Input disabled={!!editing?._id} />
                    </Form.Item>
                    <Form.Item name="fullname" label="Họ tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    {!editing?._id && (
                        <Form.Item name="classId" label="Lớp" rules={[{ required: true, message: "Chọn lớp" }]}>
                            <ClassSelect onChange={() => {}} />
                        </Form.Item>
                    )}
                    <Flex gap={12}>
                        <Form.Item name="gender" label="Giới tính" style={{ flex: 1 }}>
                            <Select
                                allowClear
                                options={[
                                    { value: "Male", label: "Nam" },
                                    { value: "Female", label: "Nữ" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item name="dobDay" label="Ngày sinh" style={{ flex: 1 }}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                        </Form.Item>
                    </Flex>
                    {editing?._id && <Alert type="info" showIcon title="Đổi lớp dùng nút Chuyển lớp để giữ lịch sử." />}
                </Form>
            </Modal>

            <Modal open={!!transfer} title={`Chuyển lớp: ${transfer?.fullname} (${className(transfer?.classId)})`} onCancel={() => setTransfer(null)} onOk={() => transferForm.validateFields().then((v) => doTransfer.mutate(v))} confirmLoading={doTransfer.isPending}>
                <Form form={transferForm} layout="vertical">
                    <Form.Item name="classId" label="Lớp mới" rules={[{ required: true, message: "Chọn lớp mới" }]}>
                        <ClassSelect onChange={() => {}} />
                    </Form.Item>
                    <Form.Item name="from" label="Từ ngày" rules={[{ required: true }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
                <Alert type="info" showIcon title="Vi phạm, vắng trước ngày chuyển vẫn tính cho lớp cũ." />
            </Modal>

            <Modal
                open={!!importRows}
                title="Xem trước import học sinh"
                width={900}
                onCancel={() => setImportRows(null)}
                onOk={() => confirmImport.mutate()}
                okText={`Thêm ${importRows?.filter((r) => !r.error).length ?? 0} học sinh hợp lệ`}
                okButtonProps={{ disabled: !importRows?.some((r) => !r.error) }}
                confirmLoading={confirmImport.isPending}
            >
                <Table
                    size="small"
                    rowKey="key"
                    dataSource={importRows ?? []}
                    pagination={{ pageSize: 15 }}
                    onRow={(r) => ({ style: { background: r.error ? "#fff1f0" : "#f6ffed" } })}
                    columns={[
                        { title: "Mã HS", dataIndex: "code" },
                        { title: "Họ tên", dataIndex: "fullname" },
                        { title: "Lớp", dataIndex: "className" },
                        { title: "Giới tính", dataIndex: "gender", render: (g) => (g === "Male" ? "Nam" : g === "Female" ? "Nữ" : "") },
                        { title: "Ngày sinh", dataIndex: "dob", render: fmtDate },
                        { title: "Kết quả", dataIndex: "error", render: (e) => (e ? <Tag color="red">{e}</Tag> : <Tag color="green">Hợp lệ</Tag>) },
                    ]}
                />
            </Modal>
        </>
    );
}
