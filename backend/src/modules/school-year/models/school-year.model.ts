import { StrObjectId } from "@common/constant";
import { Holiday } from "@module/holiday/entities/holiday.entity";
import { HolidayModel } from "@module/holiday/models/holiday.model";
import { Entity } from "@module/repository";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";

@Table({
    tableName: Entity.SCHOOL_YEAR,
    indexes: [
        {
            name: "uq_SchoolYear_current",
            unique: true,
            fields: ["isCurrent"],
            where: { isCurrent: true },
        },
    ],
})
export class SchoolYearModel extends Model implements SchoolYear {
    @StrObjectId()
    _id: string;

    @Column({ type: DataType.STRING(20), allowNull: false, unique: true })
    name: string;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    week1StartDate: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    totalWeeks: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    semester2StartWeek: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    isCurrent?: boolean;

    @HasMany(() => HolidayModel, {
        foreignKey: "schoolYearId",
        onDelete: "CASCADE",
    })
    holidays?: Holiday[];
}
