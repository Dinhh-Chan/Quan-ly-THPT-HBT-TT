import { PartialType } from "@nestjs/swagger";
import { Contest } from "@module/contest/entities/contest.entity";

export class ContestConditionDto extends PartialType(Contest) {}
