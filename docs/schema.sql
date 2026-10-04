-- =====================================================================
-- Hệ thống nền nếp & thi đua – THPT Hai Bà Trưng
-- PostgreSQL. Quy ước theo base backend (Sequelize):
--   tên bảng PascalCase, tên cột camelCase (đều phải đặt trong dấu ngoặc kép),
--   khóa chính "_id" VARCHAR(24) dạng ObjectId (sinh ở tầng ứng dụng – StrObjectId),
--   "createdAt"/"updatedAt" TIMESTAMPTZ.
-- Enum dùng VARCHAR + CHECK (không dùng kiểu ENUM của PG để dễ thêm giá trị bằng migration).
-- =====================================================================

-- ---------- Tài khoản ----------
-- "User" là bảng có sẵn trong base; dưới đây là cấu trúc sau khi mở rộng.
CREATE TABLE "User" (
    "_id"                VARCHAR(24) PRIMARY KEY,
    "username"           VARCHAR(100) NOT NULL UNIQUE,
    "password"           VARCHAR(255),
    "ssoId"              VARCHAR(255) UNIQUE,
    "email"              VARCHAR(255),                 -- đổi thành không bắt buộc
    "firstname"          VARCHAR(100),
    "lastname"           VARCHAR(100),
    "fullname"           VARCHAR(255) NOT NULL,
    "gender"             VARCHAR(10) CHECK ("gender" IN ('Male', 'Female')),
    "dob"                VARCHAR(10),
    "phone"              VARCHAR(20),
    "systemRole"         VARCHAR(20) NOT NULL DEFAULT 'User' CHECK ("systemRole" IN ('Admin', 'User')),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT TRUE,
    "locked"             BOOLEAN NOT NULL DEFAULT FALSE,
    "dataPartitionCode"  VARCHAR(100),
    "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Năm học, lớp, học sinh ----------
CREATE TABLE "SchoolYear" (
    "_id"                VARCHAR(24) PRIMARY KEY,
    "name"               VARCHAR(20) NOT NULL UNIQUE,              -- 2026-2027
    "week1StartDate"     DATE NOT NULL,                            -- tuần N = 7 ngày từ week1StartDate + 7(N-1)
    "totalWeeks"         SMALLINT NOT NULL CHECK ("totalWeeks" BETWEEN 1 AND 60),
    "semester2StartWeek" SMALLINT NOT NULL,
    "isCurrent"          BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ("semester2StartWeek" BETWEEN 2 AND "totalWeeks")
);
-- Chỉ một năm học hiện tại
CREATE UNIQUE INDEX "uq_SchoolYear_current" ON "SchoolYear" ("isCurrent") WHERE "isCurrent";

CREATE TABLE "Holiday" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "schoolYearId" VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id") ON DELETE CASCADE,
    "date"         DATE NOT NULL,
    "name"         VARCHAR(255),
    UNIQUE ("schoolYearId", "date")
);

CREATE TABLE "SchoolClass" (
    "_id"               VARCHAR(24) PRIMARY KEY,
    "schoolYearId"      VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "name"              VARCHAR(20) NOT NULL,                 -- 10A1
    "grade"             SMALLINT NOT NULL CHECK ("grade" IN (10, 11, 12)),
    "homeroomTeacherId" VARCHAR(24) REFERENCES "User" ("_id") ON DELETE SET NULL,
    "homeroomTeacherName" VARCHAR(255),
    "sortOrder"         SMALLINT NOT NULL DEFAULT 0,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("schoolYearId", "name")
);

-- Vai trò nghiệp vụ: một người nhiều vai trò (ví dụ lớp trưởng kiêm thư ký)
CREATE TABLE "UserRole" (
    "_id"       VARCHAR(24) PRIMARY KEY,
    "userId"    VARCHAR(24) NOT NULL REFERENCES "User" ("_id") ON DELETE CASCADE,
    "role"      VARCHAR(20) NOT NULL CHECK ("role" IN ('QUAN_LY', 'GVCN', 'LOP_TRUONG', 'THU_KY', 'GIAM_THI')),
    "classId"   VARCHAR(24) REFERENCES "SchoolClass" ("_id"),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Vai trò cấp lớp bắt buộc có lớp; vai trò toàn trường không có lớp
    CHECK (("role" IN ('GVCN', 'LOP_TRUONG', 'THU_KY')) = ("classId" IS NOT NULL))
);
CREATE UNIQUE INDEX "uq_UserRole" ON "UserRole" ("userId", "role", COALESCE("classId", ''));
CREATE INDEX "ix_UserRole_class" ON "UserRole" ("classId", "role");

