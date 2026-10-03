import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Holiday } from "@module/holiday/entities/holiday.entity";

export interface HolidayRepository extends BaseRepository<Holiday> {}
