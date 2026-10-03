import { StrObjectId } from "@common/constant";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
import { CompetitionWeekModel } from "@module/competition-week/models/competition-week.model";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Rank } from "@module/competition-result/common/constant";
import { Entity } from "@module/repository";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.COMPETITION_RESULT,
    indexes: [
        { unique: true, fields: ["competitionWeekId", "classId"] },
        { fields: ["classId"] },
    ],
})
export class CompetitionResultModel extends Model implements CompetitionResult {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => CompetitionWeekModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    competitionWeekId: string;

    @BelongsTo(() => CompetitionWeekModel, {
        foreignKey: "competitionWeekId",
        onDelete: "CASCADE",
    })
    competitionWeek?: CompetitionWeek;

    @ForeignKey(() => SchoolClassModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    classId: string;

    @BelongsTo(() => SchoolClassModel, {
        foreignKey: "classId",
        onDelete: "RESTRICT",
    })
    schoolClass?: SchoolClass;

    @Column({ type: DataType.DOUBLE, allowNull: true })
    logbookAvg?: number;

    @Column({ type: DataType.DOUBLE, allowNull: false })
    logbookPoints: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    oralHigh: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    oralLow: number;

    @Column({ type: DataType.JSONB, allowNull: false })
    counts: Record<string, unknown>;

    @Column({ type: DataType.JSONB, allowNull: false })
    deductionPoints: Record<string, unknown>;

    @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
    bonusDetail?: Record<string, unknown>[];

    @Column({ type: DataType.DOUBLE, allowNull: false })
    bonusPoints: number;

    @Column({ type: DataType.DOUBLE, allowNull: false })
    totalDeduction: number;

    @Column({ type: DataType.DOUBLE, allowNull: false })
    total: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    rank: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(Rank)] },
    })
    rankByScore: Rank;

    @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
    downgrades?: Record<string, unknown>[];

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(Rank)] },
    })
    finalRank: Rank;

    @Column({ type: DataType.STRING(10), allowNull: false })
    reportStatus: string;
}