CREATE TABLE "Student" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "code"         VARCHAR(20) NOT NULL UNIQUE,                -- Mã HS
    "fullname"     VARCHAR(255) NOT NULL,
    "nameNoAccent" VARCHAR(255) NOT NULL,                      -- tự sinh khi lưu, để tìm không dấu
    "givenName"    VARCHAR(50) NOT NULL,                       -- tên gọi (không dấu), ưu tiên khi tìm
    "gender"       VARCHAR(10) CHECK ("gender" IN ('Male', 'Female')),
    "dob"          DATE,
    "classId"      VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),   -- lớp hiện tại
    "status"       VARCHAR(20) NOT NULL DEFAULT 'DANG_HOC' CHECK ("status" IN ('DANG_HOC', 'CHUYEN_DI', 'NGHI_HOC')),
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "ix_Student_class" ON "Student" ("classId", "status");
-- Tìm theo tiền tố tên: LIKE 'ha%' trên givenName / nameNoAccent
CREATE INDEX "ix_Student_given" ON "Student" ("givenName" varchar_pattern_ops);
CREATE INDEX "ix_Student_name" ON "Student" ("nameNoAccent" varchar_pattern_ops);

-- Lịch sử chuyển lớp (không xóa học sinh)
CREATE TABLE "StudentClassHistory" (
    "_id"       VARCHAR(24) PRIMARY KEY,
    "studentId" VARCHAR(24) NOT NULL REFERENCES "Student" ("_id") ON DELETE CASCADE,
    "classId"   VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "fromDate"  DATE NOT NULL,
    "toDate"    DATE,
    "note"      VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ("toDate" IS NULL OR "toDate" >= "fromDate")
);
CREATE INDEX "ix_StudentClassHistory_student" ON "StudentClassHistory" ("studentId", "fromDate");

-- ---------- Sĩ số ----------
CREATE TABLE "AttendanceReport" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "classId"      VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "date"         DATE NOT NULL,
    "session"      VARCHAR(10) NOT NULL DEFAULT 'SANG' CHECK ("session" IN ('SANG', 'CHIEU')),
    "total"        SMALLINT NOT NULL CHECK ("total" >= 0),        -- sĩ số chuẩn lúc báo cáo
    "absentCount"  SMALLINT NOT NULL DEFAULT 0,                   -- server tự tính từ bảng Absence
    "presentCount" SMALLINT NOT NULL DEFAULT 0,
    "reporterId"   VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "submittedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("classId", "date", "session"),
    CHECK ("absentCount" + "presentCount" = "total")
);
CREATE INDEX "ix_AttendanceReport_date" ON "AttendanceReport" ("date");

CREATE TABLE "Absence" (
    "_id"       VARCHAR(24) PRIMARY KEY,
    "reportId"  VARCHAR(24) NOT NULL REFERENCES "AttendanceReport" ("_id") ON DELETE CASCADE,
    "studentId" VARCHAR(24) NOT NULL REFERENCES "Student" ("_id"),
    "classId"   VARCHAR(24) NOT NULL,          -- chép từ report để thống kê không cần JOIN
    "date"      DATE NOT NULL,                 -- chép từ report
    "excused"   BOOLEAN NOT NULL,              -- có phép
    "reason"    VARCHAR(255),
    "session"   VARCHAR(10) NOT NULL CHECK ("session" IN ('SANG', 'CHIEU', 'CA_NGAY')),
    "sessionCount" SMALLINT GENERATED ALWAYS AS (CASE WHEN "session" = 'CA_NGAY' THEN 2 ELSE 1 END) STORED,
    UNIQUE ("reportId", "studentId")
);
CREATE INDEX "ix_Absence_student" ON "Absence" ("studentId", "date");
CREATE INDEX "ix_Absence_class" ON "Absence" ("classId", "date");

