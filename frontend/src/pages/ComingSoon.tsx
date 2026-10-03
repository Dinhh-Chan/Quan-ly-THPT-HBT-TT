import { Result } from "antd";

/** Trang giữ chỗ cho chức năng sẽ bổ sung sau */
export default function ComingSoon({ title }: { title?: string }) {
    return <Result status="info" title={title || "Đang phát triển"} subTitle="Chức năng này sẽ được bổ sung sau." />;
}
