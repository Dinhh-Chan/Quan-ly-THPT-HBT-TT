import { OmitType } from "@nestjs/swagger";
import { AppConfig } from "@module/app-config/entities/app-config.entity";

export class CreateAppConfigDto extends OmitType(AppConfig, ["_id"]) {}
