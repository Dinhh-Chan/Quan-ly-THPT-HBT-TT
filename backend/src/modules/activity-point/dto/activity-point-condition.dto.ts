import { PartialType } from "@nestjs/swagger";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";

export class ActivityPointConditionDto extends PartialType(ActivityPoint) {}
