import type {
    ActivityPoint,
    AppConfig,
    AppUser,
    AttendanceReport,
    AuditLog,
    CompetitionWeek,
    Complaint,
    Incident,
    LoginResponse,
    SchoolClass,
    SchoolYear,
    ScoringRules,
    Student,
    Violation,
    WeeklyReport,
} from "@/types";
import { createCrud } from "../crud";
import { http } from "../http";

/**
 * Tên resource = path controller ở backend. Các module nghiệp vụ cần tạo thêm ở backend
 * bằng BaseControllerFactory với đúng các tên này (xem frontend/README.md).
 */
export const api = {
    schoolYear: createCrud<SchoolYear>("school-year"),
    classes: createCrud<SchoolClass>("school-class"),
    students: createCrud<Student>("student"),
    attendance: createCrud<AttendanceReport>("attendance-report"),
    violations: createCrud<Violation>("violation"),
    incidents: createCrud<Incident>("incident"),
    weeklyReports: createCrud<WeeklyReport>("weekly-report"),
    complaints: createCrud<Complaint>("complaint"),
    activities: createCrud<ActivityPoint>("activity-point"),
    scoringRules: createCrud<ScoringRules>("scoring-rule"),
    competitionWeeks: createCrud<CompetitionWeek>("competition-week"),
    appConfig: createCrud<AppConfig>("app-config"),
    auditLogs: createCrud<AuditLog>("audit-log"),
    users: createCrud<AppUser>("user"),
};

export const authApi = {
    login: (username: string, password: string) =>
        http.post<LoginResponse>("/auth/login", { username, password, platform: "Web" }),
    logout: (refreshToken: string) => http.post("/auth/logout", { refreshToken }),
    me: () => http.get<AppUser>("/user/me"),
    changePassword: (oldPass: string, newPass: string) => http.put("/user/me/password", { oldPass, newPass }),
    /** Cấp quản lý cấp lại mật khẩu (endpoint cần bổ sung ở backend) */
    resetPassword: (userId: string, newPass: string) => http.put(`/user/${userId}/reset-password`, { newPass }),
};
