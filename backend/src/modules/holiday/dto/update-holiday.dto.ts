import { PartialType } from "@nestjs/swagger";
import { CreateHolidayDto } from "@module/holiday/dto/create-holiday.dto";

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {}
