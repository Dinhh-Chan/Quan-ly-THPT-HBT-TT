import { DEFAULT_SCORING_RULES } from "@/constants";
import type { AppConfig, AppUser, SchoolClass, SchoolYear, ScoringRules, Student } from "@/types";
import roster from "./roster.json";

export type MockDb = Record<string, Array<{ _id: string } & Record<string, unknown>>>;

let idSeq = 0;
export const newId = () => `${Date.now().toString(16)}${(idSeq++).toString(16).padStart(6, "0")}${Math.floor(Math.random() * 1e6).toString(16)}`;

export const SEED_PASSWORD = "123456";

/**
 * Dữ liệu khởi tạo: danh sách lớp và học sinh thật năm học 2026-2027
 * (roster.json sinh bởi scripts/import_roster.py). Chưa có dữ liệu phát sinh.
 */
export function buildSeed(): MockDb {
    const year: SchoolYear = {
        _id: "sy-2026",
        name: "2026-2027",
        week1StartDate: "2026-08-30",
        totalWeeks: 37,
        semester2StartWeek: 19,
        holidays: ["2026-09-02"],
        isCurrent: true,
    };

    const classes = roster.classes as SchoolClass[];
    const students = roster.students as Student[];

    // Tài khoản dùng thử theo vai trò – đổi tên/mật khẩu hoặc xóa ở trang Tài khoản
    const users: AppUser[] = [
        { _id: "u-admin", username: "admin", fullname: "Quản trị viên", systemRole: "Admin", roles: [{ role: "QUAN_LY" }] },
        { _id: "u-doan", username: "doantruong", fullname: "Bí thư Đoàn trường", systemRole: "User", roles: [{ role: "QUAN_LY" }] },
        { _id: "u-gvcn10a1", username: "gvcn.10a1", fullname: "GVCN 10A1", systemRole: "User", roles: [{ role: "GVCN", classId: "c-10a1" }] },
        { _id: "u-lt10a1", username: "lt.10a1", fullname: "Lớp trưởng 10A1", systemRole: "User", roles: [{ role: "LOP_TRUONG", classId: "c-10a1" }, { role: "THU_KY", classId: "c-10a1" }] },
        { _id: "u-tk10a2", username: "tk.10a2", fullname: "Thư ký 10A2", systemRole: "User", roles: [{ role: "THU_KY", classId: "c-10a2" }] },
        { _id: "u-gt1", username: "giamthi1", fullname: "Giám thị 1", systemRole: "User", roles: [{ role: "GIAM_THI" }] },
    ].map((u) => ({ ...u, password: SEED_PASSWORD }) as AppUser);

    const rules: ScoringRules = { _id: "rule-1", ...DEFAULT_SCORING_RULES };
    const config: AppConfig = {
        _id: "config",
        attendanceDeadline: "08:00",
        weeklyReportDeadlineDay: 6,
        weeklyReportDeadlineTime: "17:00",
        emergencyPhones: [],
        emergencyChannel: "ZALO",
        absenceWarnAt: 7,
        absenceLimit: 10,
        emergencyRemindMinutes: 15,
    };

    return {
        "school-year": [year],
        "school-class": classes,
        student: students,
        user: users,
        "scoring-rule": [rules],
        "app-config": [config],
        "attendance-report": [],
        violation: [],
        "weekly-report": [],
        "activity-point": [],
        incident: [],
        "competition-week": [],
        complaint: [],
        "audit-log": [],
    } as unknown as MockDb;
}
