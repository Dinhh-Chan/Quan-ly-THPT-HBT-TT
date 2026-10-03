import { StrObjectId } from "@common/constant";
import { Absence } from "@module/absence/entities/absence.entity";
import { AbsenceModel } from "@module/absence/models/absence.model";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Session } from "@module/attendance-report/common/constant";
import { Entity } from "@module/repository";
import { AttendanceReport } from "@module/attendance-report/entities/attendance-report.entity";
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
    tableName: Entity.ATTENDANCE_REPORT,
    indexes: [
        { unique: true, fields: ["classId", "date", "session"] },
        { fields: ["date"] },
    ],
})
export class AttendanceReportModel extends Model implements AttendanceReport {
    @StrObjectId()
    _id: string;

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

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "SANG",
        validate: { isIn: [Object.values(Session)] },
    })
    session: Session;

    @Column({ type: DataType.INTEGER, allowNull: false })
    total: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    absentCount?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    presentCount?: number;

    @Column({ type: DataType.STRING(24), allowNull: false })
    reporterId: string;

    @Column({ type: DataType.DATE, allowNull: true })
    submittedAt?: Date;

    @HasMany(() => AbsenceModel, {
        foreignKey: "reportId",
        onDelete: "CASCADE",
    })
    absences?: Absence[];
}
