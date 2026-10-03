import { create } from "zustand";
import { authApi } from "@/api/services";
import { tokenStorage } from "@/api/tokenStorage";
import type { AppUser, RoleAssignment } from "@/types";

const ROLE_KEY = "nn_active_role";

/** Tài khoản backend gốc chưa có roles: Admin được coi là cấp quản lý */
const normalizeUser = (u: AppUser): AppUser => ({
    ...u,
    roles: u.roles?.length ? u.roles : u.systemRole === "Admin" ? [{ role: "QUAN_LY" }] : [],
});

interface AuthState {
    user: AppUser | null;
    activeRole: RoleAssignment | null;
    initialized: boolean;
    init: () => Promise<void>;
    login: (username: string, password: string) => Promise<AppUser>;
    logout: () => Promise<void>;
    setActiveRole: (r: RoleAssignment) => void;
    refreshMe: () => Promise<void>;
}

const pickRole = (user: AppUser): RoleAssignment | null => {
    const saved = localStorage.getItem(ROLE_KEY);
    return user.roles.find((r) => `${r.role}:${r.classId ?? ""}` === saved) ?? user.roles[0] ?? null;
};

export const useAuth = create<AuthState>((set, get) => ({
    user: null,
    activeRole: null,
    initialized: false,
    init: async () => {
        if (!tokenStorage.get()) return set({ initialized: true });
        try {
            const user = normalizeUser(await authApi.me());
            set({ user, activeRole: pickRole(user), initialized: true });
        } catch {
            tokenStorage.clear();
            set({ user: null, activeRole: null, initialized: true });
        }
    },
    login: async (username, password) => {
        const tokens = await authApi.login(username.trim(), password);
        tokenStorage.set(tokens);
        const user = normalizeUser(await authApi.me());
        if (!user.roles.length) {
            tokenStorage.clear();
            throw new Error("Tài khoản chưa được gán vai trò. Liên hệ cấp quản lý.");
        }
        set({ user, activeRole: pickRole(user) });
        return user;
    },
    logout: async () => {
        const t = tokenStorage.get();
        if (t) await authApi.logout(t.refreshToken).catch(() => {});
        tokenStorage.clear();
        sessionStorage.clear();
        set({ user: null, activeRole: null });
    },
    setActiveRole: (r) => {
        localStorage.setItem(ROLE_KEY, `${r.role}:${r.classId ?? ""}`);
        set({ activeRole: r });
    },
    refreshMe: async () => {
        const user = normalizeUser(await authApi.me());
        set({ user, activeRole: get().activeRole ?? pickRole(user) });
    },
}));
