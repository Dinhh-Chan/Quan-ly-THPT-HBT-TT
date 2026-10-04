// Mô hình dữ liệu dùng chung FE <-> BE. Mọi bản ghi đều có _id (string) như base backend.

export type AppRole = "QUAN_LY" | "GVCN" | "LOP_TRUONG" | "THU_KY" | "GIAM_THI";

export interface RoleAssignment {
    role: AppRole;
    /** Lớp phụ trách (GVCN, lớp trưởng, thư ký) */
    classId?: string;
}

export interface AppUser {
    _id: string;
    username: string;
    fullname: string;
    email?: string;
    phone?: string;
    systemRole: "Admin" | "User";
    roles: RoleAssignment[];
    mustChangePassword?: boolean;
    locked?: boolean;
    password?: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    accessExpireAt: number;
    refreshExpireAt: number;
}

export interface Pageable<T> {
    total: number;
    skip: number;
    limit: number;
    page: number;
    result: T[];
}

// ---------- Năm học ----------
export interface SchoolYear {
    _id: string;
    name: string; // "2026-2027"
    /** Ngày đầu tuần 1 (YYYY-MM-DD). Mỗi tuần là 7 ngày liên tiếp kể từ ngày này. */
    week1StartDate: string;
    totalWeeks: number;
    /** Tuần đầu tiên của học kỳ 2 */
    semester2StartWeek: number;
    holidays: string[];
    isCurrent: boolean;
}

export interface SchoolClass {
    _id: string;
    name: string; // 10A1
    grade: 10 | 11 | 12;
    homeroomTeacherName?: string;
}

export type StudentStatus = "DANG_HOC" | "CHUYEN_DI" | "NGHI_HOC";

export interface Student {
    _id: string;
    code: string;
    fullname: string;
    /** Họ tên không dấu, chữ thường – dùng để tìm kiếm */
    nameNoAccent: string;
    classId: string;
    status: StudentStatus;
    gender?: "Male" | "Female";
    dob?: string;
    /** Lịch sử chuyển lớp */
    classHistory?: { classId: string; from: string; to?: string }[];
}

// ---------- Sĩ số ----------
export type Session = "SANG" | "CHIEU";
export type AbsenceSession = "SANG" | "CHIEU" | "CA_NGAY";

export interface Absence {
    studentId: string;
    studentName: string;
    excused: boolean;
    reason?: string;
    session: AbsenceSession;
}

export interface AttendanceReport {
    _id: string;
    classId: string;
    date: string;
    session: Session;
    total: number;
    absentCount: number;
    presentCount: number;
    absences: Absence[];
    reporterId: string;
    reporterName: string;
    submittedAt: string;
}

// ---------- Vi phạm nền nếp ----------
export type ViolationType =
    | "DI_MUON"
    | "QUEN_THE"
    | "DONG_PHUC"
    | "GIAY_DEP"
    | "DAU_TOC"
    | "TRON_TIET"
    | "KHAC"
    | "VE_SINH_BAN"
    | "HDTN_QUA_7P";

export interface Violation {
    _id: string;
    type: ViolationType;
    /** Rỗng với lỗi cấp lớp (vệ sinh, HĐTN) */
    studentId?: string;
    studentName?: string;
    classId: string;
    date: string;
    note?: string;
    source: "MANUAL" | "EXCEL";
    createdById: string;
    createdByName: string;
    createdByRole: AppRole;
    createdAt?: string;
}

// ---------- Sự việc bất thường ----------
export type IncidentType =
    | "HUT_THUOC"
    | "DANH_NHAU"
    | "VO_LE"
    | "PHA_TAI_SAN"
    | "ATGT"
    | "TAI_NAN"
    | "KHAC";

export type IncidentStatus = "MOI" | "DA_TIEP_NHAN" | "DA_XAC_MINH" | "DA_XU_LY";

export interface IncidentStudent {
    studentId: string;
    studentName: string;
    classId: string;
}

export interface Incident {
    _id: string;
    type: IncidentType;
    severity: "KHAN_CAP" | "THONG_THUONG";
    students: IncidentStudent[];
    classIds: string[];
    date: string;
    occurredAt: string;
    location?: string;
    description?: string;
    photos?: string[];
    status: IncidentStatus;
    receivedByName?: string;
    receivedAt?: string;
    verifyResult?: "VI_PHAM" | "KHONG_VI_PHAM";
    verifiedAt?: string;
    handling?: string;
    handledAt?: string;
    reporterId: string;
    reporterName: string;
    createdAt: string;
}

