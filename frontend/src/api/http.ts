import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { ENV } from "@/config/env";
import type { LoginResponse } from "@/types";
import { mockAdapter } from "./mock/adapter";
import { tokenStorage } from "./tokenStorage";

/** Lỗi đã chuẩn hóa từ ResponseErrorDto của backend: { success:false, status, code, message } */
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
    ) {
        super(message);
    }
}

/** Mảng gửi dạng key[]=v để qs ("query parser: extended") luôn parse ra mảng, kể cả khi chỉ có 1 phần tử */
const serializeParams = (params: Record<string, unknown>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) v.forEach((item) => sp.append(`${k}[]`, String(item)));
        else sp.append(k, String(v));
    });
    return sp.toString();
};

const instance = axios.create({
    baseURL: ENV.apiUrl,
    timeout: 30000,
    paramsSerializer: { serialize: serializeParams },
    adapter: ENV.useMock ? mockAdapter : undefined,
});

instance.interceptors.request.use((config) => {
    const tokens = tokenStorage.get();
    if (tokens?.accessToken) config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    return config;
});

let refreshing: Promise<LoginResponse> | null = null;
let onAuthExpired: () => void = () => {};
export const setAuthExpiredHandler = (fn: () => void) => {
    onAuthExpired = fn;
};

instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<{ message?: string; code?: string }>) => {
        const original = error.config as AxiosRequestConfig & { _retry?: boolean };
        const tokens = tokenStorage.get();
        const isAuthCall = original?.url?.startsWith("/auth/");
        if (error.response?.status === 401 && tokens?.refreshToken && !original._retry && !isAuthCall) {
            original._retry = true;
            try {
                refreshing ??= instance
                    .post("/auth/refresh", { refreshToken: tokens.refreshToken })
                    .then((r) => r.data.data as LoginResponse)
                    .finally(() => {
                        refreshing = null;
                    });
                const next = await refreshing;
                tokenStorage.set(next);
                return instance(original);
            } catch {
                tokenStorage.clear();
                onAuthExpired();
            }
        } else if (error.response?.status === 401 && !isAuthCall) {
            tokenStorage.clear();
            onAuthExpired();
        }
        const data = error.response?.data;
        throw new ApiError(
            data?.message || (error.response ? `Lỗi ${error.response.status}` : "Không kết nối được máy chủ"),
            error.response?.status,
            data?.code,
        );
    },
);

/** Gọi API và bóc lớp { success, data } */
export const http = {
    get: <T>(url: string, config?: AxiosRequestConfig) => instance.get(url, config).then((r) => r.data.data as T),
    post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
        instance.post(url, body, config).then((r) => r.data.data as T),
    put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
        instance.put(url, body, config).then((r) => r.data.data as T),
    delete: <T>(url: string, config?: AxiosRequestConfig) => instance.delete(url, config).then((r) => r.data.data as T),
};
