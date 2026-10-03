import { StrObjectId } from "@common/constant";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
import { AttendanceReportModel } from "@module/attendance-report/models/attendance-report.model";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Student } from "@module/student/entities/student.entity";
import { StudentModel } from "@module/student/models/student.model";
import { AbsenceSession } from "@module/absence/common/constant";
import { Entity } from "@module/repository";
import { Absence } from "@module/absence/entities/absence.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.ABSENCE,
    indexes: [
        { unique: true, fields: ["reportId", "studentId"] },
        { fields: ["studentId", "date"] },
        { fields: ["classId", "date"] },
    ],
})
export class AbsenceModel extends Model implements Absence {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => AttendanceReportModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    reportId: string;

    @BelongsTo(() => AttendanceReportModel, {
        foreignKey: "reportId",
        onDelete: "CASCADE",
    })
    report?: AttendanceReport;

    @ForeignKey(() => StudentModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    studentId: string;

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

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    excused: boolean;

    @Column({ type: DataType.STRING(255), allowNull: true })
    reason?: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(AbsenceSession)] },
    })
    session: AbsenceSession;
}
