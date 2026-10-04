import { CriterionKind } from "@module/scoring-criterion/common/constant";

/** Danh mục tiêu chí; mã khớp khóa engine FE (DeductionKey, ActivityCriterion, ORAL_*) */
export const CRITERIA: Array<{
    code: string;
    name: string;
    groupName: string;
    kind: CriterionKind;
}> = [
    {
        code: "DI_MUON",
        name: "Đi muộn",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "QUEN_THE",
        name: "Thẻ HS",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "DONG_PHUC",
        name: "Đồng phục",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "GIAY_DEP",
        name: "Giày dép",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "DAU_TOC",
        name: "Đầu tóc",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "NGHI_CO_PHEP",
        name: "Nghỉ có phép",
        groupName: "Chuyên cần",
        kind: CriterionKind.MINUS,
    },
    {
        code: "NGHI_KHONG_PHEP",
        name: "Nghỉ không phép",
        groupName: "Chuyên cần",
        kind: CriterionKind.MINUS,
    },
    {
        code: "TRON_TIET",
        name: "Bỏ giờ / trốn tiết",
        groupName: "Chuyên cần",
        kind: CriterionKind.MINUS,
    },
    {
        code: "GHI_SDB",
        name: "Ghi SĐB",
        groupName: "Học tập",
        kind: CriterionKind.MINUS,
    },
    {
        code: "HDTN_QUA_7P",
        name: "HĐTN dưới cờ",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "VE_SINH_BAN",
        name: "Vệ sinh bẩn",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "KHAC",
        name: "Khác",
        groupName: "Nền nếp",
        kind: CriterionKind.MINUS,
    },
    {
        code: "ORAL_HIGH",
        name: "Điểm miệng ≥ 8",
        groupName: "Học tập",
        kind: CriterionKind.PLUS,
    },
    {
        code: "ORAL_LOW",
        name: "Điểm miệng < 5",
        groupName: "Học tập",
        kind: CriterionKind.MINUS,
    },
    {
        code: "3.1",
        name: "Chăm sóc bồn cây / công trình thanh niên",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
    {
        code: "3.2",
        name: "Lao động hiệu quả",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
    {
        code: "4.1",
        name: "Giải Nhất cuộc thi Đoàn",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
    {
        code: "4.2",
        name: "Giải Nhì cuộc thi Đoàn",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
    {
        code: "4.3",
        name: "Giải Ba cuộc thi Đoàn",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
    {
        code: "4.4",
        name: "Giải Khuyến khích",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
    {
        code: "4.5",
        name: "Không tham gia cuộc thi (hạ 1 bậc)",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.DOWNGRADE,
    },
    {
        code: "4.6",
        name: "Tích cực từ thiện",
        groupName: "Hoạt động Đoàn",
        kind: CriterionKind.PLUS,
    },
];
