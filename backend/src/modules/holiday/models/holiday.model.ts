import { StrObjectId } from "@common/constant";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { Entity } from "@module/repository";
import { Holiday } from "@module/holiday/entities/holiday.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.HOLIDAY,
    indexes: [{ unique: true, fields: ["schoolYearId", "date"] }],
})
export class HolidayModel extends Model implements Holiday {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => SchoolYearModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    schoolYearId: string;

    @BelongsTo(() => SchoolYearModel, {
        foreignKey: "schoolYearId",
        onDelete: "CASCADE",
    })
    schoolYear?: SchoolYear;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    date: string;

    @Column({ type: DataType.STRING(255), allowNull: true })
    name?: string;
}
