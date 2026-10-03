import { BellOutlined, KeyOutlined, LogoutOutlined, MenuOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";
import { App as AntApp, Badge, Button, Drawer, Dropdown, Empty, Flex, Grid, Layout, List, Menu, Popover, Select } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BRAND } from "@/config/brand";
import { ROLE_HOME, ROLE_LABEL } from "@/constants";
import { useClasses } from "@/hooks/useData";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/stores/auth";
import { useWorkingDate } from "@/stores/workingDate";
import { MENUS, type MenuNode } from "./menu";
import WorkingDateBar from "./WorkingDateBar";

const { Header, Sider, Content } = Layout;

const toItems = (nodes: MenuNode[]): NonNullable<React.ComponentProps<typeof Menu>["items"]> =>
    nodes.map((n) => ({ key: n.key, icon: n.icon, label: n.label, children: n.children ? toItems(n.children) : undefined }));

function NotificationBell() {
    const { data = [] } = useNotifications();
    const navigate = useNavigate();
    const { notification } = AntApp.useApp();
    const shown = useRef<Set<string> | null>(null);
    const [open, setOpen] = useState(false);

    // Cảnh báo đỏ bật lên khi có sự việc mới
    useEffect(() => {
        const incidents = data.filter((n) => n.id.startsWith("inc-") && n.level === "error");
        if (shown.current === null) {
            shown.current = new Set(incidents.map((n) => n.id));
            return;
        }
        incidents.forEach((n) => {
            if (shown.current!.has(n.id)) return;
            shown.current!.add(n.id);
            notification.error({ title: n.title, description: n.description, duration: 0, onClick: () => n.link && navigate(n.link) });
        });
    }, [data, navigate, notification]);

    const color = { error: "#ff4d4f", warning: "#faad14", info: "#1677ff" };
    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger="click"
            placement="bottomRight"
            content={
                <div style={{ width: 340, maxHeight: 420, overflow: "auto" }}>
                    {data.length === 0 ? (
                        <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                        <List
                            size="small"
                            dataSource={data}
                            renderItem={(n) => (
                                <List.Item
                                    style={{ cursor: n.link ? "pointer" : undefined, borderLeft: `3px solid ${color[n.level]}`, paddingLeft: 8 }}
                                    onClick={() => {
                                        if (n.link) navigate(n.link);
                                        setOpen(false);
                                    }}
                                >
                                    <List.Item.Meta title={n.title} description={n.description} />
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            }
        >
            <Badge count={data.length} size="small" color={data.some((n) => n.level === "error") ? "red" : "orange"}>
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
        </Popover>
    );
}

function RoleSwitcher() {
    const { user, activeRole, setActiveRole } = useAuth();
    const { className } = useClasses();
    const navigate = useNavigate();
    const qc = useQueryClient();
    if (!user || user.roles.length < 2) return null;
    const key = (r: { role: string; classId?: string }) => `${r.role}:${r.classId ?? ""}`;
    return (
        <Select
            value={activeRole ? key(activeRole) : undefined}
            suffixIcon={<SwapOutlined />}
            style={{ minWidth: 170 }}
            onChange={(v) => {
                const r = user.roles.find((x) => key(x) === v)!;
                setActiveRole(r);
                qc.invalidateQueries({ queryKey: ["notifications"] });
                navigate(ROLE_HOME[r.role]);
            }}
            options={user.roles.map((r) => ({
                value: key(r),
                label: `${ROLE_LABEL[r.role]}${r.classId ? ` ${className(r.classId)}` : ""}`,
            }))}
        />
    );
}

export default function AppLayout() {
    const screens = Grid.useBreakpoint();
    const mobile = !screens.md;
    const [drawer, setDrawer] = useState(false);
    const { user, activeRole, logout } = useAuth();
    const resetDate = useWorkingDate((s) => s.resetToday);
    const { className } = useClasses();
    const navigate = useNavigate();
    const location = useLocation();
    const menu = useMemo(() => (activeRole ? MENUS[activeRole.role] : []), [activeRole]);

    const menuEl = (
        <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["bao-cao", "quan-tri"]}
            items={toItems(menu)}
            onClick={({ key }) => {
                navigate(key);
                setDrawer(false);
            }}
            style={{ borderInlineEnd: 0 }}
        />
    );

    const brand = (
        <div className="brand-wrap">
            <div className="brand-authority">{BRAND.authority}</div>
            <div className="brand-block">
                <img src={BRAND.logoSmall} alt={`Logo ${BRAND.fullName}`} />
                <div>
                    <div className="school-prefix">Trường THPT</div>
                    <div className="school">Hai Bà Trưng</div>
                    <div className="district">{BRAND.district}</div>
                </div>
            </div>
        </div>
    );
    const roleBadge = activeRole && (
        <div className="brand-role">
            {ROLE_LABEL[activeRole.role]}
            {activeRole.classId ? ` · ${className(activeRole.classId)}` : ""}
        </div>
    );

    const userMenu = {
        items: [
            { key: "pw", icon: <KeyOutlined />, label: "Đổi mật khẩu" },
            { key: "out", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
        ],
        onClick: async ({ key }: { key: string }) => {
            if (key === "pw") navigate("/doi-mat-khau");
            if (key === "out") {
                await logout();
                resetDate();
                navigate("/login");
            }
        },
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {!mobile && (
                <Sider width={248} theme="light" style={{ borderRight: "1px solid #e8edf7", position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
                    <div className="brand-stripe" />
                    {brand}
                    {roleBadge}
                    {menuEl}
                </Sider>
            )}
            <Drawer open={mobile && drawer} onClose={() => setDrawer(false)} placement="left" size={260} styles={{ body: { padding: 0 }, header: { padding: 0 } }} title={brand}>
                {roleBadge}
                {menuEl}
            </Drawer>
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: mobile ? "0 8px" : "0 16px",
                        height: "auto",
                        lineHeight: "normal",
                        borderBottom: "1px solid #e8edf7",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    {mobile && <div className="brand-stripe" style={{ margin: "0 -8px" }} />}
                    <Flex align="center" justify="space-between" gap={8} wrap style={{ minHeight: 56, padding: "6px 0" }}>
                        <Flex align="center" gap={8} wrap>
                            {mobile && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawer(true)} />}
                            <WorkingDateBar compact={mobile} />
                        </Flex>
                        <Flex align="center" gap={8}>
                            {!mobile && <RoleSwitcher />}
                            <NotificationBell />
                            <Dropdown menu={userMenu} trigger={["click"]}>
                                <Button type="text" icon={<UserOutlined />}>
                                    {!mobile && user?.fullname}
                                </Button>
                            </Dropdown>
                        </Flex>
                    </Flex>
                    {mobile && (
                        <div style={{ paddingBottom: 6 }}>
                            <RoleSwitcher />
                        </div>
                    )}
                </Header>
                <Content style={{ padding: mobile ? 12 : 24, maxWidth: 1600, width: "100%", margin: "0 auto" }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
