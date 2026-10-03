import { PartialType } from "@nestjs/swagger";
import { CreateAppConfigDto } from "@module/app-config/dto/create-app-config.dto";

export class UpdateAppConfigDto extends PartialType(CreateAppConfigDto) {}
