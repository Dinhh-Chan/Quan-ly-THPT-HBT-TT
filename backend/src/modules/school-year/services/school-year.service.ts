import { Injectable } from "@nestjs/common";
import { ApiError } from "@config/exception/api-error";
import { ViewBaseService } from "@config/service/view-base.service";
import { HolidayService } from "@module/holiday/services/holiday.service";
import { SchoolYearRepository } from "@module/school-year/repositories/school-year-repository.interface";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import _ from "lodash";

/** FE dùng `holidays: string[]` (ngày YYYY-MM-DD); DB lưu ở bảng Holiday */
@Injectable()
export class SchoolYearService extends ViewBaseService<
    SchoolYear,
    SchoolYearRepository,
    string[]
> {
    constructor(
        @InjectRepository(Entity.SCHOOL_YEAR)
        private readonly schoolYearRepository: SchoolYearRepository,
        private readonly holidayService: HolidayService,
    ) {
        super(schoolYearRepository);
    }

    /** Năm học hiện tại; dùng làm mặc định khi FE không gửi schoolYearId */
    async getCurrentId(): Promise<string> {
        const year = await this.schoolYearRepository.getOne({
            isCurrent: true,
        });
        if (!year) {
            throw ApiError.BadRequest("error-school-year-required");
        }
        return year._id;
    }

    protected async toView(list: SchoolYear[]) {
        if (!list.length) {
            return [];
        }
        const holidays = await this.holidayService.getMany(
            null,
            { schoolYearId: { $in: list.map((y) => y._id) } },
            { sort: { date: 1 } },
        );
        const byYear = _.groupBy(holidays, "schoolYearId");
        return list.map((y) => ({
            ...y,
            holidays: (byYear[y._id] || []).map((h) => h.date),
        }));
    }

    protected async prepareWrite(user: User, dto: any, existing?: SchoolYear) {
        const { holidays, ...data } = dto;
        // Chỉ một năm học hiện tại (unique index): bỏ cờ ở năm khác trước khi đặt
        if (data.isCurrent) {
            await this.schoolYearRepository.updateMany(
                existing
                    ? { isCurrent: true, _id: { $ne: existing._id } }
                    : { isCurrent: true },
                { isCurrent: false },
            );
        }
        return { data, extra: holidays };
    }

    protected async saveRelations(
        user: User,
        year: SchoolYear,
        holidays: string[] | undefined,
        transaction: unknown,
    ) {
        if (!holidays) {
            return;
        }
        await this.replaceChildren(
            this.holidayService,
            user,
            { schoolYearId: year._id },
            _.uniq(holidays).map((date) => ({ schoolYearId: year._id, date })),
            transaction,
        );
    }
}
