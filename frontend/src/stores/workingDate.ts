import { create } from "zustand";
import { todayStr } from "@/utils/date";

const KEY = "nn_working_date";

/** Ngày làm việc: mặc định hôm nay; giữ nguyên tới khi đổi hoặc đăng xuất (sessionStorage bị xóa khi đăng xuất) */
export const useWorkingDate = create<{ date: string; setDate: (d: string) => void; resetToday: () => void }>((set) => ({
    date: sessionStorage.getItem(KEY) || todayStr(),
    setDate: (date) => {
        sessionStorage.setItem(KEY, date);
        set({ date });
    },
    resetToday: () => {
        sessionStorage.removeItem(KEY);
        set({ date: todayStr() });
    },
}));
