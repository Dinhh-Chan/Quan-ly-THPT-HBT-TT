import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { HolidayRepository } from "@module/holiday/repositories/holiday-repository.interface";
import { Holiday } from "@module/holiday/entities/holiday.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class HolidayService extends BaseService<Holiday, HolidayRepository> {
    constructor(
        @InjectRepository(Entity.HOLIDAY)
        private readonly holidayRepository: HolidayRepository,
    ) {
        super(holidayRepository);
    }
}