-- ---------- Vi phạm nền nếp ----------
CREATE TABLE "Violation" (
    "_id"           VARCHAR(24) PRIMARY KEY,
    "type"          VARCHAR(20) NOT NULL CHECK ("type" IN (
                        'DI_MUON', 'QUEN_THE', 'DONG_PHUC', 'GIAY_DEP', 'DAU_TOC', 'TRON_TIET', 'KHAC',
                        'VE_SINH_BAN', 'HDTN_QUA_7P')),
    "studentId"     VARCHAR(24) REFERENCES "Student" ("_id"),
    "classId"       VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),  -- lớp TẠI THỜI ĐIỂM vi phạm
    "date"          DATE NOT NULL,
    "note"          VARCHAR(500),
    "source"        VARCHAR(10) NOT NULL DEFAULT 'MANUAL' CHECK ("source" IN ('MANUAL', 'EXCEL')),
    "importBatchId" VARCHAR(24),
    "createdById"   VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "createdByRole" VARCHAR(20) NOT NULL,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Lỗi cấp lớp không gắn học sinh; lỗi cá nhân bắt buộc có học sinh
    CHECK (("type" IN ('VE_SINH_BAN', 'HDTN_QUA_7P')) = ("studentId" IS NULL))
);
-- Cùng học sinh – cùng lỗi – cùng ngày chỉ tính 1 lần (2 giám thị nhập trùng bị chặn ở DB)
CREATE UNIQUE INDEX "uq_Violation_student" ON "Violation" ("studentId", "type", "date") WHERE "studentId" IS NOT NULL;
CREATE UNIQUE INDEX "uq_Violation_class" ON "Violation" ("classId", "type", "date") WHERE "studentId" IS NULL;
CREATE INDEX "ix_Violation_class_date" ON "Violation" ("classId", "date");
CREATE INDEX "ix_Violation_date" ON "Violation" ("date", "type");
CREATE INDEX "ix_Violation_creator" ON "Violation" ("createdById", "date");

-- ---------- Sự việc bất thường ----------
CREATE TABLE "Incident" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "type"         VARCHAR(20) NOT NULL CHECK ("type" IN ('HUT_THUOC', 'DANH_NHAU', 'VO_LE', 'PHA_TAI_SAN', 'ATGT', 'TAI_NAN', 'KHAC')),
    "severity"     VARCHAR(20) NOT NULL DEFAULT 'THONG_THUONG' CHECK ("severity" IN ('KHAN_CAP', 'THONG_THUONG')),
    "date"         DATE NOT NULL,                 -- ngày xảy ra: xác định tuần bị hạ bậc
    "occurredAt"   TIMESTAMPTZ NOT NULL,
    "location"     VARCHAR(255),
    "description"  TEXT,
    "status"       VARCHAR(20) NOT NULL DEFAULT 'MOI' CHECK ("status" IN ('MOI', 'DA_TIEP_NHAN', 'DA_XAC_MINH', 'DA_XU_LY')),
    "reporterId"   VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "receivedById" VARCHAR(24) REFERENCES "User" ("_id"),
    "receivedAt"   TIMESTAMPTZ,
    "verifyResult" VARCHAR(20) CHECK ("verifyResult" IN ('VI_PHAM', 'KHONG_VI_PHAM')),
    "verifiedById" VARCHAR(24) REFERENCES "User" ("_id"),
    "verifiedAt"   TIMESTAMPTZ,
    "handling"     TEXT,
    "handledById"  VARCHAR(24) REFERENCES "User" ("_id"),
    "handledAt"    TIMESTAMPTZ,
    "alertSentAt"  TIMESTAMPTZ,                   -- đã gửi SMS/Zalo
    "remindedAt"   TIMESTAMPTZ,                   -- lần nhắc lại gần nhất (khẩn quá 15 phút)
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ("status" IN ('MOI', 'DA_TIEP_NHAN') OR "verifyResult" IS NOT NULL)
);
CREATE INDEX "ix_Incident_open" ON "Incident" ("status", "severity", "createdAt") WHERE "status" <> 'DA_XU_LY';
CREATE INDEX "ix_Incident_date" ON "Incident" ("date");
CREATE INDEX "ix_Incident_reporter" ON "Incident" ("reporterId", "createdAt");

