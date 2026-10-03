import { StrObjectId } from "@common/constant";
import { Incident } from "@module/incident/entities/incident.entity";
import { IncidentModel } from "@module/incident/models/incident.model";
import { Entity } from "@module/repository";
import { IncidentPhoto } from "@module/incident-photo/entities/incident-photo.entity";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.INCIDENT_PHOTO,
    indexes: [{ unique: true, fields: ["incidentId", "fileId"] }],
})
export class IncidentPhotoModel extends Model implements IncidentPhoto {
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

    @Column({ type: DataType.STRING(24), allowNull: false })
    fileId: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    sortOrder?: number;
}
