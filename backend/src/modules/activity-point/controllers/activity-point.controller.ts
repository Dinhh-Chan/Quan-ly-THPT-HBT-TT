import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ActivityPointService } from "@module/activity-point/services/activity-point.service";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";
import { ActivityPointConditionDto } from "@module/activity-point/dto/activity-point-condition.dto";
import { CreateActivityPointDto } from "@module/activity-point/dto/create-activity-point.dto";
import { UpdateActivityPointDto } from "@module/activity-point/dto/update-activity-point.dto";

@Controller("activity-point")
@ApiTags("activity-point")
export class ActivityPointController extends BaseControllerFactory<ActivityPoint>(
    ActivityPoint,
    ActivityPointConditionDto,
    CreateActivityPointDto,
    UpdateActivityPointDto,
    appControllerConfig(),
) {
    constructor(private readonly activityPointService: ActivityPointService) {
        super(activityPointService);
    }
}
