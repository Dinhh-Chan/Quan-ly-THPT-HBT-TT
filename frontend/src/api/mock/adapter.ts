/**
 * Backend giả chạy trong trình duyệt (VITE_USE_MOCK=true). Mô phỏng đúng convention của base NestJS:
 * response { success, data }, lỗi { success:false, status, message }, CRUD /many /page /one /:id,
 * filters dạng JSON { field, operator, values }. Dữ liệu lưu trong localStorage.
 */
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { AppUser } from "@/types";
import { removeAccent } from "@/utils/text";
import { buildSeed, newId, type MockDb } from "./seed";

const STORAGE_KEY = "nn_mock_db_v3";
// Bỏ dữ liệu giả của các phiên bản trước
localStorage.removeItem("nn_mock_db_v2");
let db: MockDb | null = null;

const load = (): MockDb => {
    if (db) return db;
    try {
        db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
        db = null;
    }
    if (!db) {
        db = buildSeed();
        save();
    }
    return db;
};
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
export const resetMockDb = () => {
    db = buildSeed();
    save();
};

class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
    }
}

type Rec = { _id: string } & Record<string, unknown>;
interface FilterItem {
    field: string;
    operator: string;
    values?: unknown[];
    filters?: FilterItem[];
}

const getPath = (obj: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);

const cmp = (a: unknown, b: unknown) => (typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b)));

const matchFilter = (rec: Rec, f: FilterItem): boolean => {
    if (f.operator === "or") return (f.filters || []).some((x) => matchFilter(rec, x));
    if (f.operator === "and") return (f.filters || []).every((x) => matchFilter(rec, x));
    const v = getPath(rec, f.field);
    const vals = f.values || [];
    const eq = (x: unknown) => (Array.isArray(v) ? v.includes(x) : v === x);
    switch (f.operator) {
        case "eq":
            return eq(vals[0]);
        case "ne":
            return !eq(vals[0]);
        case "in":
            return vals.some(eq);
        case "not_in":
            return !vals.some(eq);
        case "gte":
            return v != null && cmp(v, vals[0]) >= 0;
        case "lte":
            return v != null && cmp(v, vals[0]) <= 0;
        case "gt":
            return v != null && cmp(v, vals[0]) > 0;
        case "lt":
            return v != null && cmp(v, vals[0]) < 0;
        case "between":
            return v != null && cmp(v, vals[0]) >= 0 && cmp(v, vals[1]) <= 0;
        case "contain":
        case "like":
            return removeAccent(String(v ?? "")).includes(removeAccent(String(vals[0] ?? "")));
        case "null":
            return v == null;
        case "not_null":
            return v != null;
        default:
            return true;
    }
};

const query = (list: Rec[], params: Record<string, unknown>) => {
    const filters = ((params.filters as string[]) || []).map((s) => JSON.parse(s) as FilterItem);
    const condition = params.condition ? (JSON.parse(String(params.condition)) as Record<string, unknown>) : {};
    let out = list.filter(
        (r) => filters.every((f) => matchFilter(r, f)) && Object.entries(condition).every(([k, val]) => getPath(r, k) === val),
    );
    const sort = params.sort ? (JSON.parse(String(params.sort)) as Record<string, 1 | -1>) : null;
    if (sort) {
        const keys = Object.entries(sort);
        out = [...out].sort((a, b) => {
            for (const [k, dir] of keys) {
                const c = cmp(getPath(a, k), getPath(b, k));
                if (c) return c * dir;
            }
            return 0;
        });
    }
    return out;
};

const tokenUser = (config: InternalAxiosRequestConfig): AppUser | undefined => {
    const auth = String(config.headers?.Authorization || "");
    const id = auth.replace("Bearer mock.", "");
    return load().user.find((u) => u._id === id) as unknown as AppUser | undefined;
};

const sanitizeUser = (u: Rec) => {
    const { password: _p, ...rest } = u;
    return rest;
};

const audit = (resource: string, action: string, recordId: string, user: AppUser | undefined, oldValue?: unknown, newValue?: unknown) => {
    if (resource === "audit-log") return;
    const logs = load()["audit-log"];
    logs.unshift({ _id: newId(), resource, action, recordId, userName: user?.fullname || "?", createdAt: new Date().toISOString(), oldValue, newValue });
    if (logs.length > 3000) logs.length = 3000;
};

const tokens = (u: Rec) => ({
    accessToken: `mock.${u._id}`,
    refreshToken: `mock.${u._id}`,
    accessExpireAt: Date.now() + 86400000,
    refreshExpireAt: Date.now() + 30 * 86400000,
});

