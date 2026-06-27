# NỘI DUNG ĐỂ CHÈN VÀO BÁO CÁO KHÓA LUẬN

> Copy toàn bộ nội dung dưới đây và dán vào phần mô tả hệ thống / kết quả thực nghiệm của báo cáo.

---

## CHƯƠNG 3: THIẾT KẾ VÀ XÂY DỰNG HỆ THỐNG

### 3.1. Tổng quan hệ thống

TaskFlow là ứng dụng quản lý nhiệm vụ học tập được xây dựng trên nền tảng web, cung cấp môi trường tích hợp cho sinh viên trong việc lập kế hoạch, theo dõi và đánh giá tiến độ công việc cá nhân cũng như nhóm. Hệ thống được phát triển theo kiến trúc phân tầng Client–Server với giao tiếp REST API giữa frontend và backend, kết hợp cơ chế real-time thông qua Socket.io để cập nhật dữ liệu tức thời giữa các người dùng.

Hệ thống bao gồm hai thành phần chính:
- **Frontend**: Ứng dụng đơn trang (SPA) xây dựng bằng Vue.js 3, sử dụng Vite làm công cụ đóng gói và phát triển. Giao diện người dùng được thiết kế theo hướng dạng card (card-based UI) với phong cách tối giản, hỗ trợ chế độ sáng/tối và tương thích đa thiết bị.
- **Backend**: Máy chủ ứng dụng Node.js với framework Express, hệ quản trị cơ sở dữ liệu MySQL, tích hợp các thư viện xác thực (Passport), mã hóa (bcrypt, JWT), xử lý email (Nodemailer) và AI (Google Generative AI).

### 3.2. Kiến trúc hệ thống

Kiến trúc tổng thể của TaskFlow mô tả theo mô hình phân tầng ba lớp (Three-Tier Architecture):

- **Tầng giao diện (Presentation Layer)**: Vue.js 3 với Vue Router quản lý định tuyến, Pinia quản lý trạng thái toàn cục. Giao diện được tổ chức theo hai layout riêng biệt: *UserLayout* cho người dùng thông thường và *AdminLayout* cho quản trị viên.
- **Tầng xử lý (Application Layer)**: Node.js + Express cung cấp các endpoint REST API đóng gói trong module `server.js`, xử lý các nghiệp vụ kinh doanh thông qua service tương ứng với từng tài nguyên (tasks, projects, categories, notifications, users,...). Socket.io được triển khai song song để truyền thông điệp real-time.
- **Tầng dữ liệu (Data Layer)**: MySQL lưu trữ thông tin người dùng, nhiệm vụ, dự án, danh mục, thông báo và nhật ký hoạt động. Hệ thống sử dụng `mysql2` làm driver kết nối và thực hiện migration tự động kiểm tra cấu trúc bảng khi khởi động.

Luồng dữ liệu chính: Người dùng tương tác giao diện Vue → Pinia store gọi API qua Axios → Express xử lý request → Truy vấn MySQL → Trả kết quả JSON → Vue cập nhật giao diện. Song song đó, Socket.io duy trì kết nối WebSocket để đẩy thông báo và cập nhật trạng thái từ server đến client mà không cần client poll lại.

### 3.3. Các chức năng chính của giao diện người dùng

#### 3.3.1. Dashboard – Trang tổng quan

Trang chủ sau khi đăng nhập hiển thị bộ thống kê tổng hợp gồm bốn thẻ số liệu: *Cần làm*, *Đang làm*, *Đã xong* và *Quá hạn*. Mỗi thẻ có biểu tượng màu sắc riêng và hỗ trợ nhấp chuột để lọc nhanh về danh sách nhiệm vụ tương ứng.

Phần biểu đồ gồm hai khu vực: (1) biểu đồ cột hiển thị phân bổ công việc theo danh mục sử dụng thư viện Chart.js; (2) biểu đồ đường thể hiện xu hướng tạo mới và hoàn thành nhiệm vụ trong 7 ngày gần nhất.

Phân tích trì hoãn là tính năng nổi bật, bao gồm vòng gauge chỉ số trì hoãn (Procrastination Index) được tính dựa trên tổng số lần dời hạn và số công việc quá hạn, phân loại rủi ro thành ba mức độ (Thấp – Trung bình – Cao) với màu sắc tương ứng (xanh – cam – đỏ). Hệ thống còn xác định "Khung giờ vàng" làm việc dựa trên khung thời gian người dùng hoàn thành nhiệm công việc nhất, kèm theo danh sách các nhiệm vụ bị dời hạn nhiều lần nhất.

