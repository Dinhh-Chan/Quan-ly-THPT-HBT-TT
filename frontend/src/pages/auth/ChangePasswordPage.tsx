import { App, Button, Card, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/services";
import { useAuth } from "@/stores/auth";

export default function ChangePasswordPage({ forced }: { forced?: boolean }) {
    const { message } = App.useApp();
    const refreshMe = useAuth((s) => s.refreshMe);
    const logout = useAuth((s) => s.logout);
    const navigate = useNavigate();

    const submit = async (v: { oldPass: string; newPass: string }) => {
        try {
            await authApi.changePassword(v.oldPass, v.newPass);
            message.success("Đã đổi mật khẩu");
            await refreshMe();
            navigate("/");
        } catch (e) {
            message.error((e as Error).message);
        }
    };

    const card = (
        <Card style={{ width: "100%", maxWidth: 420 }}>
            <Typography.Title level={4}>{forced ? "Đổi mật khẩu lần đầu" : "Đổi mật khẩu"}</Typography.Title>
            {forced && <Typography.Paragraph type="secondary">Vì lý do bảo mật, bạn cần đặt mật khẩu mới trước khi sử dụng.</Typography.Paragraph>}
            <Form layout="vertical" onFinish={submit}>
                <Form.Item name="oldPass" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="newPass" label="Mật khẩu mới" rules={[{ required: true }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label="Nhập lại mật khẩu mới"
                    dependencies={["newPass"]}
                    rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                            validator: (_, v) => (v === getFieldValue("newPass") ? Promise.resolve() : Promise.reject(new Error("Không khớp"))),
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                    Lưu
                </Button>
                {forced && (
                    <Button type="link" block onClick={() => logout()}>
                        Đăng xuất
                    </Button>
                )}
            </Form>
        </Card>
    );
    return forced ? <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>{card}</div> : card;
}
