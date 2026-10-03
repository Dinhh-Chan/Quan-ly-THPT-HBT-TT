import { OmitType } from "@nestjs/swagger";
import { Holiday } from "@module/holiday/entities/holiday.entity";

export class CreateHolidayDto extends OmitType(Holiday, ["_id"]) {}
