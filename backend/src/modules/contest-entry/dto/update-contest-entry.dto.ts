import { PartialType } from "@nestjs/swagger";
import { CreateContestEntryDto } from "@module/contest-entry/dto/create-contest-entry.dto";

export class UpdateContestEntryDto extends PartialType(CreateContestEntryDto) {}
