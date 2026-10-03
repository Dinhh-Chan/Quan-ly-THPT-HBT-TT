# Frontend – Nền nếp & Thi đua THPT Hai Bà Trưng

React 19 + Vite + TypeScript + Ant Design 6 + TanStack Query + Zustand.

```bash
cp .env.example .env     # VITE_USE_MOCK=true: chạy bằng dữ liệu giả, không cần backend
npm install
npm run dev              # http://localhost:5173
npm test                 # test engine tính điểm
npm run build
```

Ở chế độ mock, mọi tài khoản dùng mật khẩu `123456`: `admin`, `doantruong`, `gvcn.10a1`, `lt.10a1` (lớp trưởng kiêm thư ký), `tk.10a2`, `lt.10a2` (bị bắt đổi mật khẩu), `giamthi1`, `giamthi2`.

## Cấu trúc

```
src/
  api/          http.ts (axios, bóc {success,data}, refresh token), crud.ts, query.ts (filters)
    services/   tên resource ↔ controller backend
    mock/       backend giả trong trình duyệt (localStorage) + dữ liệu mẫu
  features/scoring/  engine.ts – công thức điểm, xếp hạng, xếp loại, hạ bậc (có test)
  components/   layout (thanh ngày làm việc, chuyển vai trò, chuông thông báo), common
  hooks/        dữ liệu dùng chung, nhắc việc theo vai trò
  pages/        theo vai trò: lop/, giam-thi/, quan-ly/, su-viec/, admin/
```

## Quy chế đã áp dụng

- Nghỉ không phép −10/buổi (tính như bỏ giờ); nghỉ có phép −1. "Cả ngày" = 2 buổi.
- Tổng điểm bị trừ có tính cả nghỉ học.
- Thứ hạng toàn trường theo tổng điểm; bằng điểm thì đồng hạng.
- KT miệng nhập theo cả tuần; trốn tiết do giám thị hoặc lớp trưởng nhập.
- Giờ chốt sĩ số 08:00; báo cáo thư ký hạn thứ Bảy 17:00.
- Ngưỡng xếp loại chưa chốt nên để cấu hình (mặc định: XS = 12 hạng đầu và ≥ 100, T ≥ 90, Kh ≥ 70).

## Backend cần bổ sung

Mỗi resource là một module dùng `BaseControllerFactory` (CRUD `/many`, `/page`, `/one`, `/:id`):
`school-year`, `class`, `student`, `attendance-report`, `violation`, `incident`, `weekly-report`,
`complaint`, `activity-point`, `scoring-rule`, `competition-week`, `app-config`, `audit-log`.
Field xem `src/types/index.ts`. Ngoài ra:

- `User` thêm `roles: {role, classId?}[]`, `phone`, `mustChangePassword`, `locked`; `/user/me` trả về các field này.
- `PUT /user/:id/reset-password` `{ newPass }` để cấp quản lý cấp lại mật khẩu.
- Quyền theo vai trò (giám thị chỉ sửa bản ghi của mình, khóa tuần đã chốt…) hiện mới chặn ở FE; backend cần chặn lại.
- Khi có sự việc mức Khẩn cấp: gửi SMS / Zalo OA tới `app-config.emergencyPhones`.
- Ảnh sự việc đang lưu dạng data URL; nên chuyển sang upload qua module `file`.
