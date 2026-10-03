import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { AppConfig } from "@module/app-config/entities/app-config.entity";

export interface AppConfigRepository extends BaseRepository<AppConfig> {}
