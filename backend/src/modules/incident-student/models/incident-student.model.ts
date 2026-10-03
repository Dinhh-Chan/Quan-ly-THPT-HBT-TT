import { StrObjectId } from "@common/constant";
import { Incident } from "@module/incident/entities/incident.entity";
import { IncidentModel } from "@module/incident/models/incident.model";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { Student } from "@module/student/entities/student.entity";
import { StudentModel } from "@module/student/models/student.model";
import { Entity } from "@module/repository";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.INCIDENT_STUDENT,
    indexes: [
        { unique: true, fields: ["incidentId", "studentId"] },
        { fields: ["studentId"] },
        { fields: ["classId"] },
    ],
})
export class IncidentStudentModel extends Model implements IncidentStudent {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => IncidentModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    incidentId: string;

    @BelongsTo(() => IncidentModel, {
        foreignKey: "incidentId",
        onDelete: "CASCADE",
    })
    incident?: Incident;

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
}
