import { EventAccount } from "@module/event-account/entities/event-account.entity";
import { Event } from "@module/event/entities/event.entity";
import { EventLog } from "@module/event-log/entities/event-log.entity";
import { HamSinhMaModel } from "@module/quy-tac-ma/models/ham-sinh-ma.model";
import { QuyTacMaModel } from "@module/quy-tac-ma/models/quy-tac-ma.model";
import { Model, ModelCtor } from "sequelize-typescript";
import { AuditLogModel } from "../model/audit-log.model";
import { AuthModel } from "../model/auth.model";
import { DataPartitionUserModel } from "../model/data-partition-user.model";
import { DataPartitionModel } from "../model/data-partition.model";
import { FileModel } from "../model/file.model";
import { IncrementModel } from "../model/increment.model";
import { NotificationModel } from "../model/notification.model";
import { OneSignalUserModel } from "../model/one-signal-user.model";
import { SettingModel } from "../model/setting.model";
import TopicModel from "../model/topic.model";
import { UserTopicModel } from "../model/user-topic.model";
import { UserModel } from "../model/user.model";
import { SchoolYearModel } from "@module/school-year/models/school-year.model";
import { HolidayModel } from "@module/holiday/models/holiday.model";
import { SchoolClassModel } from "@module/school-class/models/school-class.model";
import { UserRoleModel } from "@module/user-role/models/user-role.model";
import { StudentModel } from "@module/student/models/student.model";
import { StudentClassHistoryModel } from "@module/student-class-history/models/student-class-history.model";
import { AttendanceReportModel } from "@module/attendance-report/models/attendance-report.model";
import { AbsenceModel } from "@module/absence/models/absence.model";
import { ViolationModel } from "@module/violation/models/violation.model";
import { IncidentModel } from "@module/incident/models/incident.model";
import { IncidentStudentModel } from "@module/incident-student/models/incident-student.model";
import { IncidentPhotoModel } from "@module/incident-photo/models/incident-photo.model";
import { WeeklyReportModel } from "@module/weekly-report/models/weekly-report.model";
import { WeeklyReportLogbookStudentModel } from "@module/weekly-report-logbook-student/models/weekly-report-logbook-student.model";
import { ContestModel } from "@module/contest/models/contest.model";
import { ContestEntryModel } from "@module/contest-entry/models/contest-entry.model";
import { ActivityPointModel } from "@module/activity-point/models/activity-point.model";
import { ComplaintModel } from "@module/complaint/models/complaint.model";
import { ScoringRuleModel } from "@module/scoring-rule/models/scoring-rule.model";
import { ScoringCriterionModel } from "@module/scoring-criterion/models/scoring-criterion.model";
import { CompetitionWeekModel } from "@module/competition-week/models/competition-week.model";
import { CompetitionResultModel } from "@module/competition-result/models/competition-result.model";
import { AppConfigModel } from "@module/app-config/models/app-config.model";

export const SequelizeModel: ModelCtor<Model>[] = [
    UserModel,
    AuthModel,
    Event,
    EventAccount,
    EventLog,
    FileModel,
    NotificationModel,
    OneSignalUserModel,
    TopicModel,
    UserTopicModel,
    SettingModel,
    IncrementModel,
    QuyTacMaModel,
    HamSinhMaModel,
    AuditLogModel,
    DataPartitionModel,
    DataPartitionUserModel,
    SchoolYearModel,
    HolidayModel,
    SchoolClassModel,
    UserRoleModel,
    StudentModel,
    StudentClassHistoryModel,
    AttendanceReportModel,
    AbsenceModel,
    ViolationModel,
    IncidentModel,
    IncidentStudentModel,
    IncidentPhotoModel,
    WeeklyReportModel,
    WeeklyReportLogbookStudentModel,
    ContestModel,
    ContestEntryModel,
    ActivityPointModel,
    ComplaintModel,
    ScoringRuleModel,
    ScoringCriterionModel,
    CompetitionWeekModel,
    CompetitionResultModel,
    AppConfigModel,
];
