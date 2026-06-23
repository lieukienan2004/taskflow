# Hướng dẫn sử dụng TaskFlow

Hệ thống quản lý công việc cá nhân dựa trên nền tảng web.

---

## 1. Đăng ký / Đăng nhập

| Trang | Mô tả |
|---|---|
| `/register` | Tạo tài khoản mới: nhập Họ tên, Email, Mật khẩu |
| `/login` | Đăng nhập bằng email + mật khẩu |

Sau khi đăng nhập, navbar trái hiện danh sách chức năng.

---

## 2. Dashboard (`/dashboard`)

Trang tổng quan hiển thị:
- **4 ô thống kê**: Cần làm, Đang làm, Đã xong, Quá hạn
- **Biểu đồ tròn**: Phân bổ trạng thái công việc
- **Biểu đồ cột**: Công việc theo danh mục
- **Sắp đến hạn**: Danh sách task sắp hết hạn
- **Hiệu suất hôm nay**: % hoàn thành trong ngày
- **OKRs**: Tiến độ kế hoạch
- **Thống kê nhanh**: Đang làm, Quá hạn, Hoàn thành, Tổng số
- **Nút "AI Phân tích"**: Phân tích dữ liệu bằng AI

---

## 3. Nhiệm vụ (`/tasks`)

Quản lý công việc (tính năng cốt lõi):
- **Thêm task**: Nút "+" → điền tiêu đề, mô tả, danh mục, độ ưu tiên, hạn chót, dự án
- **Lọc**: Theo trạng thái (Tất cả/Cần/Đang làm/Xong/Quá hạn)
- **Tìm kiếm**: Ô search theo tiêu đề
- **Sắp xếp**: Theo hạn chót hoặc độ ưu tiên
- **Đổi trạng thái nhanh**: Click vào task card
- **Xoá mềm**: Chuyển vào thùng rác

### Chi tiết task (`/tasks/:id`)
- Sửa tiêu đề, danh mục, hạn chót, mô tả, trạng thái, ưu tiên
- **Checklist (subtask)**: Thêm/xoá/tick hoàn thành
- **Bình luận**: Trao đổi về task
- **Tệp đính kèm**: Upload file
- **Lịch sử hoạt động**: Xem ai đã làm gì
- **Liên kết phụ thuộc**: Task A phụ thuộc task B

---

## 4. Kanban (`/kanban`)

Board kéo thả trực quan:
- **3 cột**: Cần làm → Đang làm → Hoàn thành
- **Kéo thả task** giữa các cột để đổi trạng thái
- **Thêm task nhanh** ngay trên board

---

## 5. Dự án (`/projects`)

Quản lý dự án theo nhóm:
- **Tạo dự án**: Tên, mô tả, màu sắc, liên kết môn học
- **Dashboard dự án**: % hoàn thành, số task theo trạng thái
- **Chi tiết dự án** (`/projects/:id`):
  - **Mốc tiến độ (Milestones)**: Các cột mốc + hạn chót
  - **Thành viên**: Mời bạn, chấp nhận lời mời
  - **Chat nhóm**: Trao đổi nội bộ
  - **So sánh lịch trình**: Tìm khung giờ trống chung
  - **Danh sách task**: Lọc theo dự án

---

## 6. Lịch (`/calendar`)

Xem công việc theo tháng:
- **Chấm màu**: Ngày có task
- **Click ngày**: Xem danh sách task trong ngày
- **Xuất Google Calendar / iCal**
- **Chuyển tháng**: Mũi tên trái/phải

---

## 7. Lịch trình (`/timetable`)

Lịch học/làm việc cố định theo tuần:
- **Thêm buổi**: Chọn thứ, giờ bắt đầu/kết thúc, phòng
- **Tạo task tự động**: Sinh task từ lịch trình

---

## 8. Kế hoạch ngày (`/timebox`)

Lên kế hoạch chi tiết theo khung giờ:
- **Backlog**: Task chưa xếp lịch
- **Timeline**: Kéo task vào các khung giờ (Sáng/Chiều/Tối)
- **Tích hợp Pomodoro**: Hẹn giờ tập trung

---

## 9. Kế hoạch & OKRs (`/semester-plan`)

Quản lý mục tiêu theo phương pháp OKR:
- **Tạo kế hoạch**: Đặt tên, niên khóa, học kỳ
- **Mục tiêu (Objectives)**: Mô tả mục tiêu, độ ưu tiên
- **Kết quả then chốt (Key Results)**: Đặt chỉ số đo lường (VD: 70/100%)
- **Liên kết task**: Gán task vào mục tiêu
- **Quản lý môn học**: ⚙️ Thêm/xoá môn học để gán cho task

---

## 10. Ma trận Eisenhower (`/eisenhower`)

Ưu tiên công việc theo 4 góc:
| | Khẩn cấp | Không khẩn |
|---|---|---|
| **Quan trọng** | Q1: Làm ngay | Q2: Lên lịch |
| **Không quan trọng** | Q3: Uỷ quyền | Q4: Loại bỏ |

---

## 11. Thói quen (`/habit-tracker`)

Theo dõi thói quen hàng ngày:
- **Thêm thói quen**: Tên, tần suất
- **Check-in hàng ngày**: Tick hoàn thành
- **Thống kê**: Chuỗi ngày dài nhất, tỉ lệ hoàn thành
- **Lịch**: Xem lịch sử theo tháng

---

## 12. Phòng tập trung Pomodoro (`/focus-room`)

Kỹ thuật Pomodoro + nhạc nền:
- **Hẹn giờ**: 25 phút tập trung / 5 phút nghỉ
- **Nhạc nền**: Lofi, âm thanh thiên nhiên
- **Đếm session**: Số Pomodoro đã hoàn thành

---

## 13. Báo cáo (`/reports`)

Thống kê toàn diện:
- **Biểu đồ tròn**: Phân bổ trạng thái
- **Biểu đồ cột theo tuần**: Số task hoàn thành mỗi tuần
- **Biểu đồ danh mục**: Task theo từng danh mục
- **Xuất PDF**: In báo cáo

---

## 14. Cố vấn AI (Chat Widget)

Trợ lý AI ở góc phải màn hình:
- **Hỏi đáp**: Đặt câu hỏi về công việc
- **Gợi ý**: Câu hỏi nhanh (1 cú click)
- **Xuất chat**: Sao chép nội dung hội thoại

---

## 15. Hồ sơ (`/profile`)

Thông tin cá nhân:
- **Đổi avatar**: Upload + cắt ảnh
- **Sửa thông tin**: Tên, email
- **Kết bạn**: Gửi lời mời, chấp nhận bạn bè
- **Đổi mật khẩu**
- **XP & Level**: Hệ thống gamification

---

## 16. Phím tắt & Tiện ích

- **Theme Toggle**: Chuyển sáng/tối (góc trên navbar)
- **Thùng rác** (`/trash`): Khôi phục/xoá vĩnh viễn task đã xoá
- **Mẫu công việc** (`/templates`): Dùng mẫu có sẵn để tạo task nhanh
- **Sơ đồ phụ thuộc** (`/dependencies`): Xem đồ thị quan hệ task dạng SVG
- **Đấu trường RPG** (`/rpg-profile`): Nhập vai, lên cấp qua hoàn thành task

---

## 17. Quản trị (Admin)

Đăng nhập `admin@taskflow.com` → `/admin/dashboard`:
- Quản lý người dùng, danh mục
- Thông báo toàn hệ thống
- Xem nhật ký hoạt động
- Xuất dữ liệu CSV
