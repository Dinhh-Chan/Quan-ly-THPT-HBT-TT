import { PartialType } from "@nestjs/swagger";
import { CreateContestDto } from "@module/contest/dto/create-contest.dto";

export class UpdateContestDto extends PartialType(CreateContestDto) {}
