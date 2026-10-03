import { StrObjectId } from "@common/constant";
import { Student } from "@module/student/entities/student.entity";
import { StudentModel } from "@module/student/models/student.model";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
import { WeeklyReportModel } from "@module/weekly-report/models/weekly-report.model";
import { Entity } from "@module/repository";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.WEEKLY_REPORT_LOGBOOK_STUDENT,
    indexes: [{ unique: true, fields: ["weeklyReportId", "studentId"] }],
})
export class WeeklyReportLogbookStudentModel
    extends Model
    implements WeeklyReportLogbookStudent
{
    @StrObjectId()
    _id: string;

    @ForeignKey(() => WeeklyReportModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    weeklyReportId: string;

    @BelongsTo(() => WeeklyReportModel, {
        foreignKey: "weeklyReportId",
        onDelete: "CASCADE",
    })
    weeklyReport?: WeeklyReport;

    @ForeignKey(() => StudentModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    studentId: string;

    @BelongsTo(() => StudentModel, {
        foreignKey: "studentId",
        onDelete: "RESTRICT",
    })
    student?: Student;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
    count?: number;

    @Column({ type: DataType.STRING(255), allowNull: true })
    note?: string;
}