Các widget phụ: *Sắp đến hạn* (liệt kê 5 task gần hạn nhất), *Hiệu suất hôm nay* (vòng tròn tỷ lệ hoàn thành trong ngày), *OKRs* (hiển thị kế hoạch và tiến độ mục tiêu), và *Thống kê nhanh* (tổng hợp 4 chỉ số quan trọng).

Phần "Hệ Sinh Thái Liên Kết" cung cấp shortcut đến các chức năng phụ trợ: Ghi chú, Lịch và Thời gian, mỗi thẻ hiển thị tiến độ hoàn thành tương ứng.

#### 3.3.2. Quản lý nhiệm vụ (`/tasks`)

Trang nhiệm vụ cung cấp giao diện lưới thẻ (task cards) cho phép người dùng quản lý toàn bộ công việc. Các chức năng cốt lõi:

- **Tạo và chỉnh sửa nhiệm vụ**: Form modal cho phép nhập tiêu đề, mô tả, chọn danh mục, độ ưu tiên (Cao / Trung bình / Thấp), ngày hạn chót và gán vào dự án.
- **Lọc và tìm kiếm**: Người dùng có thể lọc theo trạng thái (Tất cả / Chưa làm / Đang làm / Hoàn thành / Quá hạn), lọc theo độ ưu tiên, lọc theo danh mục, sắp xếp theo hạn chót (tăng dần / giảm dần) và tìm kiếm theo tiêu đề.
- **Thay đổi trạng thái nhanh**: Click vào thẻ nhiệm vụ để mở trang chi tiết và cập nhật trạng thái.
- **Xóa mềm**: Di chuyển nhiệm vụ vào thùng rác thay vì xóa vĩnh viễn, cho phép khôi phục sau.
- **Trạng thái trống**: Khi không có nhiệm vụ phù hợp bộ lọc, giao diện hiển thị trạng thái trống có nút tạo nhiệm vụ mới ngay lập tức.

#### 3.3.3. Kanban Board (`/kanban`)

Kanban Board cung cấp giao diện kéo thả trực quan với bốn cột tương ứng bốn trạng thái: *Chưa Làm*, *Đang Làm*, *Hoàn Thành* và *Quá Hạn*. Người dùng có thể kéo thả thẻ công việc giữa các cột để thay đổi trạng thái. Khi công việc được chuyển sang cột "Hoàn Thành", hệ thống kích hoạt hiệu ứng pháo hoa (confetti) như phần thưởng trực quan.

Mỗi thẻ Kanban hiển thị: thanh màu chỉ độ ưu tiên bên trái (đỏ cho Cao, vàng cho Trung bình, xanh cho Thấp), tiêu đề, mô tả rút gọn, tag danh mục có icon tương ứng, ngày hạn chót có màu cảnh báo nếu quá hạn hoặc sắp hết hạn, badge độ ưu tiên và gợi ý kéo thả.

Mỗi cột có nút "Thêm công việc" tạo task mới với trạng thái mặc định tương ứng cột đó.

#### 3.3.4. Dự án (`/projects`)

Chức năng quản lý dự án theo nhóm học tập cho phép tạo dự án mới với tên, mô tả, màu sắc và liên kết môn học. Trang chi tiết dự án cung cấp:

- **Mốc tiến độ (Milestones)**: Tạo các cột mốc trung gian với hạn chót để theo dõi giai đoạn.
- **Thành viên**: Hệ thống mời bạn bè tham gia dự án thông qua email, người được mời có thể chấp nhận hoặc từ chối. Dashboard hiển thị banner thông báo lời mời khi người dùng đăng nhập.
- **Chat nhóm**: Giao diện trò chuyện nội bộ nhóm.
- **So sánh lịch trình**: Tìm các khung giờ trống chung giữa các thành viên để lên lịch họp.

#### 3.3.5. Lịch (`/calendar`) và Lịch trình (`/timetable`)

Trang Lịch hiển thị dạng lưới tháng, các ngày có nhiệm vụ được đánh dấu chấm màu. Người dùng click vào ngày để xem danh sách công việc trong ngày. Hệ thống hỗ trợ xuất dữ liệu sang định dạng Google Calendar và iCal.

