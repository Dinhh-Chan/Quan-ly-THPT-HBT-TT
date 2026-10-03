import { PartialType } from "@nestjs/swagger";
import { Holiday } from "@module/holiday/entities/holiday.entity";

export class HolidayConditionDto extends PartialType(Holiday) {}
