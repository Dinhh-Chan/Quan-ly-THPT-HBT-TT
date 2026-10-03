import { EditOutlined, KeyOutlined, LockOutlined, MinusCircleOutlined, PlusOutlined, TeamOutlined, UnlockOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Checkbox, Flex, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, authApi } from "@/api/services";
import ClassSelect from "@/components/common/ClassSelect";
import PageHeader from "@/components/common/PageHeader";
import { ROLE_LABEL } from "@/constants";
import { useClasses, useScope } from "@/hooks/useData";
import type { AppRole, AppUser, RoleAssignment } from "@/types";
import { exportXlsx } from "@/utils/excel";

const ROLE_COLOR: Record<AppRole, string> = { QUAN_LY: "magenta", GVCN: "blue", LOP_TRUONG: "green", THU_KY: "cyan", GIAM_THI: "orange" };
const CLASS_ROLES: AppRole[] = ["GVCN", "LOP_TRUONG", "THU_KY"];
const BULK_PREFIX: Partial<Record<AppRole, string>> = { LOP_TRUONG: "lt", THU_KY: "tk", GVCN: "gvcn" };

/** Mật khẩu tạm 8 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l) */
const genPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

interface FormValues {
    username: string;
    fullname: string;
    phone?: string;
    email?: string;
    password?: string;
    roles: RoleAssignment[];
}