CREATE TABLE "IncidentStudent" (
    "incidentId" VARCHAR(24) NOT NULL REFERENCES "Incident" ("_id") ON DELETE CASCADE,
    "studentId"  VARCHAR(24) NOT NULL REFERENCES "Student" ("_id"),
    "classId"    VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),  -- lớp lúc xảy ra
    PRIMARY KEY ("incidentId", "studentId")
);
CREATE INDEX "ix_IncidentStudent_student" ON "IncidentStudent" ("studentId");
CREATE INDEX "ix_IncidentStudent_class" ON "IncidentStudent" ("classId");

-- Ảnh đính kèm: tham chiếu bảng "File" có sẵn của base
CREATE TABLE "IncidentPhoto" (
    "incidentId" VARCHAR(24) NOT NULL REFERENCES "Incident" ("_id") ON DELETE CASCADE,
    "fileId"     VARCHAR(24) NOT NULL,
    "sortOrder"  SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY ("incidentId", "fileId")
);

-- ---------- Báo cáo tuần của thư ký ----------
CREATE TABLE "WeeklyReport" (
    "_id"           VARCHAR(24) PRIMARY KEY,
    "schoolYearId"  VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "classId"       VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "weekNo"        SMALLINT NOT NULL CHECK ("weekNo" >= 1),
    "logbookAvg"    NUMERIC(4, 2) CHECK ("logbookAvg" BETWEEN 0 AND 10),   -- ĐTB Sổ đầu bài
    "oralHigh"      SMALLINT NOT NULL DEFAULT 0 CHECK ("oralHigh" >= 0),   -- miệng ≥ 8 cả tuần
    "oralLow"       SMALLINT NOT NULL DEFAULT 0 CHECK ("oralLow" >= 0),    -- miệng < 5 cả tuần
    "logbookErrors" SMALLINT NOT NULL DEFAULT 0 CHECK ("logbookErrors" >= 0),
    "status"        VARCHAR(10) NOT NULL DEFAULT 'NHAP' CHECK ("status" IN ('NHAP', 'DA_NOP', 'DA_CHOT')),
    "submittedById" VARCHAR(24) REFERENCES "User" ("_id"),
    "submittedAt"   TIMESTAMPTZ,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("schoolYearId", "classId", "weekNo")
);
CREATE INDEX "ix_WeeklyReport_week" ON "WeeklyReport" ("schoolYearId", "weekNo", "status");

-- Học sinh bị ghi Sổ đầu bài (để GVCN theo dõi)
CREATE TABLE "WeeklyReportLogbookStudent" (
    "weeklyReportId" VARCHAR(24) NOT NULL REFERENCES "WeeklyReport" ("_id") ON DELETE CASCADE,
    "studentId"      VARCHAR(24) NOT NULL REFERENCES "Student" ("_id"),
    "count"          SMALLINT NOT NULL DEFAULT 1 CHECK ("count" >= 1),
    "note"           VARCHAR(255),
    PRIMARY KEY ("weeklyReportId", "studentId")
);

-- ---------- Hoạt động Đoàn ----------
CREATE TABLE "Contest" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "schoolYearId" VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "name"         VARCHAR(255) NOT NULL,
    "awardWeekNo"  SMALLINT NOT NULL,          -- điểm giải cộng vào tuần trao giải
    "status"       VARCHAR(20) NOT NULL DEFAULT 'NHAP' CHECK ("status" IN ('NHAP', 'DA_CONG_BO')),
    "createdById"  VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mỗi lớp trong một cuộc thi: có tham gia không, đạt giải gì
CREATE TABLE "ContestEntry" (
    "contestId"    VARCHAR(24) NOT NULL REFERENCES "Contest" ("_id") ON DELETE CASCADE,
    "classId"      VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "participated" BOOLEAN NOT NULL DEFAULT TRUE,
    "prize"        VARCHAR(5) CHECK ("prize" IN ('4.1', '4.2', '4.3', '4.4')),
    PRIMARY KEY ("contestId", "classId"),
    CHECK ("participated" OR "prize" IS NULL)
);

