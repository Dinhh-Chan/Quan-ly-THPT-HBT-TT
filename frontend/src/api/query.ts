/** Bộ lọc theo FilterItemDto của backend: { field, operator, values } */
export interface Filter {
    field: string;
    operator: string;
    values?: unknown[];
    filters?: Filter[];
}

export interface ListQuery {
    filters?: Filter[];
    sort?: Record<string, 1 | -1>;
    page?: number;
    limit?: number;
    select?: string;
}

export const F = {
    eq: (field: string, value: unknown): Filter => ({ field, operator: "eq", values: [value] }),
    ne: (field: string, value: unknown): Filter => ({ field, operator: "ne", values: [value] }),
    in: (field: string, values: unknown[]): Filter => ({ field, operator: "in", values }),
    gte: (field: string, value: unknown): Filter => ({ field, operator: "gte", values: [value] }),
    lte: (field: string, value: unknown): Filter => ({ field, operator: "lte", values: [value] }),
    between: (field: string, from: unknown, to: unknown): Filter => ({ field, operator: "between", values: [from, to] }),
    contain: (field: string, value: string): Filter => ({ field, operator: "contain", values: [value] }),
};

export const toParams = (q: ListQuery = {}) => ({
    filters: q.filters?.map((f) => JSON.stringify(f)),
    sort: q.sort ? JSON.stringify(q.sort) : undefined,
    page: q.page,
    limit: q.limit,
    select: q.select,
});
