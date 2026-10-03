import { StrObjectId } from "@common/constant";
import { Contest } from "@module/contest/entities/contest.entity";
import { ContestModel } from "@module/contest/models/contest.model";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { ContestPrize } from "@module/contest-entry/common/constant";
import { Entity } from "@module/repository";
import { ContestEntry } from "@module/contest-entry/entities/contest-entry.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.CONTEST_ENTRY,
    indexes: [{ unique: true, fields: ["contestId", "classId"] }],
})
export class ContestEntryModel extends Model implements ContestEntry {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => ContestModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    contestId: string;

    @BelongsTo(() => ContestModel, {
        foreignKey: "contestId",
        onDelete: "CASCADE",
    })
    contest?: Contest;

    @ForeignKey(() => SchoolClassModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    classId: string;

    @BelongsTo(() => SchoolClassModel, {
        foreignKey: "classId",
        onDelete: "RESTRICT",
    })
    schoolClass?: SchoolClass;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    participated?: boolean;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        validate: { isIn: [Object.values(ContestPrize)] },
    })
    prize?: ContestPrize;
}
