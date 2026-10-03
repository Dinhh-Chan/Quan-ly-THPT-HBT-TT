import {
    AlertOutlined,
    AuditOutlined,
    BarChartOutlined,
    CalendarOutlined,
    CheckSquareOutlined,
    ClearOutlined,
    DashboardOutlined,
    FileExcelOutlined,
    FormOutlined,
    HistoryOutlined,
    IdcardOutlined,
    MessageOutlined,
    SettingOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    UnorderedListOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { AppRole } from "@/types";

export interface MenuNode {
    key: string;
    label: string;
    icon?: ReactNode;
    children?: MenuNode[];
}

const incident: MenuNode = { key: "/su-viec/bao-cao", label: "Báo cáo sự việc", icon: <AlertOutlined /> };

export const MENUS: Record<AppRole, MenuNode[]> = {
    LOP_TRUONG: [
        { key: "/lop/si-so", label: "Sĩ số hằng ngày", icon: <CheckSquareOutlined /> },
        { key: "/lop/tron-tiet", label: "Bỏ giờ / trốn tiết", icon: <FormOutlined /> },
        incident,
        { key: "/lop/bao-cao", label: "Báo cáo lớp", icon: <BarChartOutlined /> },
    ],
    THU_KY: [
        { key: "/lop/bao-cao-tuan", label: "Báo cáo thi đua tuần", icon: <FormOutlined /> },
        { key: "/lop/bao-cao", label: "Bảng thi đua của lớp", icon: <TrophyOutlined /> },
    ],
    GVCN: [
        { key: "/lop/si-so", label: "Sĩ số hằng ngày", icon: <CheckSquareOutlined /> },
        { key: "/lop/tron-tiet", label: "Bỏ giờ / trốn tiết", icon: <FormOutlined /> },
        { key: "/lop/bao-cao-tuan", label: "Báo cáo tuần (thư ký)", icon: <FormOutlined /> },
        incident,
        { key: "/lop/bao-cao", label: "Báo cáo & thống kê lớp", icon: <BarChartOutlined /> },
    ],
    GIAM_THI: [
        { key: "/giam-thi/nhap-nhanh", label: "Nhập nhanh vi phạm", icon: <ThunderboltOutlined /> },
        { key: "/giam-thi/import", label: "Import Excel đi muộn", icon: <FileExcelOutlined /> },
        { key: "/giam-thi/ve-sinh", label: "Vệ sinh & HĐTN", icon: <ClearOutlined /> },
        { key: "/giam-thi/danh-sach", label: "Danh sách vi phạm", icon: <UnorderedListOutlined /> },
        incident,
    ],
    QUAN_LY: [
        { key: "/quan-ly/dashboard", label: "Hôm nay", icon: <DashboardOutlined /> },
        { key: "/quan-ly/thi-dua", label: "Bảng thi đua tuần", icon: <TrophyOutlined /> },
        { key: "/quan-ly/tong-hop", label: "Tổng hợp tháng / HK", icon: <CalendarOutlined /> },
        { key: "/quan-ly/su-viec", label: "Sự việc bất thường", icon: <AlertOutlined /> },
        { key: "/quan-ly/khieu-nai", label: "Khiếu nại", icon: <MessageOutlined /> },
        {
            key: "bao-cao",
            label: "Báo cáo – thống kê",
            icon: <BarChartOutlined />,
            children: [
                { key: "/quan-ly/dien-bien", label: "Diễn biến thi đua" },
                { key: "/quan-ly/chuyen-can", label: "Chuyên cần" },
                { key: "/quan-ly/vi-pham", label: "Vi phạm nền nếp" },
                { key: "/quan-ly/ho-so", label: "Hồ sơ học sinh" },
            ],
        },
        { key: "/quan-ly/hoat-dong", label: "Hoạt động Đoàn", icon: <TeamOutlined /> },
        {
            key: "quan-tri",
            label: "Quản trị",
            icon: <SettingOutlined />,
            children: [
                { key: "/quan-ly/hoc-sinh", label: "Danh sách học sinh", icon: <IdcardOutlined /> },
                { key: "/quan-ly/tai-khoan", label: "Tài khoản", icon: <UserOutlined /> },
                { key: "/quan-ly/nam-hoc", label: "Năm học & lớp", icon: <CalendarOutlined /> },
                { key: "/quan-ly/quy-che", label: "Quy định điểm thi đua", icon: <AuditOutlined /> },
                { key: "/quan-ly/cau-hinh", label: "Cấu hình cảnh báo", icon: <SettingOutlined /> },
                { key: "/quan-ly/nhat-ky", label: "Nhật ký thay đổi", icon: <HistoryOutlined /> },
            ],
        },
    ],
};

export const flattenMenu = (nodes: MenuNode[]): MenuNode[] => nodes.flatMap((n) => (n.children ? flattenMenu(n.children) : [n]));
