import { DefaultModules, DefaultProviders } from "@config/module/config";
import { AuditLogModule } from "@module/audit-log/audit-log.module";
import { IncrementModule } from "@module/increment/increment.module";
import { RedisModule } from "@module/redis/redis.module";
import { SsoModule } from "@module/sso/sso.module";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { CommonProviderModule } from "./modules/common-provider/common-provider.module";
import { DataPartitionModule } from "./modules/data-partition/data-partition.module";
import { DataProcessModule } from "./modules/data-process/data-process.module";
import { EventAccountModule } from "./modules/event-account/event-account.module";
import { FileModule } from "./modules/file/file.module";
import { ImportSessionModule } from "./modules/import-session/import-session.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { OneSignalModule } from "./modules/one-signal/one-signal.module";
import { QuyTacMaModule } from "./modules/quy-tac-ma/quy-tac-ma.module";
import { SettingModule } from "./modules/setting/setting.module";
import { TopicModule } from "./modules/topic/topic.module";
import { UserModule } from "./modules/user/user.module";
import { EventModule } from "./modules/event/event.module";
import { EventLogModule } from "./modules/event-log/event-log.module";
import { WebSocketModule } from "./modules/websocket/websocket.module";
import { SchoolYearModule } from "@module/school-year/school-year.module";
import { HolidayModule } from "@module/holiday/holiday.module";
import { SchoolClassModule } from "@module/school-class/school-class.module";
import { UserRoleModule } from "@module/user-role/user-role.module";
import { StudentModule } from "@module/student/student.module";
import { StudentClassHistoryModule } from "@module/student-class-history/student-class-history.module";
import { AttendanceReportModule } from "@module/attendance-report/attendance-report.module";
import { AbsenceModule } from "@module/absence/absence.module";
import { ViolationModule } from "@module/violation/violation.module";
import { IncidentModule } from "@module/incident/incident.module";
import { IncidentStudentModule } from "@module/incident-student/incident-student.module";
import { IncidentPhotoModule } from "@module/incident-photo/incident-photo.module";
import { WeeklyReportModule } from "@module/weekly-report/weekly-report.module";
import { WeeklyReportLogbookStudentModule } from "@module/weekly-report-logbook-student/weekly-report-logbook-student.module";
import { ContestModule } from "@module/contest/contest.module";
import { ContestEntryModule } from "@module/contest-entry/contest-entry.module";
import { ActivityPointModule } from "@module/activity-point/activity-point.module";
import { ComplaintModule } from "@module/complaint/complaint.module";
import { ScoringRuleModule } from "@module/scoring-rule/scoring-rule.module";
import { ScoringCriterionModule } from "@module/scoring-criterion/scoring-criterion.module";
import { CompetitionWeekModule } from "@module/competition-week/competition-week.module";
import { CompetitionResultModule } from "@module/competition-result/competition-result.module";
import { AppConfigModule } from "@module/app-config/app-config.module";
import { LookupModule } from "@module/lookup/lookup.module";

@Module({
    imports: [
        ...DefaultModules,
        AuthModule,
        LookupModule,
        UserModule,
        EventAccountModule,
        OneSignalModule,
        NotificationModule,
        TopicModule,
        FileModule,
        SettingModule,
        RedisModule,
        SsoModule,
        IncrementModule,
        ImportSessionModule,
        QuyTacMaModule,
        AuditLogModule,
        DataProcessModule,
        DataPartitionModule,
        CommonProviderModule,
        EventModule,
        EventLogModule,
        WebSocketModule,
        SchoolYearModule,
        HolidayModule,
        SchoolClassModule,
        UserRoleModule,
        StudentModule,
        StudentClassHistoryModule,
        AttendanceReportModule,
        AbsenceModule,
        ViolationModule,
        IncidentModule,
        IncidentStudentModule,
        IncidentPhotoModule,
        WeeklyReportModule,
        WeeklyReportLogbookStudentModule,
        ContestModule,
        ContestEntryModule,
        ActivityPointModule,
        ComplaintModule,
        ScoringRuleModule,
        ScoringCriterionModule,
        CompetitionWeekModule,
        CompetitionResultModule,
        AppConfigModule,
    ],
    providers: [...DefaultProviders],
    controllers: [AppController],
})
export class AppModule {}