/** Tài khoản người dùng: một người có thể giữ nhiều vai trò (ví dụ vừa lớp trưởng vừa thư ký) */
export default function AccountsPage() {
    const { message, modal } = App.useApp();
    const qc = useQueryClient();
    const { user: me } = useScope();
    const { classes, className } = useClasses();
    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState<AppRole>();
    const [editing, setEditing] = useState<Partial<AppUser> | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [form] = Form.useForm<FormValues>();
    const [bulkForm] = Form.useForm<{ roles: AppRole[]; classIds: string[] }>();

    const { data = [], isFetching } = useQuery({ queryKey: ["user", "list"], queryFn: () => api.users.many({ sort: { username: 1 } }) });

    const shown = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        return data.filter(
            (u) =>
                (!roleFilter || u.roles.some((r) => r.role === roleFilter)) &&
                (!kw || u.username.includes(kw) || u.fullname.toLowerCase().includes(kw)),
        );
    }, [data, keyword, roleFilter]);

    const invalidate = () => qc.invalidateQueries({ queryKey: ["user"] });
    const onError = (e: Error) => message.error(e.message);

    const save = useMutation({
        mutationFn: async (v: FormValues) => {
            const roles = v.roles.filter((r) => r?.role).map((r) => (CLASS_ROLES.includes(r.role) ? r : { role: r.role }));
            const systemRole = roles.some((r) => r.role === "QUAN_LY") ? "Admin" : "User";
            if (editing?._id) return api.users.update(editing._id, { fullname: v.fullname, phone: v.phone, email: v.email, roles, systemRole });
            return api.users.create({ ...v, username: v.username.trim().toLowerCase(), roles, systemRole, mustChangePassword: true });
        },
        onSuccess: () => {
            message.success("Đã lưu tài khoản");
            setEditing(null);
            invalidate();
        },
        onError,
    });

    const toggleLock = useMutation({
        mutationFn: (u: AppUser) => api.users.update(u._id, { locked: !u.locked }),
        onSuccess: (_, u) => {
            message.success(u.locked ? "Đã mở khóa" : "Đã khóa tài khoản");
            invalidate();
        },
        onError,
    });

    const resetPassword = (u: AppUser) => {
        const pass = genPassword();
        modal.confirm({
            title: `Cấp lại mật khẩu cho ${u.username}?`,
            content: "Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập tiếp theo.",
            okText: "Cấp lại",
            onOk: async () => {
                try {
                    await authApi.resetPassword(u._id, pass);
                    modal.success({
                        title: "Mật khẩu mới",
                        content: (
                            <>
                                Tài khoản <b>{u.username}</b>: <Tag style={{ fontSize: 16, padding: "2px 8px" }}>{pass}</Tag>
                                <div style={{ marginTop: 8, color: "#888" }}>Gửi mật khẩu này cho người dùng. Hệ thống không lưu lại để xem sau.</div>
                            </>
                        ),
                    });
                } catch (e) {
                    onError(e as Error);
                }
            },
        });
    };

    const bulkCreate = useMutation({
        mutationFn: async (v: { roles: AppRole[]; classIds: string[] }) => {
            const existing = new Set(data.map((u) => u.username));
            const items: (Partial<AppUser> & { password: string })[] = [];
            for (const cid of v.classIds) {
                const c = classes.find((x) => x._id === cid)!;
                for (const role of v.roles) {
                    const username = `${BULK_PREFIX[role]}.${c.name.toLowerCase()}`;
                    if (existing.has(username)) continue;
                    items.push({
                        username,
                        fullname: role === "GVCN" ? c.homeroomTeacherName || `GVCN ${c.name}` : `${ROLE_LABEL[role]} ${c.name}`,
                        password: genPassword(),
                        systemRole: "User",
                        roles: [{ role, classId: cid }],
                        mustChangePassword: true,
                    });
                }
            }
            await api.users.createMany(items);
            return items;
        },
        onSuccess: async (items) => {
            invalidate();
            setBulkOpen(false);
            bulkForm.resetFields();
            if (!items.length) return message.info("Các tài khoản đã có sẵn, không tạo thêm");
            message.success(`Đã tạo ${items.length} tài khoản, đang tải file mật khẩu`);
            await exportXlsx("Tai-khoan-moi", [
                {
                    name: "Tài khoản",
                    title: "DANH SÁCH TÀI KHOẢN CẤP MỚI",
                    header: [["Lớp", "Vai trò", "Tên đăng nhập", "Mật khẩu tạm"]],
                    rows: items.map((u) => [className(u.roles![0].classId), ROLE_LABEL[u.roles![0].role], u.username, u.password]),
                    widths: [8, 14, 18, 16],
                },
            ]);
        },
        onError,
    });

    const openEdit = (u?: AppUser) => {
        setEditing(u ?? {});
        form.resetFields();
        form.setFieldsValue(u ? { ...u, roles: u.roles } : { roles: [{ role: "LOP_TRUONG" }], password: genPassword() });
    };

    return (
        <>
            <PageHeader
                title="Tài khoản"
                subtitle={`${data.length} tài khoản`}
                extra={
                    <>
                        <Button icon={<TeamOutlined />} onClick={() => setBulkOpen(true)}>
                            Tạo hàng loạt theo lớp
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
                            Thêm tài khoản
                        </Button>
                    </>
                }
            />
            <Card>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                    <Input.Search allowClear placeholder="Tìm tên đăng nhập, họ tên" style={{ width: 280 }} onChange={(e) => setKeyword(e.target.value)} />
                    <Select
                        allowClear
                        placeholder="Mọi vai trò"
                        style={{ width: 180 }}
                        value={roleFilter}
                        onChange={setRoleFilter}
                        options={Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }))}
                    />
                </Flex>
                <Table
                    size="small"
                    rowKey="_id"
                    loading={isFetching && !data.length}
                    dataSource={shown}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                    columns={[
                        { title: "Tên đăng nhập", dataIndex: "username", render: (v, u) => <span style={{ opacity: u.locked ? 0.5 : 1 }}>{v}</span> },
                        { title: "Họ tên", dataIndex: "fullname" },
                        {
                            title: "Vai trò",
                            dataIndex: "roles",
                            render: (roles: RoleAssignment[]) =>
                                roles.map((r, i) => (
                                    <Tag key={i} color={ROLE_COLOR[r.role]}>
                                        {ROLE_LABEL[r.role]}
                                        {r.classId ? ` ${className(r.classId)}` : ""}
                                    </Tag>
                                )),
                        },
                        { title: "Điện thoại", dataIndex: "phone", width: 120 },
                        {
                            title: "Trạng thái",
                            width: 140,
                            render: (_, u) => (
                                <>
                                    {u.locked ? <Tag color="red">Đã khóa</Tag> : <Tag color="green">Hoạt động</Tag>}
                                    {u.mustChangePassword && (
                                        <Tooltip title="Chưa đổi mật khẩu tạm">
                                            <Tag color="gold">MK tạm</Tag>
                                        </Tooltip>
                                    )}
                                </>
                            ),
                        },
                        {
                            title: "",
                            width: 130,
                            render: (_, u) => (
                                <Space size={4}>
                                    <Tooltip title="Sửa">
                                        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(u)} />
                                    </Tooltip>
                                    <Tooltip title="Cấp lại mật khẩu">
                                        <Button size="small" type="text" icon={<KeyOutlined />} onClick={() => resetPassword(u)} />
                                    </Tooltip>
                                    {u._id !== me?._id && (
                                        <Popconfirm title={u.locked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này? Người dùng sẽ không đăng nhập được."} onConfirm={() => toggleLock.mutate(u)}>
                                            <Tooltip title={u.locked ? "Mở khóa" : "Khóa"}>
                                                <Button size="small" type="text" danger={!u.locked} icon={u.locked ? <UnlockOutlined /> : <LockOutlined />} />
                                            </Tooltip>
                                        </Popconfirm>
                                    )}
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>

            <Modal
                open={!!editing}
                title={editing?._id ? `Sửa tài khoản ${editing.username}` : "Thêm tài khoản"}
                onCancel={() => setEditing(null)}
                onOk={() => form.validateFields().then((v) => save.mutate(v))}
                confirmLoading={save.isPending}
                okText="Lưu"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Flex gap={12}>
                        <Form.Item name="username" label="Tên đăng nhập" style={{ flex: 1 }} rules={[{ required: true, pattern: /^[a-zA-Z0-9._-]+$/, message: "Chỉ gồm chữ không dấu, số, dấu chấm" }]}>
                            <Input disabled={!!editing?._id} placeholder="lt.10a1" />
                        </Form.Item>
                        <Form.Item name="fullname" label="Họ tên" style={{ flex: 1 }} rules={[{ required: true, message: "Nhập họ tên" }]}>
                            <Input />
                        </Form.Item>
                    </Flex>
                    <Flex gap={12}>
                        <Form.Item name="phone" label="Điện thoại" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="email" label="Email" style={{ flex: 1 }} rules={[{ type: "email", message: "Email không hợp lệ" }]}>
                            <Input />
                        </Form.Item>
                    </Flex>
                    {!editing?._id && (
                        <Form.Item name="password" label="Mật khẩu tạm" extra="Người dùng phải đổi mật khẩu ở lần đăng nhập đầu tiên." rules={[{ required: true, min: 6, message: "Tối thiểu 6 ký tự" }]}>
                            <Input />
                        </Form.Item>
                    )}
                    <Form.List name="roles" rules={[{ validator: async (_, v) => (v?.some((r: RoleAssignment) => r?.role) ? undefined : Promise.reject(new Error("Cần ít nhất một vai trò"))) }]}>
                        {(fields, { add, remove }, { errors }) => (
                            <>
                                <div style={{ marginBottom: 8, fontWeight: 500 }}>Vai trò</div>
                                {fields.map((f) => (
                                    <Space key={f.key} align="baseline" style={{ display: "flex" }}>
                                        <Form.Item name={[f.name, "role"]} style={{ marginBottom: 8 }} rules={[{ required: true, message: "Chọn vai trò" }]}>
                                            <Select style={{ width: 180 }} options={Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }))} />
                                        </Form.Item>
                                        <Form.Item noStyle shouldUpdate>
                                            {() =>
                                                CLASS_ROLES.includes(form.getFieldValue(["roles", f.name, "role"])) && (
                                                    <Form.Item name={[f.name, "classId"]} style={{ marginBottom: 8 }} rules={[{ required: true, message: "Chọn lớp" }]}>
                                                        <ClassSelect onChange={() => {}} placeholder="Lớp phụ trách" style={{ width: 160 }} />
                                                    </Form.Item>
                                                )
                                            }
                                        </Form.Item>
                                        {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(f.name)} />}
                                    </Space>
                                ))}
                                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => add({})}>
                                    Thêm vai trò
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            <Modal
                open={bulkOpen}
                title="Tạo tài khoản hàng loạt theo lớp"
                onCancel={() => setBulkOpen(false)}
                onOk={() => bulkForm.validateFields().then((v) => bulkCreate.mutate(v))}
                confirmLoading={bulkCreate.isPending}
                okText="Tạo và tải file mật khẩu"
            >
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 12 }}
                    title="Tên đăng nhập theo mẫu lt.10a1, tk.10a1, gvcn.10a1. Tài khoản đã tồn tại sẽ được bỏ qua. Mật khẩu tạm chỉ có trong file Excel tải về."
                />
                <Form form={bulkForm} layout="vertical" initialValues={{ roles: ["LOP_TRUONG", "THU_KY"] }}>
                    <Form.Item name="roles" label="Vai trò" rules={[{ required: true, message: "Chọn vai trò" }]}>
                        <Checkbox.Group options={CLASS_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
                    </Form.Item>
                    <Form.Item name="classIds" label="Lớp" rules={[{ required: true, message: "Chọn lớp" }]}>
                        <Select mode="multiple" showSearch={{ optionFilterProp: "label" }} options={classes.map((c) => ({ value: c._id, label: c.name }))} placeholder="Chọn lớp" />
                    </Form.Item>
                    <Space>
                        {[10, 11, 12].map((g) => (
                            <Button key={g} size="small" onClick={() => bulkForm.setFieldValue("classIds", classes.filter((c) => c.grade === g).map((c) => c._id))}>
                                Cả khối {g}
                            </Button>
                        ))}
                        <Button size="small" onClick={() => bulkForm.setFieldValue("classIds", classes.map((c) => c._id))}>
                            Toàn trường
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </>
    );
}
