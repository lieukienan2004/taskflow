# 🎯 HƯỚNG DẪN TEST ĐẦY ĐỦ HỆ THỐNG TASKFLOW

## 📋 MỤC LỤC
1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Import dữ liệu test](#2-import-dữ-liệu-test)
3. [Chạy hệ thống](#3-chạy-hệ-thống)
4. [Tài khoản test](#4-tài-khoản-test)
5. [Checklist kiểm tra](#5-checklist-kiểm-tra)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG

### Bước 1: Khởi động XAMPP
1. Mở **XAMPP Control Panel**
2. Start **Apache**
3. Start **MySQL**
4. Đảm bảo cả 2 đều có màu xanh lá

### Bước 2: Kiểm tra database
1. Mở trình duyệt: `http://localhost/phpmyadmin`
2. Kiểm tra database `taskflow` đã tồn tại chưa
3. Nếu chưa có, tạo mới database tên `taskflow`

---

## 2. IMPORT DỮ LIỆU TEST

### Cách 1: Import qua phpMyAdmin (KHUYẾN NGHỊ)
1. Mở `http://localhost/phpmyadmin`
2. Chọn database **taskflow** ở thanh bên trái
3. Click tab **Import** ở menu trên
4. Click nút **Choose File**
5. Chọn file: `C:\xampp\htdocs\khoaluan\khoaluan\backend\test_data_full.sql`
6. Click nút **Go** ở dưới cùng
7. Đợi thông báo "Import has been successfully finished"

### Cách 2: Import qua Command Line
```cmd
cd C:\xampp\mysql\bin
mysql -u root taskflow < C:\xampp\htdocs\khoaluan\khoaluan\backend\test_data_full.sql
```

---

## 3. CHẠY HỆ THỐNG

### Bước 1: Chạy Backend Server
```cmd
cd C:\xampp\htdocs\khoaluan\khoaluan\backend
npm run dev
```
- Backend sẽ chạy tại: `http://localhost:3001`
- Xem log để đảm bảo không có lỗi

### Bước 2: Chạy Frontend Server  
```cmd
cd C:\xampp\htdocs\khoaluan\khoaluan\frontend
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:5173`
- Mở trình duyệt và vào địa chỉ này

---

## 4. TÀI KHOẢN TEST

### 👤 User 1 - Nguyễn Văn Hạnh (TÀI KHOẢN CHÍNH - ĐẦY ĐỦ DỮ LIỆU)
- **Email:** `hanh@gmail.com`
- **Password:** `123456`
- **MSSV:** 110121001
- **Lớp:** DA21TTA
- **Khoa:** Công nghệ thông tin
- **Tham gia:** Tháng 6 năm 2026
- **Có đầy đủ:** Tasks, Grades, Habits, Finance, Classes, Projects

### 👤 User 2 - Trần Thị Mai
- **Email:** `mai@gmail.com`
- **Password:** `123456`
- **MSSV:** 110121002
- **Có dữ liệu:** Một số tasks, grades, và là thành viên dự án

### 👤 User 3 - Lê Văn Tùng
- **Email:** `tung@gmail.com`
- **Password:** `123456`
- **MSSV:** 110121003

### 👤 User 4 - Phạm Thị Lan
- **Email:** `lan@gmail.com`
- **Password:** `123456`
- **MSSV:** 110121004

---

## 5. CHECKLIST KIỂM TRA

### ✅ 1. Trang Login & Register
- [ ] Đăng nhập bằng `hanh@gmail.com` / `123456`
- [ ] Kiểm tra thông báo lỗi khi sai mật khẩu
- [ ] Đăng ký tài khoản mới
- [ ] Kiểm tra validation form

### ✅ 2. Trang Dashboard (Trang chủ)
- [ ] Hiển thị thống kê tổng quan (Tasks, GPA, Habits)
- [ ] Biểu đồ hoàn thành công việc
- [ ] Lịch học hôm nay
- [ ] Tasks sắp tới

### ✅ 3. Trang Tasks (Nhiệm vụ)
- [ ] Hiển thị danh sách tasks với màu sắc theo priority
- [ ] Filter theo status (Todo, In Progress, Done, Overdue)
- [ ] Filter theo priority (High, Medium, Low)
- [ ] Search tasks
- [ ] Tạo task mới với đầy đủ thông tin
- [ ] Sửa task
- [ ] Xóa task
- [ ] Đổi status task (Bắt đầu, Hoàn thành, Mở lại)
- [ ] **KIỂM TRA QUAN TRỌNG:** Tasks quá hạn hiển thị màu đỏ và label "⚠️ Trễ hạn"
- [ ] Sort theo due date, priority

### ✅ 4. Trang Task Detail
- [ ] Click vào 1 task để xem chi tiết
- [ ] Hiển thị đầy đủ thông tin task
- [ ] Subtasks (nếu có)
- [ ] Comments
- [ ] Timeline hoạt động
- [ ] Đổi status
- [ ] Cập nhật progress

### ✅ 5. Trang Calendar (Lịch)
- [ ] Hiển thị lịch tháng
- [ ] Tasks hiển thị đúng ngày
- [ ] Click vào ngày để xem chi tiết
- [ ] **QUAN TRỌNG:** Tasks quá hạn hiển thị màu đỏ trên lịch
- [ ] Tạo task mới từ Calendar
- [ ] Lọc theo loại (Tasks, Exams, Classes)
- [ ] Xuất file .ics để đồng bộ Google Calendar

### ✅ 6. Trang Grades (Quản lý điểm)
- [ ] **KIỂM TRA GIAO DIỆN MỚI:**
  - [ ] Nền gradient xanh nhạt (#f5f7fa → #c3cfe2)
  - [ ] Cards trắng với shadow đẹp
  - [ ] Typography lớn, rõ ràng
  - [ ] Stats cards với icon to
- [ ] Hiển thị GPA tích lũy
- [ ] Hiển thị tổng tín chỉ
- [ ] Hiển thị điểm TB (hệ 10)
- [ ] Danh sách môn học với điểm chi tiết
- [ ] Thêm môn học mới
- [ ] Nhập điểm: Chuyên cần, Giữa kỳ, Cuối kỳ
- [ ] Tự động tính điểm trung bình theo tỷ trọng
- [ ] Sửa thông tin môn học
- [ ] Xóa môn học

### ✅ 7. Trang Habit Tracker (Thói quen)
- [ ] **KIỂM TRA GIAO DIỆN:**
  - [ ] Nền gradient sáng đẹp
  - [ ] Cards thói quen với icon
  - [ ] Calendar tracking
- [ ] Hiển thị danh sách thói quen
- [ ] Thống kê streak (chuỗi ngày liên tiếp)
- [ ] Calendar heatmap
- [ ] Tạo thói quen mới với icon đẹp
- [ ] Check hoàn thành thói quen
- [ ] Xem lịch sử hoàn thành
- [ ] Xóa thói quen

### ✅ 8. Trang Finance (Tài chính)
- [ ] Tổng thu nhập
- [ ] Tổng chi tiêu
- [ ] Số dư hiện tại
- [ ] Biểu đồ thu/chi
- [ ] Danh sách giao dịch
- [ ] Thêm giao dịch mới (Thu/Chi)
- [ ] Phân loại giao dịch
- [ ] Ngân sách hàng tháng
- [ ] Cảnh báo vượt ngân sách

### ✅ 9. Trang Class Schedule (Lịch học)
- [ ] Hiển thị thời khóa biểu theo tuần
- [ ] Lịch thi
- [ ] Thêm lịch học mới
- [ ] Thêm lịch thi
- [ ] Sửa/Xóa lịch
- [ ] Thông báo nhắc nhở

### ✅ 10. Trang Flashcards (Thẻ ghi nhớ)
- [ ] Danh sách bộ thẻ
- [ ] Tạo bộ thẻ mới
- [ ] Thêm thẻ vào bộ
- [ ] Ôn tập với thuật toán spaced repetition
- [ ] Đánh giá độ khó (Easy, Medium, Hard)
- [ ] Thống kê ôn tập

### ✅ 11. Trang Projects (Dự án nhóm)
- [ ] **KIỂM TRA GIAO DIỆN:**
  - [ ] Nền gradient sáng
  - [ ] Project cards đẹp
  - [ ] Màu sắc theo status
- [ ] Danh sách dự án
- [ ] Tạo dự án mới
- [ ] Thêm thành viên
- [ ] Xóa thành viên
- [ ] Chat realtime trong dự án
- [ ] **Roadmap/Timeline:**
  - [ ] Hiển thị milestones
  - [ ] Tạo milestone mới
  - [ ] Cập nhật tiến độ milestone
  - [ ] Xóa milestone
- [ ] Thống kê tiến độ dự án

### ✅ 12. Trang Profile (Hồ sơ cá nhân)
- [ ] **KIỂM TRA THÔNG TIN HIỂN THỊ:**
  - [ ] Avatar (ảnh đại diện)
  - [ ] Tên: Nguyễn Văn Hạnh
  - [ ] Email: hanh@gmail.com
  - [ ] MSSV: 110121001
  - [ ] Lớp: DA21TTA
  - [ ] Khoa: Công nghệ thông tin
  - [ ] **Ngày tham gia: Tháng 6 năm 2026** ⭐
- [ ] Upload/Đổi avatar
- [ ] Sửa thông tin cá nhân
- [ ] Đổi mật khẩu
- [ ] Thanh strength password
- [ ] Thống kê tasks
- [ ] Biểu đồ completion ring
- [ ] Tab bạn bè:
  - [ ] Gửi lời mời kết bạn
  - [ ] Chấp nhận lời mời
  - [ ] Từ chối lời mời
  - [ ] Xóa bạn bè
  - [ ] Danh sách bạn bè

### ✅ 13. Gamification (Hệ thống điểm)
- [ ] Tích điểm khi hoàn thành tasks
- [ ] Huy hiệu thành tích
- [ ] Level/Ranking
- [ ] Leaderboard

### ✅ 14. Tính năng khác
- [ ] Notification (Thông báo)
- [ ] Dark/Light mode
- [ ] Responsive trên mobile
- [ ] Search toàn cục
- [ ] Export/Import data

---

## 🐛 CÁCH KIỂM TRA KHI CÓ LỖI

### Lỗi không đăng nhập được:
1. Kiểm tra backend console có lỗi không
2. Kiểm tra Network tab trong DevTools (F12)
3. Xem Response của API `/auth/login`
4. Kiểm tra database có user không: `SELECT * FROM users WHERE email='hanh@gmail.com'`

### Lỗi không hiển thị dữ liệu:
1. Mở DevTools (F12) → Console tab
2. Kiểm tra có lỗi API nào không
3. Xem Network tab, kiểm tra response của API
4. Kiểm tra database: `SELECT * FROM tasks WHERE user_id=1`

### Lỗi Tasks không hiển thị "Trễ hạn":
1. Kiểm tra task có `due_date` trong quá khứ không
2. Kiểm tra task có status = 'done' không (nếu done thì không hiện trễ hạn)
3. Hard refresh: Ctrl + Shift + R
4. Clear cache trình duyệt

### Lỗi giao diện Grades chưa đổi:
1. **Hard Refresh:** Ctrl + Shift + R
2. Xóa cache: F12 → Application → Clear storage
3. Kiểm tra file `Grades.vue` có background gradient không
4. Restart dev server

---

## 📊 DỮ LIỆU CÓ SẴN TRONG HỆ THỐNG

Sau khi import `test_data_full.sql`, hệ thống có:

- ✅ **4 users** (hanh, mai, tung, lan)
- ✅ **10 tasks** (trong đó có tasks quá hạn để test)
- ✅ **7 môn học** với điểm số
- ✅ **6 thói quen** với lịch sử tracking
- ✅ **9 lịch học & lịch thi**
- ✅ **10 giao dịch tài chính**
- ✅ **7 ngân sách theo category**
- ✅ **7 flashcards** (2 bộ thẻ)
- ✅ **4 quan hệ bạn bè** (accepted & pending)
- ✅ **3 dự án nhóm**
- ✅ **9 tin nhắn chat** trong dự án
- ✅ **7 milestones** cho dự án

---

## 🎉 HOÀN TẤT!

Sau khi làm theo hướng dẫn, bạn có thể:
1. Đăng nhập bằng `hanh@gmail.com` / `123456`
2. Xem đầy đủ dữ liệu ở tất cả các trang
3. Test mọi tính năng của hệ thống

**LƯU Ý:** Nếu gặp vấn đề, hãy:
- Kiểm tra Console log (F12)
- Kiểm tra Network tab
- Xem log của Backend server
- Đảm bảo MySQL đang chạy

---

💡 **TIP:** Để refresh dữ liệu, chỉ cần import lại file `test_data_full.sql` qua phpMyAdmin!
