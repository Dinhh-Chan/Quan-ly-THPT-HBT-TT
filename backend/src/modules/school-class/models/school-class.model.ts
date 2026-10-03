import { StrObjectId } from "@common/constant";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { Entity } from "@module/repository";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.SCHOOL_CLASS,
    indexes: [{ unique: true, fields: ["schoolYearId", "name"] }],
})
export class SchoolClassModel extends Model implements SchoolClass {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => SchoolYearModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    schoolYearId: string;

    @BelongsTo(() => SchoolYearModel, {
        foreignKey: "schoolYearId",
        onDelete: "RESTRICT",
    })
    schoolYear?: SchoolYear;

    @Column({ type: DataType.STRING(20), allowNull: false })
    name: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    grade: number;

    @Column({ type: DataType.STRING(24), allowNull: true })
    homeroomTeacherId?: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    sortOrder?: number;
}
