import { SequelizeModule } from "@nestjs/sequelize";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { SchoolYearService } from "@module/school-year/services/school-year.service";
import { SchoolYearSqlRepository } from "@module/school-year/repositories/school-year-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { SchoolYearController } from "@module/school-year/controllers/school-year.controller";

@Module({
    imports: [SequelizeModule.forFeature([SchoolYearModel])],
    exports: [SchoolYearService],
    providers: [
        SchoolYearService,
        RepositoryProvider(Entity.SCHOOL_YEAR, SchoolYearSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [SchoolYearController],
})
export class SchoolYearModule {}
