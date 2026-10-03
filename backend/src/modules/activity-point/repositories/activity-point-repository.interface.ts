import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";

export interface ActivityPointRepository
    extends BaseRepository<ActivityPoint> {}
