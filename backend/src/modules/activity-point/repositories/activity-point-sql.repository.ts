import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ActivityPointRepository } from "@module/activity-point/repositories/activity-point-repository.interface";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";
import { ActivityPointModel } from "@module/activity-point/models/activity-point.model";

export class ActivityPointSqlRepository
    extends SqlRepository<ActivityPoint>
    implements ActivityPointRepository
{
    constructor(
        @InjectModel(ActivityPointModel)
        private readonly activityPointModel: typeof ActivityPointModel,
    ) {
        super(activityPointModel);
    }
}
