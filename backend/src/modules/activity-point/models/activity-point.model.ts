import { StrObjectId } from "@common/constant";
import { Contest } from "@module/contest/entities/contest.entity";
import { ContestModel } from "@module/contest/models/contest.model";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { ActivityCriterion } from "@module/activity-point/common/constant";
import { Entity } from "@module/repository";
import { ActivityPoint } from "@module/activity-point/entities/activity-point.entity";
import { Op } from "sequelize";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.ACTIVITY_POINT,
    indexes: [
        { fields: ["schoolYearId", "weekNo", "classId"] },
        {
            name: "uq_ActivityPoint_contest",
            unique: true,
            fields: ["contestId", "classId"],
            where: { contestId: { [Op.ne]: null } },
        },
    ],
})
export class ActivityPointModel extends Model implements ActivityPoint {
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

    @ForeignKey(() => SchoolClassModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    classId: string;

    @BelongsTo(() => SchoolClassModel, {
        foreignKey: "classId",
        onDelete: "RESTRICT",
    })
    schoolClass?: SchoolClass;

    @Column({ type: DataType.INTEGER, allowNull: false })
    weekNo: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(ActivityCriterion)] },
    })
    criterion: ActivityCriterion;

    @ForeignKey(() => ContestModel)
    @Column({ type: DataType.STRING(24), allowNull: true })
    contestId?: string;

    @BelongsTo(() => ContestModel, {
        foreignKey: "contestId",
        onDelete: "CASCADE",
    })
    contest?: Contest;

    @Column({ type: DataType.STRING(255), allowNull: true })
    note?: string;

    @Column({ type: DataType.STRING(24), allowNull: false })
    createdById: string;
}
