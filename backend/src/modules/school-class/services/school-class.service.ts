import { Injectable } from "@nestjs/common";
import { BaseService } from "@config/service/base.service";
import { SchoolClassRepository } from "@module/school-class/repositories/school-class-repository.interface";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class SchoolClassService extends BaseService<
    SchoolClass,
    SchoolClassRepository
> {
    constructor(
        @InjectRepository(Entity.SCHOOL_CLASS)
        private readonly schoolClassRepository: SchoolClassRepository,
    ) {
        super(schoolClassRepository);
    }
}
