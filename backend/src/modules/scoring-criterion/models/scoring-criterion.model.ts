import { StrObjectId } from "@common/constant";
import { ScoringRule } from "@module/scoring-rule/entities/scoring-rule.entity";
import { ScoringRuleModel } from "@module/scoring-rule/models/scoring-rule.model";
import { CriterionKind } from "@module/scoring-criterion/common/constant";
import { Entity } from "@module/repository";
import { ScoringCriterion } from "@module/scoring-criterion/entities/scoring-criterion.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.SCORING_CRITERION,
    indexes: [{ unique: true, fields: ["scoringRuleId", "code"] }],
})
export class ScoringCriterionModel extends Model implements ScoringCriterion {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => ScoringRuleModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    scoringRuleId: string;

    @BelongsTo(() => ScoringRuleModel, {
        foreignKey: "scoringRuleId",
        onDelete: "CASCADE",
    })
    scoringRule?: ScoringRule;

    @Column({ type: DataType.STRING(30), allowNull: false })
    code: string;

    @Column({ type: DataType.STRING(10), allowNull: true })
    regulationNo?: string;

    @Column({ type: DataType.STRING(255), allowNull: false })
    name: string;

    @Column({ type: DataType.STRING(50), allowNull: false })
    groupName: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(CriterionKind)] },
    })
    kind: CriterionKind;

    @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 0 })
    points?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    sortOrder?: number;
}
