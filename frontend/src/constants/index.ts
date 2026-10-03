import type {
    ActivityCriterion,
    AppRole,
    DeductionKey,
    IncidentStatus,
    IncidentType,
    Rank,
    ScoringRules,
    ViolationType,
} from "@/types";

export const ROLE_LABEL: Record<AppRole, string> = {
    QUAN_LY: "Cấp quản lý",
    GVCN: "GVCN",
    LOP_TRUONG: "Lớp trưởng",
    THU_KY: "Thư ký",
    GIAM_THI: "Giám thị",
};

/** Trang mặc định khi đăng nhập theo vai trò */
export const ROLE_HOME: Record<AppRole, string> = {
    QUAN_LY: "/quan-ly/dashboard",
    GVCN: "/lop/si-so",
    LOP_TRUONG: "/lop/si-so",
    THU_KY: "/lop/bao-cao-tuan",
    GIAM_THI: "/giam-thi/nhap-nhanh",
};

export const VIOLATION_LABEL: Record<ViolationType, string> = {
    DI_MUON: "Đi muộn",
    QUEN_THE: "Quên thẻ",
    DONG_PHUC: "Đồng phục",
    GIAY_DEP: "Giày dép",
    DAU_TOC: "Đầu tóc",
    TRON_TIET: "Trốn tiết",
    KHAC: "Khác",
    VE_SINH_BAN: "Vệ sinh bẩn",
    HDTN_QUA_7P: "HĐTN quá 7 phút",
};

/** Các lỗi giám thị nhập nhanh tại cổng (theo học sinh) */
export const QUICK_VIOLATIONS: ViolationType[] = [
    "DI_MUON",
    "QUEN_THE",
    "DONG_PHUC",
    "GIAY_DEP",
    "DAU_TOC",
    "TRON_TIET",
    "KHAC",
];

export const CLASS_LEVEL_VIOLATIONS: ViolationType[] = ["VE_SINH_BAN", "HDTN_QUA_7P"];

export const DEDUCTION_LABEL: Record<DeductionKey, string> = {
    DI_MUON: "Đi muộn",
    QUEN_THE: "Thẻ HS",
    DONG_PHUC: "Đồng phục",
    GIAY_DEP: "Giày dép",
    DAU_TOC: "Đầu tóc",
    NGHI_CO_PHEP: "Nghỉ có phép",
    NGHI_KHONG_PHEP: "Nghỉ không phép",
    TRON_TIET: "Bỏ giờ / trốn tiết",
    GHI_SDB: "Ghi SĐB",
    HDTN_QUA_7P: "HĐTN dưới cờ",
    VE_SINH_BAN: "Vệ sinh bẩn",
    KHAC: "Khác",
};

/** Thứ tự cột trên bảng thi đua tuần */
export const DEDUCTION_ORDER: DeductionKey[] = [
    "DI_MUON",
    "QUEN_THE",
    "DONG_PHUC",
    "GIAY_DEP",
    "DAU_TOC",
    "NGHI_CO_PHEP",
    "NGHI_KHONG_PHEP",
    "TRON_TIET",
    "GHI_SDB",
    "HDTN_QUA_7P",
    "VE_SINH_BAN",
    "KHAC",
];

export const INCIDENT_LABEL: Record<IncidentType, string> = {
    HUT_THUOC: "Hút thuốc / uống rượu bia",
    DANH_NHAU: "Đánh nhau",
    VO_LE: "Vô lễ với CB-GV-NV",
    PHA_TAI_SAN: "Phá hoại tài sản",
    ATGT: "Vi phạm ATGT có công văn",
    TAI_NAN: "Tai nạn / sức khỏe",
    KHAC: "Khác",
};

/** Loại sự việc thuộc tiêu chí 2.6–2.10: hạ 1 bậc khi đã xác minh vi phạm */
export const DOWNGRADE_INCIDENTS: IncidentType[] = [
    "HUT_THUOC",
    "DANH_NHAU",
    "VO_LE",
    "PHA_TAI_SAN",
    "ATGT",
];

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
    MOI: "Mới",
    DA_TIEP_NHAN: "Đã tiếp nhận",
    DA_XAC_MINH: "Đã xác minh",
    DA_XU_LY: "Đã xử lý",
};

export const INCIDENT_STATUS_COLOR: Record<IncidentStatus, string> = {
    MOI: "red",
    DA_TIEP_NHAN: "orange",
    DA_XAC_MINH: "blue",
    DA_XU_LY: "green",
};

export const ACTIVITY_LABEL: Record<ActivityCriterion, string> = {
    "3.1": "Chăm sóc bồn cây / công trình thanh niên",
    "3.2": "Lao động hiệu quả",
    "4.1": "Giải Nhất cuộc thi Đoàn",
    "4.2": "Giải Nhì cuộc thi Đoàn",
    "4.3": "Giải Ba cuộc thi Đoàn",
    "4.4": "Giải Khuyến khích",
    "4.5": "Không tham gia cuộc thi (hạ 1 bậc)",
    "4.6": "Tích cực từ thiện",
};

export const RANK_LABEL: Record<Rank, string> = {
    XS: "Xuất sắc",
    T: "Tốt",
    Kh: "Khá",
    Y: "Yếu",
};

export const RANK_COLOR: Record<Rank, string> = {
    XS: "magenta",
    T: "green",
    Kh: "gold",
    Y: "red",
};

export const RANK_ORDER: Rank[] = ["XS", "T", "Kh", "Y"];

export const ABSENCE_REASONS = ["Ốm", "Việc gia đình", "Đi khám bệnh", "Không rõ lý do", "Khác"];

/**
 * Quy chế mặc định. Đã áp dụng các điểm nhà trường chốt:
 * - Nghỉ không phép tính như bỏ giờ: −10 / buổi.
 * - Tổng điểm bị trừ có tính cả nghỉ học.
 */
export const DEFAULT_SCORING_RULES: Omit<ScoringRules, "_id"> = {
    effectiveFromWeek: 1,
    logbookMultiplier: 10,
    oralHighPoint: 2,
    oralLowPoint: 2,
    deductions: {
        DI_MUON: 1,
        QUEN_THE: 1,
        DONG_PHUC: 1,
        GIAY_DEP: 1,
        DAU_TOC: 1,
        NGHI_CO_PHEP: 1,
        NGHI_KHONG_PHEP: 10,
        TRON_TIET: 10,
        GHI_SDB: 1,
        HDTN_QUA_7P: 10,
        VE_SINH_BAN: 2,
        KHAC: 0,
    },
    bonuses: { "3.1": 10, "3.2": 10, "4.1": 20, "4.2": 10, "4.3": 5, "4.4": 3, "4.6": 10 },
    classification: { xsTopRank: 12, xsMin: 110, tMin: 90, khMin: 70 },
};

export const CHART_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#64748b"];
