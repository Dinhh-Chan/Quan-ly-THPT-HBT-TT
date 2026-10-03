import { SequelizeModule } from "@nestjs/sequelize";
import { HolidayModel } from "@module/holiday/models/holiday.model";
import { Module } from "@nestjs/common";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { Entity } from "@module/repository";
import { HolidayService } from "@module/holiday/services/holiday.service";
import { HolidaySqlRepository } from "@module/holiday/repositories/holiday-sql.repository";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { HolidayController } from "@module/holiday/controllers/holiday.controller";

@Module({
    imports: [SequelizeModule.forFeature([HolidayModel])],
    exports: [HolidayService],
    providers: [
        HolidayService,
        RepositoryProvider(Entity.HOLIDAY, HolidaySqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    controllers: [HolidayController],
})
export class HolidayModule {}
