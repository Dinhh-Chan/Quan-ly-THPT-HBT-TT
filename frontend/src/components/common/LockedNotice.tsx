import { Alert } from "antd";

export default function LockedNotice({ locked, isManager }: { locked: boolean; isManager?: boolean }) {
    if (!locked) return null;
    return (
        <Alert
            type={isManager ? "warning" : "info"}
            showIcon
            style={{ marginBottom: 16 }}
            title={isManager ? "Tuần đã chốt – mọi chỉnh sửa của cấp quản lý đều được ghi nhật ký." : "Tuần đã chốt – chỉ cấp quản lý được sửa dữ liệu."}
        />
    );
}
