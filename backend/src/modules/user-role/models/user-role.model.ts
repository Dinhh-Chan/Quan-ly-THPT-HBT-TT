import { StrObjectId } from "@common/constant";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { AppRole } from "@module/user-role/common/constant";
import { Entity } from "@module/repository";
import { UserRole } from "@module/user-role/entities/user-role.entity";
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
    tableName: Entity.USER_ROLE,
    indexes: [
        {
            name: "uq_UserRole_school",
            unique: true,
            fields: ["userId", "role"],
            where: { classId: null },
        },
        {
            name: "uq_UserRole_class",
            unique: true,
            fields: ["userId", "role", "classId"],
            where: { classId: { [Op.ne]: null } },
        },
        { fields: ["classId", "role"] },
    ],
})
export class UserRoleModel extends Model implements UserRole {
    @StrObjectId()
    _id: string;

    @Column({ type: DataType.STRING(24), allowNull: false })
    userId: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: { isIn: [Object.values(AppRole)] },
    })
    role: AppRole;

    @ForeignKey(() => SchoolClassModel)
    @Column({ type: DataType.STRING(24), allowNull: true })
    classId?: string;

    @BelongsTo(() => SchoolClassModel, {
        foreignKey: "classId",
        onDelete: "CASCADE",
    })
    schoolClass?: SchoolClass;
}
