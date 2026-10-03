import { Result, Spin } from "antd";
import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { setAuthExpiredHandler } from "@/api/http";
import AppLayout from "@/components/layout/AppLayout";
import { ROLE_HOME } from "@/constants";
import { useAuth } from "@/stores/auth";
import type { AppRole } from "@/types";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import CleanlinessPage from "@/pages/giam-thi/CleanlinessPage";
import ImportLatePage from "@/pages/giam-thi/ImportLatePage";
import QuickViolationPage from "@/pages/giam-thi/QuickViolationPage";
import ViolationListPage from "@/pages/giam-thi/ViolationListPage";
import AttendancePage from "@/pages/lop/AttendancePage";
import ClassReportPage from "@/pages/lop/ClassReportPage";
import SkipClassPage from "@/pages/lop/SkipClassPage";
import WeeklyReportPage from "@/pages/lop/WeeklyReportPage";
import AccountsPage from "@/pages/admin/AccountsPage";
import AuditLogPage from "@/pages/admin/AuditLogPage";
import ConfigPage from "@/pages/admin/ConfigPage";
import SchoolYearPage from "@/pages/admin/SchoolYearPage";
import ScoringRulesPage from "@/pages/admin/ScoringRulesPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import ActivitiesPage from "@/pages/quan-ly/ActivitiesPage";
import AttendanceStatsPage from "@/pages/quan-ly/AttendanceStatsPage";
import ComplaintsPage from "@/pages/quan-ly/ComplaintsPage";
import DashboardPage from "@/pages/quan-ly/DashboardPage";
import IncidentsPage from "@/pages/quan-ly/IncidentsPage";
import StudentProfilePage from "@/pages/quan-ly/StudentProfilePage";
import SummaryPage from "@/pages/quan-ly/SummaryPage";
import TrendPage from "@/pages/quan-ly/TrendPage";
import ViolationStatsPage from "@/pages/quan-ly/ViolationStatsPage";
import WeeklyBoardPage from "@/pages/quan-ly/WeeklyBoardPage";
import IncidentReportPage from "@/pages/su-viec/IncidentReportPage";

function RequireRole({ roles, children }: { roles: AppRole[]; children: ReactNode }) {
    const role = useAuth((s) => s.activeRole?.role);
    if (!role || !roles.includes(role)) return <Result status="403" title="Không có quyền" subTitle="Vai trò hiện tại không truy cập được trang này." />;
    return <>{children}</>;
}

const CLASS_ROLES: AppRole[] = ["LOP_TRUONG", "GVCN"];
const QL: AppRole[] = ["QUAN_LY"];

export default function App() {
    const { user, activeRole, initialized, init, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        init();
        setAuthExpiredHandler(() => {
            logout();
            navigate("/login");
        });
    }, [init, logout, navigate]);

    if (!initialized) return <Spin fullscreen />;
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }
    if (user.mustChangePassword) {
        return (
            <Routes>
                <Route path="*" element={<ChangePasswordPage forced />} />
            </Routes>
        );
    }
    const home = activeRole ? ROLE_HOME[activeRole.role] : "/login";
    const r = (roles: AppRole[], el: ReactNode) => <RequireRole roles={roles}>{el}</RequireRole>;

    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/doi-mat-khau" element={<ChangePasswordPage />} />
                <Route path="/lop/si-so" element={r(CLASS_ROLES, <AttendancePage />)} />
                <Route path="/lop/tron-tiet" element={r(CLASS_ROLES, <SkipClassPage />)} />
                <Route path="/lop/bao-cao-tuan" element={r(["THU_KY", "GVCN"], <WeeklyReportPage />)} />
                <Route path="/lop/bao-cao" element={r(["LOP_TRUONG", "THU_KY", "GVCN"], <ClassReportPage />)} />
                <Route path="/su-viec/bao-cao" element={r(["LOP_TRUONG", "GVCN", "GIAM_THI", "QUAN_LY"], <IncidentReportPage />)} />
                <Route path="/giam-thi/nhap-nhanh" element={r(["GIAM_THI"], <QuickViolationPage />)} />
                <Route path="/giam-thi/import" element={r(["GIAM_THI"], <ImportLatePage />)} />
                <Route path="/giam-thi/ve-sinh" element={r(["GIAM_THI"], <CleanlinessPage />)} />
                <Route path="/giam-thi/danh-sach" element={r(["GIAM_THI", "QUAN_LY"], <ViolationListPage />)} />
                <Route path="/quan-ly/dashboard" element={r(QL, <DashboardPage />)} />
                <Route path="/quan-ly/thi-dua" element={r(QL, <WeeklyBoardPage />)} />
                <Route path="/quan-ly/tong-hop" element={r(QL, <SummaryPage />)} />
                <Route path="/quan-ly/su-viec" element={r(QL, <IncidentsPage />)} />
                <Route path="/quan-ly/khieu-nai" element={r(QL, <ComplaintsPage />)} />
                <Route path="/quan-ly/dien-bien" element={r(QL, <TrendPage />)} />
                <Route path="/quan-ly/chuyen-can" element={r(QL, <AttendanceStatsPage />)} />
                <Route path="/quan-ly/vi-pham" element={r(QL, <ViolationStatsPage />)} />
                <Route path="/quan-ly/ho-so" element={r(["QUAN_LY", "GVCN"], <StudentProfilePage />)} />
                <Route path="/quan-ly/ho-so/:id" element={r(["QUAN_LY", "GVCN"], <StudentProfilePage />)} />
                <Route path="/quan-ly/hoat-dong" element={r(QL, <ActivitiesPage />)} />
                <Route path="/quan-ly/hoc-sinh" element={r(QL, <StudentsPage />)} />
                <Route path="/quan-ly/tai-khoan" element={r(QL, <AccountsPage />)} />
                <Route path="/quan-ly/nam-hoc" element={r(QL, <SchoolYearPage />)} />
                <Route path="/quan-ly/quy-che" element={r(QL, <ScoringRulesPage />)} />
                <Route path="/quan-ly/cau-hinh" element={r(QL, <ConfigPage />)} />
                <Route path="/quan-ly/nhat-ky" element={r(QL, <AuditLogPage />)} />
                <Route path="*" element={<Navigate to={home} replace />} />
            </Route>
        </Routes>
    );
}
