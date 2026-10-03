import { StrObjectId } from "@common/constant";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";
import { IncidentPhotoModel } from "@module/incident-photo/models/incident-photo.model";
import { IncidentStudent } from "@module/incident-student/entities/incident-student.entity";
import { IncidentStudentModel } from "@module/incident-student/models/incident-student.model";
import {
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    VerifyResult,
} from "@module/incident/common/constant";
import { Entity } from "@module/repository";
import { Incident } from "@module/incident/entities/incident.entity";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";

@Table({
    tableName: Entity.INCIDENT,
    indexes: [
        { fields: ["status", "severity", "createdAt"] },
        { fields: ["date"] },
        { fields: ["reporterId", "createdAt"] },
    ],
})
export class IncidentModel extends Model implements Incident {
    @StrObjectId()
    _id: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(IncidentType)] },
    })
    type: IncidentType;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "THONG_THUONG",
        validate: { isIn: [Object.values(IncidentSeverity)] },
    })
    severity?: IncidentSeverity;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    date: string;

    @Column({ type: DataType.DATE, allowNull: false })
    occurredAt: Date;

    @Column({ type: DataType.STRING(255), allowNull: true })
    location?: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description?: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "MOI",
        validate: { isIn: [Object.values(IncidentStatus)] },
    })
    status?: IncidentStatus;

    @Column({ type: DataType.STRING(24), allowNull: false })
    reporterId: string;

    @Column({ type: DataType.STRING(24), allowNull: true })
    receivedById?: string;

    @Column({ type: DataType.DATE, allowNull: true })
    receivedAt?: Date;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        validate: { isIn: [Object.values(VerifyResult)] },
    })
    verifyResult?: VerifyResult;

    @Column({ type: DataType.STRING(24), allowNull: true })
    verifiedById?: string;

    @Column({ type: DataType.DATE, allowNull: true })
    verifiedAt?: Date;

    @Column({ type: DataType.TEXT, allowNull: true })
    handling?: string;

    @Column({ type: DataType.STRING(24), allowNull: true })
    handledById?: string;

    @Column({ type: DataType.DATE, allowNull: true })
    handledAt?: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    alertSentAt?: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    remindedAt?: Date;

    @HasMany(() => IncidentStudentModel, {
        foreignKey: "incidentId",
        onDelete: "CASCADE",
    })
    students?: IncidentStudent[];

    @HasMany(() => IncidentPhotoModel, {
        foreignKey: "incidentId",
        onDelete: "CASCADE",
    })
    photos?: IncidentPhoto[];
}
