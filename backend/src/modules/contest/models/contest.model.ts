import { StrObjectId } from "@common/constant";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";
import { ContestEntryModel } from "@module/contest-entry/models/contest-entry.model";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { ContestStatus } from "@module/contest/common/constant";
import { Entity } from "@module/repository";
import { Contest } from "@module/contest/entities/contest.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.CONTEST,
    indexes: [{ fields: ["schoolYearId", "awardWeekNo"] }],
})
export class ContestModel extends Model implements Contest {
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

    @Column({ type: DataType.STRING(255), allowNull: false })
    name: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    awardWeekNo: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "NHAP",
        validate: { isIn: [Object.values(ContestStatus)] },
    })
    status?: ContestStatus;

    @Column({ type: DataType.STRING(24), allowNull: false })
    createdById: string;

    @HasMany(() => ContestEntryModel, {
        foreignKey: "contestId",
        onDelete: "CASCADE",
    })
    entries?: ContestEntry[];
}