Trang Lịch trình cho phép thêm các buổi học/làm việc cố định theo tuần (chọn thứ, giờ bắt đầu, giờ kết thúc, phòng), và có chức năng tạo nhiệm vụ tự động từ các buổi trong lịch trình.

#### 3.3.6. Kế hoạch ngày (`/timebox`)

Kế hoạch Timebox Planner giúp người dùng sắp xếp công việc theo từng khung giờ trong ngày. Giao diện gồm hai khu vực: *Backlog* chứa các task chưa xếp lịch và *Timeline* chia thành các khung Sáng / Chiều / Tối để kéo thả task vào. Tính năng tích hợp Pomodoro cho phép đặt hẹn giờ tập trung làm việc.

#### 3.3.7. Ma trận Eisenhower (`/eisenhower`)

Công cụ ưu tiên theo ma trận Eisenhower chia bốn góc: Quý 1 (Quan trọng – Khẩn cấp: Làm ngay), Quý 2 (Quan trọng – Không khẩn cấp: Lên lịch), Quý 3 (Không quan trọng – Khẩn cấp: Uỷ quyền), Quý 4 (Không quan trọng – Không khẩn cấp: Loại bỏ). Người dùng sắp xếp công việc vào từng góc để xác định mức độ ưu tiên hành động.

#### 3.3.8. Thói quen (`/habit-tracker`)

Module theo dõi thói quen hàng ngày cho phép thêm thói quen mới với tên và tần suất. Người dùng thực hiện check-in hàng ngày, hệ thống ghi nhận chuỗi ngày hoàn thành liên tiếp và tính tỷ lệ phần trăm hoàn thành theo tháng.

#### 3.3.9. Phòng tập trung Pomodoro (`/focus-room`)

Giao diện Pomodoro tích hợp nhạc nền, cung cấp hẹn giờ 25 phút tập trung và 5 phút nghỉ ngơi. Đếm số phiên Pomodoro đã hoàn thành trong ngày, kết hợp với nhạc lofi hoặc âm thanh thiên nhiên để tạo môi trường tập trung tối ưu.

#### 3.3.10. Báo cáo (`/reports`)

Trang báo cáo thống kê toàn diện hiển thị các biểu đồ: phân bổ trạng thái (pie chart), số công việc hoàn thành theo tuần (bar chart), phân bổ theo danh mục. Người dùng có thể xuất toàn bộ báo cáo ra định dạng PDF thông qua thư viện `html2pdf.js` để lưu trữ hoặc in ấn.

#### 3.3.11. Cố vấn AI (Chat Widget)

Widget AI ở góc phải màn hình cung cấp trợ lý ảo hỗ trợ người dùng. Người dùng có thể đặt câu hỏi tự do về công việc hoặc chọn câu hỏi nhanh được gợi ý sẵn. AI trả lời dựa trên dữ liệu nhiệm vụ hiện tại của người dùng thông qua Google Generative AI. Nội dung hội thoại có thể sao chép ra clipboard.

#### 3.3.12. Hồ sơ người dùng (`/profile`)

Trang hồ sơ cho phép người dùng cập nhật thông tin cá nhân (họ tên, email), đổi mật khẩu, tải lên và cắt ảnh đại diện (avatar) sử dụng thư viện xử lý ảnh. Hệ thống tích hợp xếp hạng gamification với XP (điểm kinh nghiệm) và level dựa trên số nhiệm vụ hoàn thành. Người dùng có thể gửi lời mời kết bạn, chấp nhận lời mời từ người khác và theo dõi danh sách bạn bè.

### 3.4. Giao diện quản trị (`/admin`)

Phần quản trị viên được bảo vệ bởi cơ chế xác thực riêng với vai trò `admin`, truy cập độc lập hoàn toàn với giao diện người dùng thông thường. Admin layout sử dụng sidebar điều hướng cố định với các chức năng:

- **Dashboard hệ thống**: Tổng quan số liệu toàn hệ thống (tổng người dùng, tổng nhiệm vụ, tổng dự án).
- **Quản lý người dùng**: Xem danh sách, chỉnh sửa thông tin, khóa/mở khóa tài khoản.
- **Quản lý dự án và danh mục**: Thêm, sửa, xóa các dự án và danh mục công việc mặc định của hệ thống.
- **Thông báo hệ thống**: Tạo và quản lý thông báo toàn hệ thống hiển thị dạng banner marquee trên giao diện người dùng.
- **Nhật ký hoạt động**: Xem lịch sử các thao tác của người dùng.
- **Cài đặt hệ thống**: Cấu hình tham số hệ thống.
- **Xuất dữ liệu**: Trích xuất dữ liệu ra định dạng CSV.

