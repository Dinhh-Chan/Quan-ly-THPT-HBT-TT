import { OmitType } from "@nestjs/swagger";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";

export class CreateActivityPointDto extends OmitType(ActivityPoint, ["_id"]) {}
