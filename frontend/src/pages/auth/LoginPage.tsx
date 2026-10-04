import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, App, Button, Collapse, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetMockDb } from "@/api/mock/adapter";
import { BRAND } from "@/config/brand";
import { ENV } from "@/config/env";
import { ROLE_HOME } from "@/constants";
import { useAuth } from "@/stores/auth";

const DEMO = [
    ["admin", "Cấp quản lý"],
    ["doantruong", "Cấp quản lý (Đoàn)"],
    ["gvcn.10a1", "GVCN 10A1"],
    ["lt.10a1", "Lớp trưởng kiêm thư ký 10A1"],
    ["tk.10a2", "Thư ký 10A2"],
    ["giamthi1", "Giám thị"],
];

export default function LoginPage() {
    const login = useAuth((s) => s.login);
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [form] = Form.useForm();

    const submit = async (v: { username: string; password: string }) => {
        setLoading(true);
        setError(undefined);
        try {
            const u = await login(v.username, v.password);
            navigate(ROLE_HOME[useAuth.getState().activeRole?.role ?? u.roles[0].role]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <section className="login-hero" aria-hidden>
                {[BRAND.photos.building, BRAND.photos.students, BRAND.photos.assembly].map((src, i) => (
                    <div key={src} className="login-hero-photo" style={{ backgroundImage: `url(${src})`, animationDelay: `${i * 6}s` }} />
                ))}
                <div className="login-hero-overlay" />
                <div className="login-hero-content">
                    <img src={BRAND.logo} alt="" className="login-hero-logo" />
                    <div className="login-hero-authority">{BRAND.authority}</div>
                    <div className="login-hero-school">
                        <span>{BRAND.schoolName}</span>
                        <span className="login-hero-district">{BRAND.district}</span>
                    </div>
                    <p className="login-hero-tagline">Hệ thống quản lý nền nếp &amp; thi đua</p>
                    <div className="login-hero-founded">Tạo tháng {BRAND.launched}</div>
                </div>
                <div className="brand-stripe login-hero-stripe" />
            </section>
            <main className="login-panel">
            <div className="login-card">
                <img src={BRAND.logoSmall} alt={`Logo ${BRAND.fullName}`} className="login-card-logo" />
                <Typography.Title level={3} style={{ textAlign: "center", margin: "8px 0 0", color: BRAND.colors.blueDark }}>
                    Đăng nhập
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ textAlign: "center" }}>
                    Hệ thống quản lý nền nếp &amp; thi đua
                </Typography.Paragraph>
                {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}
                <Form form={form} layout="vertical" onFinish={submit} size="large">
                    <Form.Item name="username" rules={[{ required: true, message: "Nhập tài khoản" }]}>
                        <Input prefix={<UserOutlined />} placeholder="Tài khoản" autoCapitalize="none" autoFocus />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 46, fontWeight: 600 }}>
                        Đăng nhập
                    </Button>
                </Form>
                <Typography.Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12, textAlign: "center" }}>
                    Quên mật khẩu? Liên hệ cấp quản lý để được cấp lại.
                </Typography.Paragraph>
                {ENV.useMock && (
                    <Collapse
                        size="small"
                        items={[
                            {
                                key: "demo",
                                label: "Tài khoản dùng thử (mật khẩu 123456)",
                                children: (
                                    <>
                                        {DEMO.map(([u, label]) => (
                                            <div key={u}>
                                                <Typography.Link onClick={() => form.setFieldsValue({ username: u, password: "123456" })}>{u}</Typography.Link>{" "}
                                                <Typography.Text type="secondary">– {label}</Typography.Text>
                                            </div>
                                        ))}
                                        <Button
                                            size="small"
                                            danger
                                            style={{ marginTop: 8 }}
                                            onClick={() => {
                                                resetMockDb();
                                                message.success("Đã khởi tạo lại dữ liệu mẫu");
                                            }}
                                        >
                                            Khởi tạo lại dữ liệu mẫu
                                        </Button>
                                    </>
                                ),
                            },
                        ]}
                    />
                )}
            </div>
            <footer className="login-footer">
                {BRAND.authority}
                <br />© {new Date().getFullYear()} {BRAND.fullName}
            </footer>
            </main>
        </div>
    );
}
