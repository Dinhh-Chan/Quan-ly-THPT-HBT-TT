import { StrObjectId } from "@common/constant";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { Violation } from "@module/violation/entities/violation.entity";
import { ViolationModel } from "@module/violation/models/violation.model";
import { ComplaintStatus } from "@module/complaint/common/constant";
import { Entity } from "@module/repository";
import { Complaint } from "@module/complaint/entities/complaint.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.COMPLAINT,
    indexes: [
        { fields: ["status", "createdAt"] },
        { fields: ["classId", "weekNo"] },
    ],
})
export class ComplaintModel extends Model implements Complaint {
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

    @Column({ type: DataType.STRING(30), allowNull: false })
    field: string;

    @ForeignKey(() => ViolationModel)
    @Column({ type: DataType.STRING(24), allowNull: true })
    violationId?: string;

    @BelongsTo(() => ViolationModel, {
        foreignKey: "violationId",
        onDelete: "SET NULL",
    })
    violation?: Violation;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "MOI",
        validate: { isIn: [Object.values(ComplaintStatus)] },
    })
    status?: ComplaintStatus;

    @Column({ type: DataType.TEXT, allowNull: true })
    response?: string;

    @Column({ type: DataType.STRING(24), allowNull: false })
    createdById: string;

    @Column({ type: DataType.STRING(24), allowNull: true })
    resolvedById?: string;

    @Column({ type: DataType.DATE, allowNull: true })
    resolvedAt?: Date;
}
