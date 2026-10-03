#!/usr/bin/env python3
"""
Nhập danh sách học sinh thật từ file Excel "Sổ điểm cá nhân" (sheet "Danh sach":
STT | Lớp | Họ tên | Giới tính | Ngày sinh, dữ liệu từ dòng 7).

Sinh ra:
  - frontend/src/api/mock/roster.json : dữ liệu cho web chạy chế độ mock
  - docs/seed-roster.sql             : xóa dữ liệu phát sinh cũ và nạp lớp + học sinh vào PostgreSQL

Mã lớp/học sinh cố định theo thứ tự trong file (c-10a1, s-0001, HS0001…) nên chạy lại không đổi mã.

Dùng: python3 scripts/import_roster.py "<file.xlsx>"
"""
import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
YEAR_ID = "sy-2026"
YEAR_NAME = "2026-2027"


def remove_accent(s: str) -> str:
    """Giống utils/text.ts: bỏ dấu, đ -> d, chữ thường, gộp khoảng trắng"""
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "D").lower()
    return re.sub(r"\s+", " ", s).strip()


def class_sort_key(name: str):
    m = re.fullmatch(r"(\d+)A(\d+)", name)
    return (int(m.group(1)), int(m.group(2))) if m else (99, 0)


def read_roster(path: str):
    ws = openpyxl.load_workbook(path, data_only=True).worksheets[0]
    students, errors = [], []
    for row_no, r in enumerate(ws.iter_rows(min_row=7, max_col=5, values_only=True), start=7):
        stt, cls, name, gender, dob = r
        if not cls and not name:
            continue
        cls = str(cls or "").strip().upper()
        name = re.sub(r"\s+", " ", str(name or "")).strip()
        if not re.fullmatch(r"1[012]A\d+", cls) or not name:
            errors.append(f"Dòng {row_no}: lớp '{cls}' / tên '{name}' không hợp lệ")
            continue
        g = {"Nam": "Male", "Nữ": "Female"}.get(str(gender or "").strip())
        if isinstance(dob, datetime):
            dob_iso = dob.strftime("%Y-%m-%d")
        elif dob:
            try:
                dob_iso = datetime.strptime(str(dob).strip(), "%d/%m/%Y").strftime("%Y-%m-%d")
            except ValueError:
                errors.append(f"Dòng {row_no}: ngày sinh '{dob}' không đọc được")
                dob_iso = None
        else:
            dob_iso = None
        students.append({"className": cls, "fullname": name, "gender": g, "dob": dob_iso})
    return students, errors


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    rows, errors = read_roster(sys.argv[1])
    if errors:
        print("\n".join(errors))
        sys.exit("Dừng: file có dòng lỗi, sửa rồi chạy lại.")

    class_names = sorted({r["className"] for r in rows}, key=class_sort_key)
    classes = [
        {"_id": f"c-{n.lower()}", "name": n, "grade": int(n[:2]), "sortOrder": i + 1}
        for i, n in enumerate(class_names)
    ]
    class_id = {c["name"]: c["_id"] for c in classes}
    students = []
    for i, r in enumerate(rows, start=1):
        no_accent = remove_accent(r["fullname"])
        students.append(
            {
                "_id": f"s-{i:04d}",
                "code": f"HS{i:04d}",
                "fullname": r["fullname"],
                "nameNoAccent": no_accent,
                "givenName": no_accent.split(" ")[-1],
                "classId": class_id[r["className"]],
                "status": "DANG_HOC",
                "gender": r["gender"],
                "dob": r["dob"],
            }
        )

    # ---- JSON cho mock ----
    out_json = ROOT / "frontend/src/api/mock/roster.json"
    mock_classes = [{k: c[k] for k in ("_id", "name", "grade")} for c in classes]
    mock_students = [{k: v for k, v in s.items() if k != "givenName" and v is not None} for s in students]
    out_json.write_text(json.dumps({"classes": mock_classes, "students": mock_students}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # ---- SQL cho PostgreSQL ----
    q = lambda v: "NULL" if v is None else "'" + str(v).replace("'", "''") + "'"
    ids = ", ".join(q(c["_id"]) for c in classes)
    lines = [
        f"-- Sinh tự động bởi scripts/import_roster.py từ {Path(sys.argv[1]).name}",
        f"-- {len(classes)} lớp, {len(students)} học sinh. Chạy sau docs/schema.sql.",
        "BEGIN;",
        "",
        "-- 1. Xóa toàn bộ dữ liệu phát sinh (sĩ số, vi phạm, sự việc, báo cáo, thi đua…) và học sinh cũ",
        'TRUNCATE "Absence", "AttendanceReport", "Violation", "IncidentStudent", "IncidentPhoto", "Incident",',
        '         "WeeklyReportLogbookStudent", "WeeklyReport", "ContestEntry", "Contest", "ActivityPoint", "Complaint",',
        '         "CompetitionResult", "CompetitionWeek", "StudentClassHistory", "Student";',
        "",
        "-- 2. Năm học (giữ nếu đã có)",
        f"""INSERT INTO "SchoolYear" ("_id", "name", "week1StartDate", "totalWeeks", "semester2StartWeek", "isCurrent")
VALUES ({q(YEAR_ID)}, {q(YEAR_NAME)}, '2026-08-30', 37, 19, TRUE)
ON CONFLICT ("_id") DO NOTHING;""",
        "",
        "-- 3. Lớp: bỏ lớp không còn trong danh sách (và vai trò tài khoản gắn với lớp đó), cập nhật/thêm lớp mới",
        f'DELETE FROM "UserRole" WHERE "classId" IS NOT NULL AND "classId" NOT IN ({ids});',
        f'DELETE FROM "SchoolClass" WHERE "_id" NOT IN ({ids});',
        'INSERT INTO "SchoolClass" ("_id", "schoolYearId", "name", "grade", "sortOrder") VALUES',
        ",\n".join(f"  ({q(c['_id'])}, {q(YEAR_ID)}, {q(c['name'])}, {c['grade']}, {c['sortOrder']})" for c in classes),
        'ON CONFLICT ("_id") DO UPDATE SET "name" = EXCLUDED."name", "grade" = EXCLUDED."grade", "sortOrder" = EXCLUDED."sortOrder", "updatedAt" = now();',
        "",
        "-- 4. Học sinh",
        'INSERT INTO "Student" ("_id", "code", "fullname", "nameNoAccent", "givenName", "gender", "dob", "classId", "status") VALUES',
        ",\n".join(
            f"  ({q(s['_id'])}, {q(s['code'])}, {q(s['fullname'])}, {q(s['nameNoAccent'])}, {q(s['givenName'])}, {q(s['gender'])}, {q(s['dob'])}, {q(s['classId'])}, 'DANG_HOC')"
            for s in students
        )
        + ";",
        "",
        "COMMIT;",
        "",
    ]
    out_sql = ROOT / "docs/seed-roster.sql"
    out_sql.write_text("\n".join(lines), encoding="utf-8")

    per_grade = {g: sum(1 for c in classes if c["grade"] == g) for g in (10, 11, 12)}
    print(f"{len(classes)} lớp {per_grade}, {len(students)} học sinh")
    print(f"-> {out_json.relative_to(ROOT)}\n-> {out_sql.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
