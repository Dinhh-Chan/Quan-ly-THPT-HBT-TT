import { OmitType } from "@nestjs/swagger";
import { Contest } from "@module/contest/entities/contest.entity";

export class CreateContestDto extends OmitType(Contest, ["_id"]) {}
