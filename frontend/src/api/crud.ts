import type { Pageable } from "@/types";
import { http } from "./http";
import { type ListQuery, toParams } from "./query";

/** CRUD theo BaseControllerFactory: POST /, GET /many, /page, /one, /:id, PUT /:id, DELETE /:id, DELETE /many/ids */
export const createCrud = <T extends { _id: string }>(resource: string) => {
    const base = `/${resource}`;
    return {
        resource,
        many: (q?: ListQuery) => http.get<T[]>(`${base}/many`, { params: toParams(q) }),
        page: (q?: ListQuery) => http.get<Pageable<T>>(`${base}/page`, { params: toParams(q) }),
        one: (q?: ListQuery) => http.get<T | null>(`${base}/one`, { params: toParams(q) }),
        byId: (id: string) => http.get<T>(`${base}/${id}`),
        create: (dto: Partial<T>) => http.post<T>(base, dto),
        /** Base backend không có bulk create: gửi song song từng lô 10 bản ghi */
        createMany: async (items: Partial<T>[]) => {
            const out: T[] = [];
            for (let i = 0; i < items.length; i += 10) {
                out.push(...(await Promise.all(items.slice(i, i + 10).map((x) => http.post<T>(base, x)))));
            }
            return out;
        },
        update: (id: string, dto: Partial<T>) => http.put<T>(`${base}/${id}`, dto),
        remove: (id: string) => http.delete<T>(`${base}/${id}`),
        removeMany: (ids: string[]) => http.delete(`${base}/many/ids`, { data: { ids } }),
    };
};
