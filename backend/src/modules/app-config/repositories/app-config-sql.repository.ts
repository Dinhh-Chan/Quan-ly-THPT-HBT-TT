import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { AppConfigRepository } from "@module/app-config/repositories/app-config-repository.interface";
import { AppConfig } from "@module/app-config/entities/app-config.entity";
import { AppConfigModel } from "@module/app-config/models/app-config.model";

export class AppConfigSqlRepository
    extends SqlRepository<AppConfig>
    implements AppConfigRepository
{
    constructor(
        @InjectModel(AppConfigModel)
        private readonly appConfigModel: typeof AppConfigModel,
    ) {
        super(appConfigModel);
    }
}
