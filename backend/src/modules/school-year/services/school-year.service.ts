import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { SchoolYearRepository } from "@module/school-year/repositories/school-year-repository.interface";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class SchoolYearService extends BaseService<
    SchoolYear,
    SchoolYearRepository
> {
    constructor(
        @InjectRepository(Entity.SCHOOL_YEAR)
        private readonly schoolYearRepository: SchoolYearRepository,
    ) {
        super(schoolYearRepository);
    }
}
