import type { LoginResponse } from "@/types";

const KEY = "nn_auth_tokens";

export const tokenStorage = {
    get(): LoginResponse | null {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "null");
        } catch {
            return null;
        }
    },
    set(tokens: LoginResponse) {
        localStorage.setItem(KEY, JSON.stringify(tokens));
    },
    clear() {
        localStorage.removeItem(KEY);
    },
};