function route(config: InternalAxiosRequestConfig): unknown {
    const data = load();
    const method = (config.method || "get").toLowerCase();
    const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    const params = (config.params || {}) as Record<string, unknown>;
    const body = typeof config.data === "string" && config.data ? JSON.parse(config.data) : config.data;
    const parts = url.split("/").filter(Boolean);
    const user = tokenUser(config);

    // ---- auth ----
    if (url === "/auth/login" && method === "post") {
        const u = data.user.find((x) => x.username === String(body.username).toLowerCase());
        if (!u || u.password !== body.password) throw new HttpError(400, "Sai tên đăng nhập hoặc mật khẩu");
        if (u.locked) throw new HttpError(403, "Tài khoản đã bị khóa");
        return tokens(u);
    }
    if (url === "/auth/refresh") {
        const u = data.user.find((x) => `mock.${x._id}` === body.refreshToken);
        if (!u) throw new HttpError(401, "Phiên đăng nhập hết hạn");
        return tokens(u);
    }
    if (url === "/auth/logout") return null;

    if (!user) throw new HttpError(401, "Chưa đăng nhập");

    if (url === "/user/me") return sanitizeUser(user as unknown as Rec);
    if (url === "/user/me/password" && method === "put") {
        const u = data.user.find((x) => x._id === user._id)!;
        if (u.password !== body.oldPass) throw new HttpError(400, "Mật khẩu cũ không đúng");
        u.password = body.newPass;
        u.mustChangePassword = false;
        save();
        return sanitizeUser(u);
    }
    if (parts[0] === "user" && parts[2] === "reset-password" && method === "put") {
        const u = data.user.find((x) => x._id === parts[1]);
        if (!u) throw new HttpError(404, "Không tìm thấy tài khoản");
        u.password = body.newPass;
        u.mustChangePassword = true;
        audit("user", "UPDATE", u._id, user, undefined, { resetPassword: true });
        save();
        return sanitizeUser(u);
    }

    // ---- CRUD chung ----
    const [resource, sub, sub2] = parts;
    data[resource] ??= [];
    const list = data[resource];
    const out = (r: Rec) => (resource === "user" ? sanitizeUser(r) : r);

    if (method === "get") {
        if (sub === "many") return query(list, params).map(out);
        if (sub === "page") {
            const all = query(list, params);
            const limit = Number(params.limit) || 20;
            const page = Number(params.page) || 1;
            return { total: all.length, page, limit, skip: (page - 1) * limit, result: all.slice((page - 1) * limit, page * limit).map(out) };
        }
        if (sub === "one") {
            const r = query(list, params)[0];
            return r ? out(r) : null;
        }
        const r = list.find((x) => x._id === sub);
        if (!r) throw new HttpError(404, "Không tìm thấy bản ghi");
        return out(r);
    }
    if (method === "post" && !sub) {
        if (resource === "user" && list.some((u) => u.username === body.username)) throw new HttpError(400, "Tên đăng nhập đã tồn tại");
        const rec = { ...body, _id: body._id || newId(), createdAt: body.createdAt || new Date().toISOString() };
        list.push(rec);
        audit(resource, "CREATE", rec._id, user, undefined, rec);
        save();
        return out(rec);
    }
    if (method === "put" && sub && sub !== "many") {
        const r = list.find((x) => x._id === sub);
        if (!r) throw new HttpError(404, "Không tìm thấy bản ghi");
        const old = { ...r };
        Object.assign(r, body, { updatedAt: new Date().toISOString() });
        audit(resource, "UPDATE", r._id, user, old, r);
        save();
        return out(r);
    }
    if (method === "delete") {
        const ids: string[] = sub === "many" && sub2 === "ids" ? body.ids : [sub];
        const removed = list.filter((x) => ids.includes(x._id));
        data[resource] = list.filter((x) => !ids.includes(x._id));
        removed.forEach((r) => audit(resource, "DELETE", r._id, user, r));
        save();
        return sub === "many" ? { deleted: removed.length } : removed[0];
    }
    throw new HttpError(404, `Mock chưa hỗ trợ ${method.toUpperCase()} ${url}`);
}

export const mockAdapter: AxiosAdapter = async (config) => {
    await new Promise((r) => setTimeout(r, 120));
    try {
        const data = route(config);
        return { data: { success: true, data }, status: 200, statusText: "OK", headers: {}, config } as AxiosResponse;
    } catch (e) {
        const status = e instanceof HttpError ? e.status : 500;
        const message = e instanceof Error ? e.message : "Lỗi mock";
        const response = { data: { success: false, status, message }, status, statusText: message, headers: {}, config } as AxiosResponse;
        throw new AxiosError(message, String(status), config, null, response);
    }
};