-- Điểm cộng / hạ bậc hoạt động theo tuần. Không lưu số điểm: lấy theo quy chế của tuần.
-- Bản ghi có contestId do server sinh khi công bố cuộc thi (giải -> 4.1–4.4, không tham gia -> 4.5).
CREATE TABLE "ActivityPoint" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "schoolYearId" VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "classId"      VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "weekNo"       SMALLINT NOT NULL,
    "criterion"    VARCHAR(5) NOT NULL CHECK ("criterion" IN ('3.1', '3.2', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6')),
    "contestId"    VARCHAR(24) REFERENCES "Contest" ("_id") ON DELETE CASCADE,
    "note"         VARCHAR(255),
    "createdById"  VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "ix_ActivityPoint_week" ON "ActivityPoint" ("schoolYearId", "weekNo", "classId");
CREATE UNIQUE INDEX "uq_ActivityPoint_contest" ON "ActivityPoint" ("contestId", "classId") WHERE "contestId" IS NOT NULL;

-- ---------- Khiếu nại ----------
CREATE TABLE "Complaint" (
    "_id"          VARCHAR(24) PRIMARY KEY,
    "schoolYearId" VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "classId"      VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "weekNo"       SMALLINT NOT NULL,
    "field"        VARCHAR(30) NOT NULL,          -- chỉ tiêu bị khiếu nại, ví dụ DI_MUON
    "violationId"  VARCHAR(24) REFERENCES "Violation" ("_id") ON DELETE SET NULL,
    "content"      TEXT NOT NULL,
    "status"       VARCHAR(10) NOT NULL DEFAULT 'MOI' CHECK ("status" IN ('MOI', 'DA_XU_LY')),
    "response"     TEXT,
    "createdById"  VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "resolvedById" VARCHAR(24) REFERENCES "User" ("_id"),
    "resolvedAt"   TIMESTAMPTZ,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "ix_Complaint_status" ON "Complaint" ("status", "createdAt");
CREATE INDEX "ix_Complaint_class" ON "Complaint" ("classId", "weekNo");

-- ---------- Quy định điểm thi đua (theo phiên bản) ----------
CREATE TABLE "ScoringRule" (
    "_id"               VARCHAR(24) PRIMARY KEY,
    "schoolYearId"      VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "effectiveFromWeek" SMALLINT NOT NULL CHECK ("effectiveFromWeek" >= 1),
    "logbookMultiplier" NUMERIC(5, 2) NOT NULL DEFAULT 10,
    -- Ngưỡng xếp loại (chưa chốt – cấu hình)
    "xsTopRank"         SMALLINT NOT NULL DEFAULT 12,     -- 0 = không giới hạn theo hạng
    "xsMin"             NUMERIC(6, 2) NOT NULL DEFAULT 100,
    "tMin"              NUMERIC(6, 2) NOT NULL DEFAULT 90,
    "khMin"             NUMERIC(6, 2) NOT NULL DEFAULT 70,
    "createdById"       VARCHAR(24) REFERENCES "User" ("_id"),
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("schoolYearId", "effectiveFromWeek"),
    CHECK ("xsMin" >= "tMin" AND "tMin" >= "khMin")
);

-- Danh mục tiêu chí trong một phiên bản quy chế
CREATE TABLE "ScoringCriterion" (
    "_id"           VARCHAR(24) PRIMARY KEY,
    "scoringRuleId" VARCHAR(24) NOT NULL REFERENCES "ScoringRule" ("_id") ON DELETE CASCADE,
    "code"          VARCHAR(30) NOT NULL,     -- DI_MUON, NGHI_KHONG_PHEP, ORAL_HIGH, 3.1, 4.1 …
    "regulationNo"  VARCHAR(10),              -- số mục trong quy chế: 2.1, 2.2 …
    "name"          VARCHAR(255) NOT NULL,
    "groupName"     VARCHAR(50) NOT NULL,     -- Học tập / Nền nếp / Lao động / Hoạt động
    "kind"          VARCHAR(10) NOT NULL CHECK ("kind" IN ('PLUS', 'MINUS', 'DOWNGRADE')),
    "points"        NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK ("points" >= 0),   -- luôn dương, dấu theo kind
    "sortOrder"     SMALLINT NOT NULL DEFAULT 0,
    UNIQUE ("scoringRuleId", "code")
);

-- ---------- Kết quả tuần đã chốt (bản cố định) ----------
CREATE TABLE "CompetitionWeek" (
    "_id"           VARCHAR(24) PRIMARY KEY,
    "schoolYearId"  VARCHAR(24) NOT NULL REFERENCES "SchoolYear" ("_id"),
    "weekNo"        SMALLINT NOT NULL,
    "scoringRuleId" VARCHAR(24) NOT NULL REFERENCES "ScoringRule" ("_id"),
    "lockedById"    VARCHAR(24) NOT NULL REFERENCES "User" ("_id"),
    "lockedAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("schoolYearId", "weekNo")
);

-- Một dòng / lớp / tuần chốt – để tổng hợp tháng, học kỳ, diễn biến bằng SQL
CREATE TABLE "CompetitionResult" (
    "competitionWeekId" VARCHAR(24) NOT NULL REFERENCES "CompetitionWeek" ("_id") ON DELETE CASCADE,
    "classId"           VARCHAR(24) NOT NULL REFERENCES "SchoolClass" ("_id"),
    "logbookAvg"        NUMERIC(4, 2),
    "logbookPoints"     NUMERIC(6, 2) NOT NULL,
    "oralHigh"          SMALLINT NOT NULL,
    "oralLow"           SMALLINT NOT NULL,
    "counts"            JSONB NOT NULL,           -- { DI_MUON: 3, NGHI_KHONG_PHEP: 1, … }
    "deductionPoints"   JSONB NOT NULL,
    "bonusDetail"       JSONB NOT NULL DEFAULT '[]',
    "bonusPoints"       NUMERIC(6, 2) NOT NULL,
    "totalDeduction"    NUMERIC(6, 2) NOT NULL,
    "total"             NUMERIC(6, 2) NOT NULL,
    "rank"              SMALLINT NOT NULL,        -- thứ hạng toàn trường
    "rankByScore"       VARCHAR(2) NOT NULL CHECK ("rankByScore" IN ('XS', 'T', 'Kh', 'Y')),
    "downgrades"        JSONB NOT NULL DEFAULT '[]',
    "finalRank"         VARCHAR(2) NOT NULL CHECK ("finalRank" IN ('XS', 'T', 'Kh', 'Y')),
    "reportStatus"      VARCHAR(10) NOT NULL,
    PRIMARY KEY ("competitionWeekId", "classId")
);
CREATE INDEX "ix_CompetitionResult_class" ON "CompetitionResult" ("classId");

-- ---------- Cấu hình ----------
-- Một dòng duy nhất (_id = 'config')
CREATE TABLE "AppConfig" (
    "_id"                      VARCHAR(24) PRIMARY KEY CHECK ("_id" = 'config'),
    "attendanceDeadline"       TIME NOT NULL DEFAULT '08:00',
    "weeklyReportDeadlineDay"  SMALLINT NOT NULL DEFAULT 6 CHECK ("weeklyReportDeadlineDay" BETWEEN 0 AND 6),
    "weeklyReportDeadlineTime" TIME NOT NULL DEFAULT '17:00',
    "emergencyPhones"          VARCHAR(20)[] NOT NULL DEFAULT '{}',
    "emergencyChannel"         VARCHAR(10) NOT NULL DEFAULT 'ZALO' CHECK ("emergencyChannel" IN ('SMS', 'ZALO')),
    "absenceWarnAt"            SMALLINT NOT NULL DEFAULT 7,
    "absenceLimit"             SMALLINT NOT NULL DEFAULT 10,
    "emergencyRemindMinutes"   SMALLINT NOT NULL DEFAULT 15,
    "updatedAt"                TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ("absenceWarnAt" <= "absenceLimit")
);

-- ---------- Nhật ký thay đổi ----------
-- "AuditLog" có sẵn trong base; thêm 3 cột cho nhật ký nghiệp vụ:
--   ALTER TABLE "AuditLog" ADD COLUMN "resource" VARCHAR(50), ADD COLUMN "oldValue" JSONB, ADD COLUMN "newValue" JSONB;
--   CREATE INDEX "ix_AuditLog_resource" ON "AuditLog" ("resource", "sourceId", "createdAt");
