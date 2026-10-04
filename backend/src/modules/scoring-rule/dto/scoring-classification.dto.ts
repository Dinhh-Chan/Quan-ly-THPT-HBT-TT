import { IsNumber, Min } from "class-validator";

export class ScoringClassificationDto {
    @IsNumber()
    @Min(0)
    xsTopRank: number;

    @IsNumber()
    xsMin: number;

    @IsNumber()
    tMin: number;

    @IsNumber()
    khMin: number;
}
