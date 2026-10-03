import { StrObjectId } from "@common/constant";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Student } from "@module/student/entities/student.entity";
import { StudentModel } from "@module/student/models/student.model";
import { AppRole } from "@module/user-role/common/constant";
import {
    ViolationSource,
    ViolationType,
} from "@module/violation/common/constant";
import { Entity } from "@module/repository";
import { Violation } from "@module/violation/entities/violation.entity";
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
    tableName: Entity.VIOLATION,
    indexes: [
        {
            name: "uq_Violation_student",
            unique: true,
            fields: ["studentId", "type", "date"],
            where: { studentId: { [Op.ne]: null } },
        },
        {
            name: "uq_Violation_class",
            unique: true,
            fields: ["classId", "type", "date"],
            where: { studentId: null },
        },
        { fields: ["classId", "date"] },
        { fields: ["date", "type"] },
        { fields: ["createdById", "date"] },
    ],
})
export class ViolationModel extends Model implements Violation {
    @StrObjectId()
    _id: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(ViolationType)] },
    })
    type: ViolationType;

    @ForeignKey(() => StudentModel)
    @Column({ type: DataType.STRING(24), allowNull: true })
    studentId?: string;

    @BelongsTo(() => StudentModel, {
        foreignKey: "studentId",
        onDelete: "RESTRICT",
    })
    student?: Student;

    @ForeignKey(() => SchoolClassModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    classId: string;

    @BelongsTo(() => SchoolClassModel, {
        foreignKey: "classId",
        onDelete: "RESTRICT",
    })
    schoolClass?: SchoolClass;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    date: string;

    @Column({ type: DataType.STRING(500), allowNull: true })
    note?: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "MANUAL",
        validate: { isIn: [Object.values(ViolationSource)] },
    })
    source?: ViolationSource;

    @Column({ type: DataType.STRING(24), allowNull: true })
    importBatchId?: string;

    @Column({ type: DataType.STRING(24), allowNull: false })
    createdById: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(AppRole)] },
    })
    createdByRole: AppRole;
}
