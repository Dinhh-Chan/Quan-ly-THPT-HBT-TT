import { StrObjectId } from "@common/constant";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Student } from "@module/student/entities/student.entity";
import { StudentModel } from "@module/student/models/student.model";
import { Entity } from "@module/repository";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.STUDENT_CLASS_HISTORY,
    indexes: [{ fields: ["studentId", "fromDate"] }],
})
export class StudentClassHistoryModel
    extends Model
    implements StudentClassHistory
{
    @StrObjectId()
    _id: string;

    @ForeignKey(() => StudentModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    studentId: string;

    @BelongsTo(() => StudentModel, {
        foreignKey: "studentId",
        onDelete: "CASCADE",
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
    fromDate: string;

    @Column({ type: DataType.DATEONLY, allowNull: true })
    toDate?: string;

    @Column({ type: DataType.STRING(255), allowNull: true })
    note?: string;
}
