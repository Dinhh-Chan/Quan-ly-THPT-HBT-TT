import { StrObjectId } from "@common/constant";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { SchoolYear } from "@module/school-year/entities/school-year.entity";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { WeeklyReportLogbookStudent } from "@module/weekly-report-logbook-student/entities/weekly-report-logbook-student.entity";
import { WeeklyReportLogbookStudentModel } from "@module/weekly-report-logbook-student/models/weekly-report-logbook-student.model";
import { WeeklyReportStatus } from "@module/weekly-report/common/constant";
import { Entity } from "@module/repository";
import { WeeklyReport } from "@module/weekly-report/entities/weekly-report.entity";
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
    tableName: Entity.WEEKLY_REPORT,
    indexes: [
        { unique: true, fields: ["schoolYearId", "classId", "weekNo"] },
        { fields: ["schoolYearId", "weekNo", "status"] },
    ],
})
export class WeeklyReportModel extends Model implements WeeklyReport {
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

    @Column({ type: DataType.DOUBLE, allowNull: true })
    logbookAvg?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    oralHigh?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    oralLow?: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    logbookErrors?: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "NHAP",
        validate: { isIn: [Object.values(WeeklyReportStatus)] },
    })
    status?: WeeklyReportStatus;

    @Column({ type: DataType.STRING(24), allowNull: true })
    submittedById?: string;

    @Column({ type: DataType.DATE, allowNull: true })
    submittedAt?: Date;

    @HasMany(() => WeeklyReportLogbookStudentModel, {
        foreignKey: "weeklyReportId",
        onDelete: "CASCADE",
    })
    logbookStudents?: WeeklyReportLogbookStudent[];
}
