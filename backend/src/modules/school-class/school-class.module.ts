import { SequelizeModule } from "@nestjs/sequelize";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { SchoolClassService } from "@module/school-class/services/school-class.service";
import { SchoolClassSqlRepository } from "@module/school-class/repositories/school-class-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { SchoolClassController } from "@module/school-class/controllers/school-class.controller";

@Module({
    imports: [SequelizeModule.forFeature([SchoolClassModel])],
    exports: [SchoolClassService],
    providers: [
        SchoolClassService,
        RepositoryProvider(Entity.SCHOOL_CLASS, SchoolClassSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [SchoolClassController],
})
export class SchoolClassModule {}
