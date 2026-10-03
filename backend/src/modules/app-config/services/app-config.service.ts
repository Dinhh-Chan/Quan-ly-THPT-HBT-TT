import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { AppConfigRepository } from "@module/app-config/repositories/app-config-repository.interface";
import { AppConfig } from "@module/app-config/entities/app-config.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class AppConfigService extends BaseService<
    AppConfig,
    AppConfigRepository
> {
    constructor(
        @InjectRepository(Entity.APP_CONFIG)
        private readonly appConfigRepository: AppConfigRepository,
    ) {
        super(appConfigRepository);
    }
}
