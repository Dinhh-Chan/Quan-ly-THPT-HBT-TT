import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { ActivityPointRepository } from "@module/activity-point/repositories/activity-point-repository.interface";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ActivityPointService extends BaseService<
    ActivityPoint,
    ActivityPointRepository
> {
    constructor(
        @InjectRepository(Entity.ACTIVITY_POINT)
        private readonly activityPointRepository: ActivityPointRepository,
    ) {
        super(activityPointRepository);
    }
}
