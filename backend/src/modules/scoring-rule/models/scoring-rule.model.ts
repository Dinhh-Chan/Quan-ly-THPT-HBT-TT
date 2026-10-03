import { StrObjectId } from "@common/constant";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";
import { ScoringCriterionModel } from "@module/scoring-criterion/models/scoring-criterion.model";
import { Entity } from "@module/repository";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
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
    tableName: Entity.SCORING_RULE,
    indexes: [{ unique: true, fields: ["schoolYearId", "effectiveFromWeek"] }],
})
export class ScoringRuleModel extends Model implements ScoringRule {
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
    effectiveFromWeek: number;

    @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 10 })
    logbookMultiplier?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 12 })
    xsTopRank?: number;

    @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 100 })
    xsMin?: number;

    @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 90 })
    tMin?: number;

    @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 70 })
    khMin?: number;

    @Column({ type: DataType.STRING(24), allowNull: true })
    createdById?: string;

    @HasMany(() => ScoringCriterionModel, {
        foreignKey: "scoringRuleId",
        onDelete: "CASCADE",
    })
    criteria?: ScoringCriterion[];
}
