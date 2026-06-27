# NỘI DUNG NGẮN GỌN – MÔ TẢ GIAO DIỆN HỆ THỐNG

## 3.3. Giao diện người dùng

Hệ thống cung cấp hai layout riêng biệt cho người dùng thông thường (UserLayout) và quản trị viên (AdminLayout), cùng sidebar có thể thu gọn, header mobile responsive và phong cách card-based với màu accent teal #117c75.

### 3.3.1. Dashboard (`/dashboard`)

Trang tổng quan hiển thị bốn thẻ thống kê (Cần làm / Đang làm / Đã xong / Quá hạn) với icon màu sắc và hiệu ứng hover đổi gradient. Phần biểu đồ gồm: (1) biểu đồ cột thể hiện phân bổ công việc theo danh mục sử dụng Chart.js; (2) biểu đồ đường hiển thị xu hướng tạo mới và hoàn thành nhiệm vụ trong 7 ngày. Tính năng Phân tích trì hoãn gồm vòng gauge chỉ số trì hoãn (được tính từ số lần dời hạn và công việc quá hạn), badge rủi ro 3 mức độ, biểu đồ khung giờ vàng làm việc (Sáng/Chiều/Tối/Đêm), và danh sách công việc bị dời hạn nhiều nhất. Khu vực widget bên phải hiển thị: sắp đến hạn (5 task gần nhất), hiệu suất hôm nay (ring SVG), OKRs (progress bar), thống kê nhanh (4 chỉ số). Phần Hệ sinh thái liên kết cung cấp shortcut đến Ghi chú, Lịch và Thời gian. Banner thông báo dạng marquee và banner lời mời dự án xuất hiện ở đỉnh trang khi có dữ liệu.

### 3.3.2. Nhiệm vụ (`/tasks`) và Kanban (`/kanban`)

Trang Nhiệm vụ cung cấp lưới thẻ (task grid) với bộ lọc gồm: segmented button 5 trạng thái, dropdown ưu tiên, danh mục và sắp xếp theo hạn. Mỗi card hiển thị tiêu đề, tag danh mục, ngày hạn và badge priority. Form modal hỗ trợ tạo/sửa đầy đủ thông tin task. Trang Kanban cung cấp bảng 4 cột (Chưa làm / Đang làm / Hoàn thành / Quá hạn) với kéo thả trực quan. Thẻ card thiết kế dark glassmorphism, hiển thị thanh priority, mô tả rút gọn, ngày hạn có màu cảnh báo. Khi kéo thả vào cột Hoàn thành, hệ thống hiển thị hiệu ứng pháo hoa.

### 3.3.3. Dự án (`/projects`)

Trang dự án hiển thị lưới thẻ, mỗi card gồm icon màu (chữ cái đầu tên), tên, badge môn học liên kết, mô tả rút gọn, thanh progress bar và số liệu công việc/tổng. Stats bar ở trên hiển thị tổng dự án, tổng công việc, đã xong và tiến độ trung bình. Modal tạo/sửa dự án cho phép chọn tên, mô tả, màu nhận diện từ preset và liên kết môn học.

### 3.3.4. Lịch (`/calendar`)

Lưới tháng 7 cột thể hiện ngày hiện tại viền teal, ngày có ghi chú viền vàng, cuối tuần nền xám nhạt. Mỗi ô chứa badge sự kiện màu theo trạng thái (tối đa 3, dòng "+X nữa" nếu nhiều hơn). Click vào ngày mở modal chi tiết: ghi chú cá nhân lưu localStorage, form tạo task nhanh, danh sách công việc trong ngày và liên kết đến Tasks/Timebox/Notes. Hỗ trợ xuất file `.ics` để đồng bộ Google Calendar.

### 3.3.5. Báo cáo (`/reports`)

Trang phân tích gồm các card chức năng: (1) biểu đồ xu hướng thời gian với 3 tab (7 ngày / 30 ngày / 12 tháng) cho biết số task tạo mới, hoàn thành, quá hạn; (2) phân tích năng suất AI (Google Generative AI) hiển thị 4 thẻ thống kê, danh sách insights và hiệu suất theo danh mục; (3) biểu đồ Gantt timeline hiển thị độ dài và trạng thái từng nhiệm vụ theo màu; (4) danh sách nhắc nhở deadline theo khung giờ lựa chọn với nút gửi email. Nút Xuất PDF dùng `html2pdf.js` tạo báo cáo A4 landscape.

### 3.3.6. Các trang phụ trợ

- **Ma trận Eisenhower** (`/eisenhower`): phân loại công việc 4 góc Q1–Q4.
- **Pomodoro** (`/focus-room`): hẹn giờ 25 phút tập trung / 5 phút nghỉ, tích hợp nhạc nền.
- **Thói quen** (`/habit-tracker`): theo dõi check-in hàng ngày, chuỗi ngày dài nhất.
- **Lịch học** (`/timetable`): lịch cố định theo tuần, sinh task tự động.
- **Sơ đồ phụ thuộc** (`/dependencies`): đồ thị SVG quan hệ giữa các task.
- **Thùng rác** (`/trash`): khôi phục/xóa vĩnh viễn task đã xóa.
- **Mẫu công việc** (`/templates`): tạo task nhanh từ mẫu có sẵn.
- **Hồ sơ** (`/profile`): đổi avatar, XP/level, kết bạn.

## 3.4. Giao diện quản trị (`/admin`)

Admin layout có sidebar riêng, dashboard hiển thị số liệu toàn hệ thống: Người dùng, Công việc, Dự án. Các trang quản lý gồm: Quản lý người dùng (CRUD, khóa/mở), Quản lý dự án và danh mục, Thông báo hệ thống (banner marquee), Nhật ký hoạt động, Cài đặt hệ thống, Xuất dữ liệu CSV. Đăng nhập admin tại `/admin/login` với vai trò `admin` được phân quyền riêng biệt hoàn toàn với người dùng thường.