### 3.5. Công nghệ sử dụng

#### 3.5.1. Frontend

| Công nghệ | Mục đích |
|---|---|
| Vue.js 3 (Composition API) | Framework giao diện người dùng, quản lý reactive state |
| Vue Router 4 | Định tuyến SPA, bảo vệ route yêu cầu xác thực |
| Pinia | Quản lý trạng thái toàn cục (taskStore, authStore, friendStore) |
| Vite | Công cụ build và dev server |
| Axios | Gửi request HTTP đến backend API |
| Socket.io Client | Kết nối WebSocket real-time |
| Chart.js | Vẽ biểu đồ thống kê |
| html2pdf.js | Xuất báo cáo PDF |
| canvas-confetti | Hiệu ứng pháo hoa (gamification) |
| Capacitor | Đóng gói ứng dụng mobile (Android APK) |

#### 3.5.2. Backend

| Công nghệ | Mục đích |
|---|---|
| Node.js + Express | Máy chủ HTTP, routing, middleware |
| MySQL + mysql2 | Lưu trữ dữ liệu quan hệ |
| Socket.io | Server WebSocket, broadcast real-time |
| JWT + express-session | Xác thực và quản lý phiên đăng nhập |
| Passport + bcryptjs | OAuth2.0 (Google), mã hóa mật khẩu |
| Nodemailer | Gửi email thông báo và mời tham gia |
| Multer | Xử lý upload file và ảnh đại diện |
| @google/generative-ai | Tích hợp AI cố vấn thông minh |

### 3.6. Kết quả đạt được

Hệ thống TaskFlow đã được xây dựng và vận hành thành công trên môi trường phát triển với đầy đủ các chức năng cốt lõi:

- Giao diện người dùng Responsive, hỗ trợ desktop và mobile với hai layout độc lập.
- Đầy đủ lifecycle nhiệm vụ: tạo, xem, chỉnh sửa, lọc, tìm kiếm, thay đổi trạng thái, xóa mềm, khôi phục.
- Hỗ trợ làm việc nhóm qua chức năng dự án, lời mời thành viên và chat nhóm.
- Công cụ phân tích hiệu suất cá nhân: xu hướng 7 ngày, phân tích trì hoãn, khung giờ vàng.
- Tích hợp AI cố vấn thông minh hỗ trợ đặt câu hỏi và nhận gợi ý dựa trên dữ liệu cá nhân.
- Giao diện quản trị hoàn chỉnh để vận hành hệ thống từ phía nhà phát triển.
- Chức năng xuất báo cáo PDF, xuất dữ liệu CSV, tích hợp lịch Google Calendar.
- Gamification với hệ thống XP, Level và hiệu ứng động.

---

## GHI CHÚ KHI CHÈN VÀO BÁO CÁO

1. **Chương**: Điều chỉnh số chương phù hợp với cấu trúc báo cáo của bạn (ví dụ: Chương 2: Cơ sở lý thuyết → Chương 3: Thiết kế và xây dựng hệ thống → Chương 4: Kết quả và đánh giá).
2. **Hình ảnh**: Nên chèn screenshot các trang chính (Dashboard, Tasks, Kanban, Calendar, Reports) vào các mục 3.3.* tương ứng. Gợi ý:
   - Hình 3.1: Trang Dashboard
   - Hình 3.2: Trang Quản lý nhiệm vụ
   - Hình 3.3: Trang Kanban Board
   - Hình 3.4: Trang Dự án chi tiết
   - Hình 3.5: Trang Lịch
   - Hình 3.6: Trang Báo cáo
   - Hình 3.7: Giao diện Admin Dashboard
3. **Sơ đồ**: Có thể bổ sung sơ đồ kiến trúc tổng quan (architecture diagram) và biểu đồ Use Case/Activity Diagram vào mục 3.2.
4. **Bảng**: Các bảng công nghệ sử dụng ở mục 3.5 đã có sẵn, có thể giữ nguyên hoặc rút gọn tùy yêu cầu của giáo viên hướng dẫn.
5. **Lưu ý**: Nội dung này được viết ở dạng markdown, bạn có thể chuyển sang định dạng Word (.docx) bằng công cụ như Pandoc hoặc copy trực tiếp và định dạng lại trong Word theo mẫu trường đại học của bạn.
