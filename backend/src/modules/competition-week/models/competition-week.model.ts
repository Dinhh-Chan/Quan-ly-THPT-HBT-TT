import { StrObjectId } from "@common/constant";
import { CompetitionResult } from "@module/competition-result/entities/competition-result.entity";
import { CompetitionResultModel } from "@module/competition-result/models/competition-result.model";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { ScoringRuleModel } from "@module/scoring-rule/models/scoring-rule.model";
import { Entity } from "@module/repository";
import { CompetitionWeek } from "@module/competition-week/entities/competition-week.entity";
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
    tableName: Entity.COMPETITION_WEEK,
    indexes: [{ unique: true, fields: ["schoolYearId", "weekNo"] }],
})
export class CompetitionWeekModel extends Model implements CompetitionWeek {
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

    @Column({ type: DataType.INTEGER, allowNull: false })
    weekNo: number;

    @ForeignKey(() => ScoringRuleModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    scoringRuleId: string;

    @BelongsTo(() => ScoringRuleModel, {
        foreignKey: "scoringRuleId",
        onDelete: "RESTRICT",
    })
    scoringRule?: ScoringRule;

    @Column({ type: DataType.STRING(24), allowNull: false })
    lockedById: string;

    @Column({ type: DataType.DATE, allowNull: true })
    lockedAt?: Date;

    @HasMany(() => CompetitionResultModel, {
        foreignKey: "competitionWeekId",
        onDelete: "CASCADE",
    })
    results?: CompetitionResult[];
}
