import { PartialType } from "@nestjs/swagger";
import { CreateActivityPointDto } from "@module/activity-point/dto/create-activity-point.dto";

export class UpdateActivityPointDto extends PartialType(
    CreateActivityPointDto,
) {}
