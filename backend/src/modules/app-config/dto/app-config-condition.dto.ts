import { PartialType } from "@nestjs/swagger";
import { AppConfig } from "@module/app-config/entities/app-config.entity";

export class AppConfigConditionDto extends PartialType(AppConfig) {}