// ---------- Báo cáo tuần của thư ký ----------
export type WeeklyReportStatus = "NHAP" | "DA_NOP" | "DA_CHOT";

export interface WeeklyReport {
    _id: string;
    classId: string;
    schoolYearId: string;
    weekNo: number;
    /** Điểm TB Sổ đầu bài 0–10 */
    logbookAvg: number | null;
    oralHigh: number;
    oralLow: number;
    logbookErrors: number;
    /** Id học sinh bị ghi SĐB; một em bị ghi nhiều lần thì lặp lại */
    logbookErrorStudents?: string[];
    status: WeeklyReportStatus;
    submittedAt?: string;
    submittedByName?: string;
}

export interface Complaint {
    _id: string;
    classId: string;
    weekNo: number;
    /** Chỉ tiêu bị khiếu nại, ví dụ DI_MUON */
    field: string;
    content: string;
    status: "MOI" | "DA_XU_LY";
    response?: string;
    createdByName: string;
    createdAt: string;
}

// ---------- Hoạt động Đoàn ----------
export type ActivityCriterion = "3.1" | "3.2" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5" | "4.6";

export interface ActivityPoint {
    _id: string;
    classId: string;
    schoolYearId: string;
    weekNo: number;
    criterion: ActivityCriterion;
    contestName?: string;
    note?: string;
    createdByName: string;
}

// ---------- Quy chế điểm ----------
export type DeductionKey =
    | "DI_MUON"
    | "QUEN_THE"
    | "DONG_PHUC"
    | "GIAY_DEP"
    | "DAU_TOC"
    | "NGHI_CO_PHEP"
    | "NGHI_KHONG_PHEP"
    | "TRON_TIET"
    | "GHI_SDB"
    | "HDTN_QUA_7P"
    | "VE_SINH_BAN"
    | "KHAC";

export type Rank = "XS" | "T" | "Kh" | "Y";

export interface ScoringRules {
    _id: string;
    /** Có hiệu lực từ tuần này (không tính lại tuần đã chốt) */
    effectiveFromWeek: number;
    logbookMultiplier: number;
    oralHighPoint: number;
    oralLowPoint: number;
    deductions: Record<DeductionKey, number>;
    bonuses: Record<Exclude<ActivityCriterion, "4.5">, number>;
    classification: {
        /** Nếu > 0: XS dành cho N hạng đầu (và đạt ngưỡng T) */
        xsTopRank: number;
        xsMin: number;
        tMin: number;
        khMin: number;
    };
}

export interface ClassWeekResult {
    classId: string;
    className: string;
    grade: number;
    logbookAvg: number | null;
    logbookPoints: number;
    oralHigh: number;
    oralLow: number;
    oralHighPoints: number;
    oralLowPoints: number;
    counts: Record<DeductionKey, number>;
    deductionPoints: Record<DeductionKey, number>;
    bonusPoints: number;
    bonusDetail: { criterion: string; points: number; note?: string }[];
    totalDeduction: number;
    total: number;
    rank: number;
    rankByScore: Rank;
    downgrades: { source: string; label: string }[];
    finalRank: Rank;
    reportStatus: WeeklyReportStatus | "CHUA_NOP";
}

export interface CompetitionWeek {
    _id: string;
    schoolYearId: string;
    weekNo: number;
    status: "LOCKED";
    lockedAt: string;
    lockedByName: string;
    results: ClassWeekResult[];
}

// ---------- Cấu hình ----------
export interface AppConfig {
    _id: string;
    attendanceDeadline: string; // "08:00"
    weeklyReportDeadlineDay: number; // 6 = thứ Bảy (dayjs: 0 = CN)
    weeklyReportDeadlineTime: string; // "17:00"
    emergencyPhones: string[];
    emergencyChannel: "SMS" | "ZALO";
    absenceWarnAt: number;
    absenceLimit: number;
    emergencyRemindMinutes: number;
}

export interface AuditLog {
    _id: string;
    resource: string;
    action: "CREATE" | "UPDATE" | "DELETE";
    recordId: string;
    userName: string;
    createdAt: string;
    oldValue?: unknown;
    newValue?: unknown;
}

export interface AppNotification {
    id: string;
    level: "error" | "warning" | "info";
    title: string;
    description?: string;
    link?: string;
}
