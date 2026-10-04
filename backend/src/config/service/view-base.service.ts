import {
    CreateQuery,
    GetManyQuery,
    GetOneQuery,
    GetPageQuery,
    UpdateByIdQuery,
} from "@common/constant";
import { FilterItemDto } from "@common/dto/filter-item.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import {
    BaseQueryOption,
    BaseRepository,
    QueryCondition,
    UpdateDocument,
} from "@module/repository/common/base-repository.interface";
import { User } from "@module/user/entities/user.entity";
import { BaseService } from "./base.service";

/**
 * Service cho các bảng mà FE đọc/ghi ở dạng "gộp" (mảng con, tên người dùng…),
 * còn DB lưu chuẩn hóa thành nhiều bảng.
 *
 * - Đọc: kết quả đi qua `toView` để gắn dữ liệu liên quan.
 * - Lọc: `mapFilters` đổi filter trên trường ảo thành filter trên cột thật.
 * - Ghi: `prepareWrite` tách phần lồng ra khỏi dto, `saveRelations` ghi phần đó
 *   trong cùng transaction với bản ghi chính.
 */
export abstract class ViewBaseService<
    E extends BaseEntity,
    R extends BaseRepository<E> = BaseRepository<E>,
    X = unknown,
> extends BaseService<E, R> {
    protected async toView(list: E[]): Promise<any[]> {
        return list;
    }

    protected async mapFilters(
        filters?: FilterItemDto<E>[],
    ): Promise<FilterItemDto<E>[]> {
        return filters;
    }

    /** Tách dto thành phần ghi vào bảng chính và phần quan hệ (`extra`) */
    protected async prepareWrite(
        user: User,
        dto: any,
        existing?: E,
    ): Promise<{ data: any; extra?: X }> {
        return { data: dto };
    }

    protected async saveRelations(
        user: User,
        entity: E,
        extra: X,
        transaction: unknown,
        isCreate: boolean,
    ): Promise<void> {}

    /** Ghi đè toàn bộ bản ghi con của một bản ghi cha */
    protected async replaceChildren<C extends BaseEntity>(
        service: BaseService<C>,
        user: User,
        where: QueryCondition<C>,
        items: Partial<C>[],
        transaction: unknown,
    ) {
        await service.deleteMany(user, where, { transaction });
        if (items.length) {
            await service.insertMany(user, items as any[], { transaction });
        }
    }

    private async viewOne(entity: E) {
        return entity ? (await this.toView([entity]))[0] : entity;
    }

    private async withTransaction<T>(
        given: unknown,
        fn: (t: unknown) => Promise<T>,
    ): Promise<T> {
        if (given) {
            return fn(given);
        }
        const tm = this.getTransaction();
        const t = await tm?.startTransaction();
        try {
            const res = await fn(t);
            await tm?.commitTransaction(t);
            return res;
        } catch (err) {
            await tm?.abortTransaction(t);
            throw err;
        }
    }

    async getMany(
        user: User,
        conditions: QueryCondition<E>,
        query?: GetManyQuery<E> & BaseQueryOption<unknown>,
    ): Promise<any> {
        const filters = await this.mapFilters(query?.filters);
        const list = await super.getMany(user, conditions, {
            ...query,
            filters,
        });
        return this.toView(list);
    }

    async getPage(
        user: User,
        conditions: QueryCondition<E>,
        query?: GetPageQuery<E> & BaseQueryOption<unknown>,
    ): Promise<any> {
        const filters = await this.mapFilters(query?.filters);
        const page = await super.getPage(user, conditions, {
            ...query,
            filters,
        });
        return { ...page, result: await this.toView(page.result) };
    }

    async getOne(
        user: User,
        conditions: QueryCondition<E>,
        query?: GetOneQuery<E> & BaseQueryOption<unknown>,
    ): Promise<any> {
        const filters = await this.mapFilters(query?.filters);
        const res = await super.getOne(user, conditions, {
            ...query,
            filters,
        });
        return this.viewOne(res);
    }

    async getById(user: User, id: string, query?: any): Promise<any> {
        return this.viewOne(await super.getById(user, id, query));
    }

    async create(
        user: User,
        dto: Partial<E>,
        options?: CreateQuery<E> & BaseQueryOption<unknown>,
    ): Promise<any> {
        const { data, extra } = await this.prepareWrite(user, dto);
        const res = await this.withTransaction(
            options?.transaction,
            async (transaction) => {
                const entity = await super.create(user, data, {
                    ...options,
                    transaction,
                });
                await this.saveRelations(
                    user,
                    entity,
                    extra,
                    transaction,
                    true,
                );
                return entity;
            },
        );
        return this.viewOne(res);
    }

    async updateById(
        user: User,
        id: string,
        update: UpdateDocument<E>,
        query?: UpdateByIdQuery & BaseQueryOption<unknown>,
    ): Promise<any> {
        const existing = await super.getById(user, id);
        const { data, extra } = await this.prepareWrite(user, update, existing);
        const res = await this.withTransaction(
            query?.transaction,
            async (transaction) => {
                const entity = await super.updateById(user, id, data, {
                    ...query,
                    transaction,
                });
                await this.saveRelations(
                    user,
                    entity,
                    extra,
                    transaction,
                    false,
                );
                return entity;
            },
        );
        return this.viewOne(res);
    }
}
