import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { HolidayRepository } from "@module/holiday/repositories/holiday-repository.interface";
import { Holiday } from "@module/holiday/entities/holiday.entity";
import { HolidayModel } from "@module/holiday/models/holiday.model";

export class HolidaySqlRepository
    extends SqlRepository<Holiday>
    implements HolidayRepository
{
    constructor(
        @InjectModel(HolidayModel)
        private readonly holidayModel: typeof HolidayModel,
    ) {
        super(holidayModel);
    }
}
