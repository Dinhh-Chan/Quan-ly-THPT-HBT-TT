import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { HolidayService } from "@module/holiday/services/holiday.service";
import { Holiday } from "@module/holiday/entities/holiday.entity";
import { HolidayConditionDto } from "@module/holiday/dto/holiday-condition.dto";
import { CreateHolidayDto } from "@module/holiday/dto/create-holiday.dto";
import { UpdateHolidayDto } from "@module/holiday/dto/update-holiday.dto";

@Controller("holiday")
@ApiTags("holiday")
export class HolidayController extends BaseControllerFactory<Holiday>(
    Holiday,
    HolidayConditionDto,
    CreateHolidayDto,
    UpdateHolidayDto,
    appControllerConfig(),
) {
    constructor(private readonly holidayService: HolidayService) {
        super(holidayService);
    }
}
