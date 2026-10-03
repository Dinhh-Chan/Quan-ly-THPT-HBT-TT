import { SequelizeModule } from "@nestjs/sequelize";
import { AppConfigModel } from "@module/app-config/models/app-config.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { AppConfigService } from "@module/app-config/services/app-config.service";
import { AppConfigSqlRepository } from "@module/app-config/repositories/app-config-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { AppConfigController } from "@module/app-config/controllers/app-config.controller";

@Module({
    imports: [SequelizeModule.forFeature([AppConfigModel])],
    exports: [AppConfigService],
    providers: [
        AppConfigService,
        RepositoryProvider(Entity.APP_CONFIG, AppConfigSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [AppConfigController],
})
export class AppConfigModule {}
