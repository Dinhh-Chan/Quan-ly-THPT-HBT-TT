import { PartialType } from "@nestjs/swagger";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";

export class ContestEntryConditionDto extends PartialType(ContestEntry) {}
