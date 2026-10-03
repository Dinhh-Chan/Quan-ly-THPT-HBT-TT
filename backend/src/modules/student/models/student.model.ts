import { StrObjectId } from "@common/constant";
import { StringUtil } from "@common/utils/string.util";
import { SchoolClass } from "@module/school-class/entities/school-class.entity";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { StudentClassHistory } from "@module/student-class-history/entities/student-class-history.entity";
import { StudentClassHistoryModel } from "@module/student-class-history/models/student-class-history.model";
import { StudentStatus } from "@module/student/common/constant";
import { Gender } from "@module/user/common/constant";
import { Entity } from "@module/repository";
import { Student } from "@module/student/entities/student.entity";
import {
    BeforeBulkCreate,
    BeforeValidate,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from "sequelize-typescript";

@Table({
    tableName: Entity.STUDENT,
    indexes: [
        { fields: ["classId", "status"] },
        { fields: ["nameNoAccent"] },
        { fields: ["givenName"] },
    ],
})
export class StudentModel extends Model implements Student {
    @StrObjectId()
    _id: string;

    @Column({ type: DataType.STRING(20), allowNull: false, unique: true })
    code: string;

    @Column({ type: DataType.STRING(255), allowNull: false })
    fullname: string;

    @Column({ type: DataType.STRING(255), allowNull: true })
    nameNoAccent?: string;

    @Column({ type: DataType.STRING(50), allowNull: true })
    givenName?: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        validate: { isIn: [Object.values(Gender)] },
    })
    gender?: Gender;

    @Column({ type: DataType.DATEONLY, allowNull: true })
    dob?: string;

    @ForeignKey(() => SchoolClassModel)
    @Column({ type: DataType.STRING(24), allowNull: false })
    classId: string;

    @BelongsTo(() => SchoolClassModel, {
        foreignKey: "classId",
        onDelete: "RESTRICT",
    })
    schoolClass?: SchoolClass;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: "DANG_HOC",
        validate: { isIn: [Object.values(StudentStatus)] },
    })
    status?: StudentStatus;

    @HasMany(() => StudentClassHistoryModel, {
        foreignKey: "studentId",
        onDelete: "CASCADE",
    })
    classHistory?: StudentClassHistory[];

    /** Sinh trường tìm kiếm không dấu từ họ tên */
    static fillSearchFields(instance: StudentModel) {
        if (instance.fullname) {
            const noAccent = StringUtil.removeAccents(
                instance.fullname,
            ).replace(/\s+/g, " ");
            instance.nameNoAccent = noAccent;
            instance.givenName = noAccent.split(" ").pop();
        }
    }

    @BeforeValidate
    static beforeValidateHook(instance: StudentModel) {
        StudentModel.fillSearchFields(instance);
    }

    @BeforeBulkCreate
    static beforeBulkCreateHook(instances: StudentModel[]) {
        instances.forEach((instance) =>
            StudentModel.fillSearchFields(instance),
        );
    }
}
