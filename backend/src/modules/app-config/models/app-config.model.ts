import { StrObjectId } from "@common/constant";
import { EmergencyChannel } from "@module/app-config/common/constant";
import { Entity } from "@module/repository";
import { AppConfig } from "@module/app-config/entities/app-config.entity";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: Entity.APP_CONFIG,
})
export class AppConfigModel extends Model implements AppConfig {
    @StrObjectId()
    _id: string;

    @Column({
        type: DataType.STRING(8),
        allowNull: false,
        defaultValue: "08:00",
    })
    attendanceDeadline?: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 6 })
    weeklyReportDeadlineDay?: number;

    @Column({
        type: DataType.STRING(8),
        allowNull: false,
        defaultValue: "17:00",
    })
    weeklyReportDeadlineTime?: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING(20)),
        allowNull: false,
        defaultValue: [],
    })
    emergencyPhones?: string[];

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "ZALO",
        validate: { isIn: [Object.values(EmergencyChannel)] },
    })
    emergencyChannel?: EmergencyChannel;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 7 })
    absenceWarnAt?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 10 })
    absenceLimit?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 15 })
    emergencyRemindMinutes?: number;
}
