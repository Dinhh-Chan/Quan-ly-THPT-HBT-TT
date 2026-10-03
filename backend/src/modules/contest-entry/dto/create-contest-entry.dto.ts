import { OmitType } from "@nestjs/swagger";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";

export class CreateContestEntryDto extends OmitType(ContestEntry, ["_id"]) {}
