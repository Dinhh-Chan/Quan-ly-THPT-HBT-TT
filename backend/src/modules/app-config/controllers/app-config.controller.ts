import { appControllerConfig } from "@common/constant/app-controller-config";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { AppConfigService } from "@module/app-config/services/app-config.service";
import { AppConfig } from "@module/app-config/entities/app-config.entity";
import { AppConfigConditionDto } from "@module/app-config/dto/app-config-condition.dto";
import { CreateAppConfigDto } from "@module/app-config/dto/create-app-config.dto";
import { UpdateAppConfigDto } from "@module/app-config/dto/update-app-config.dto";

@Controller("app-config")
@ApiTags("app-config")
export class AppConfigController extends BaseControllerFactory<AppConfig>(
    AppConfig,
    AppConfigConditionDto,
    CreateAppConfigDto,
    UpdateAppConfigDto,
    appControllerConfig(),
) {
    constructor(private readonly appConfigService: AppConfigService) {
        super(appConfigService);
    }
}
