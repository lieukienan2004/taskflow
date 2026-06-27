# NỘI DUNG MÔ TẢ CHỨC NĂNG CÁC TRANG
# ĐỂ CHÈN VÀO BÁO CÁO KHÓA LUẬN

> Copy nội dung từng mục tương ứng và dán vào phần "Thiết kế giao diện" hoặc "Kết quả thực nghiệm" của báo cáo.

---

## MỤC 3.3.10. Trang Báo cáo và phân tích (`/reports`)

Trang báo cáo cung cấp bộ công cụ phân tích hiệu suất học tập toàn diện, được thiết kế theo hướng card-based với header gradient làm nổi bật các chỉ số quan trọng. Giao diện bao gồm ba nhóm chức năng chính:

**(1) Xu hướng theo thời gian (Trend Chart)**  
Người dùng có thể chuyển đổi giữa ba chế độ xem: 7 ngày, 30 ngày hoặc 12 tháng thông qua các tab phân đoạn thời gian (period tabs). Biểu đồ đường (hoặc cột nếu dữ liệu quá ít) được vẽ bằng Chart.js hiển thị ba chỉ số: số nhiệm vụ tạo mới (màu xanh dương), số nhiệm vụ hoàn thành (màu xanh lá) và số nhiệm vụ quá hạn (màu đỏ). Phía trên biểu đồ có thanh tóm tắt (summary bar) hiển thị tổng số liệu tương ứng với từng chỉ số, giúp người dùng nắm tổng quan nhanh. Trục hoành thể hiện khoảng thời gian, trục tung đếm số lượng công việc, lưới tọa độ nhạt màu để tăng khả năng đọc biểu đồ.

**(2) Phân tích năng suất AI (Productivity AI)**  
Khu vực này tích hợp Google Generative AI để đưa ra đánh giá tự động về năng suất làm việc của người dùng. Giao diện hiển thị bốn thẻ thống kê tổng hợp: Tổng số nhiệm vụ, Tỷ lệ hoàn thành (%), Số công việc đang làm, Số công việc quá hạn. Phần "Gợi ý cải thiện" (insights) liệt kê các nhận xét và lời khuyên cụ thể do AI sinh ra, ví dụ như "Bạn có quá nhiều công việc quá hạn, hãy ưu tiên xử lý ngay". Hệ thống còn phân tích hiệu suất theo từng danh mục công việc (category insights) với thanh tiến độ ngang, thể hiện tỷ lệ hoàn thành trên mỗi danh mục để người dùng nhận diện lĩnh vực cần cải thiện. Nút "Phân tích lại" cho phép tái phân tích khi có bộ dữ liệu mới.

**(3) Biểu đồ Gantt (Gantt Chart)**  
Phần này trực quan hóa lộ trình thời gian của các nhiệm vụ. Trục dọc liệt kê tên nhiệm vụ và ngày bắt đầu/kết thúc, trục ngang là timeline được chia thành các khoảng thời gian đều. Mỗi nhiệm vụ được biểu diễn bằng thanh màu (bar) có độ dài tỷ lệ với khoảng thời gian thực hiện, vị trí bắt đầu tương ứng ngày tạo và kết thúc tại hạn chót. Màu sắc thanh phản ánh trạng thái: xám (Chưa làm), vàng (Đang làm), xanh lá (Hoàn thành), đỏ (Quá hạn). Người dùng có thể cuộn ngang để xem toàn bộ timeline. Chú thích (legend) giúp phân biệt trạng thái nhanh. Trong trường hợp task chưa có hạn chót, hệ thống mặc định gán độ dài 3 ngày và màu xám để hiển thị.

**(4) Nhắc nhở Deadline (Reminders)**  
Module nhắc nhở liệt kê các nhiệm vụ sắp đến hạn theo khung thời gian người dùng lựa chọn: 1 giờ, 6 giờ, 24 giờ hoặc 3 ngày. Mỗi reminder card hiển thị thanh màu độ ưu tiên bên trái (đỏ cao, vàng trung bình, xanh thấp), tên công việc và thẻ thời gian còn lại (VD: "Còn 6 giờ", "Sắp hết hạn!"). Người dùng nhấn nút "Gửi nhắc nhở" để hệ thống gửi email cảnh báo đến địa chỉ đã đăng ký. Nếu không có task nào sắp hết hạn trong khung thời gian chọn, giao diện hiển thị trạng thái trống với thông báo tích cực.

**(5) Xuất báo cáo PDF**  
Nút "Xuất PDF" ở header chính cho phép người dùng xuất toàn bộ nội dung trang báo cáo thành file PDF định dạng A4 landscape. Hệ thống sử dụng thư viện `html2pdf.js` để render HTML sang canvas sau đó chuyển thành PDF. Trong quá trình xuất, các phần tử giao diện không cần thiết (nút bấm, tab period, icon) được ẩn tạm thời, header chuyên dụng dạng in (BÁO CÁO NĂNG SUẤT + ngày giờ) được hiển thị thay thế, và các card được tối ưu padding, shadow để phù hợp khổ giấy. Tên file mặc định là `Bao_Cao_Tien_Do_Hoc_Tap_TaskFlow.pdf`.

---

## MỤC 3.3.4. Trang Dự án (`/projects`)

Trang quản lý dự án cung cấp giao diện lưới thẻ (card grid) hiển thị các nhóm công việc lớn, mỗi thẻ đại diện cho một dự án với thông tin tổng hợp:

**Thanh thống kê (Stats Bar):** Ngay dưới header, hệ thống hiển thị bốn chỉ số hình tròn (pill-shaped): Tổng số dự án, Tổng số công việc trong tất cả dự án, Số công việc đã hoàn thành, và Tiến độ trung bình (%) của toàn bộ dự án. Chỉ số tiến độ sử dụng accent màu teal để làm nổi bật.

**Thẻ dự án (Project Card):** Mỗi card có chiều cao tối thiểu 280px, bo góc 22px, shadow nhẹ và thanh màu gradient 4px ở đỉnh (`::before` pseudo-element) lấy màu nhận diện từ thuộc tính CSS `--card-color` của từng dự án. Thẻ gồm:
- **Header:** Icon vuông 50px hiển thị chữ cái đầu tên dự án, màu nền theo màu dự án; nút chỉnh sửa và xóa chỉ xuất hiện khi hover (opacity transition 0→1, transform translateY).
- **Body:** Tên dự án (ellipsis nếu dài), badge môn học liên kết (pill màu teal nhạt), mô tả rút gọn tối đa 2 dòng (`line-clamp: 2`).
- **Footer:** Hai chỉ số "X/Y công việc" và "Z% tiến độ", thanh track 7px hiển thị progress fill, và dòng chữ "Xem chi tiết" kèm mũi tên.

**Hành vi hover:** Card nâng lên 5px (translateY(-5px)), shadow tăng độ lan tỏa, viền chuyển sang màu teal, các nút edit/delete hiện ra và dòng "Xem chi tiết" đổi màu teal.

**Modal tạo/sửa dự án:** Form overlay mờ nền (backdrop-filter: blur) cho phép nhập tên (bắt buộc), mô tả chit tiết, chọn màu nhận diện từ bộ màu preset (`['#117c75', '#34d399', '#60a5fa', '#f472b6', '#2dd4bf', '#fb923c']`) hiển thị dạng color swatch (hình vuông 36px), và liên kết môn học từ danh sách dropdown. Modal hỗ trợ cả tạo mới và chỉnh sửa với hai form riêng biệt, validation required trên tên dự án.

**Trạng thái trống (Empty State):** Khi chưa có dự án nào, giao diện hiển thị icon thư mục lớn, dòng chữ hướng dẫn và nút "Tạo dự án đầu tiên" gradient teal.

---

## MỤC 3.3.5. Trang Lịch (`/calendar`)

Trang Lịch cung cấp giao diện theo dõi công việc theo dạng lưới tháng (month grid), kết hợp chức năng ghi chú cá nhân và quick-create task.

**Header điều khiển:** Bao gồm tên tháng hiện tại (viết thường, căn giữa), hai nút lùi/tới tháng (◀/▶), nút "Hôm nay" để reset về tháng hiện tại, và nút "Xuất File Lịch (.ics)" để đồng bộ với Google Calendar/iCal.

**Bảng chú giải (Legend):** Thanh ngang chứa 4 chip màu quy ước: Chờ làm (xám), Đang làm (vàng), Hoàn thành (xanh lá), Trễ hạn (đỏ), giúp người dùng nhận diện trạng thái công việc nhanh chóng.

**Lưới lịch (Calendar Grid):**  
- Cấu trúc CSS Grid 7 cột (CN → T7), mỗi ô có chiều cao tối thiểu 105px.  
- Các ngày của tháng trước và sau được hiển thị mờ nhạt (`opacity: 0.4`, nền xám) để lấp đầy lưới vuông 6 hàng × 7 cột.  
- Ngày "Hôm nay" được đánh dấu viền dày 2px teal, badge tròn "Hôm nay" và gradient nền nhạt. Ngày có ghi chú được viền màu vàng amber (`#fbbf24`). Cuối tuần có nền xám nhạt.  
- Mỗi ô hiển thị số ngày ở góc trái, tối đa 3 sự kiện (event badges) dạng chip nhỏ màu sắc theo trạng thái, hiển thị thời gian (nếu có) và tên task rút gọn. Dòng "+X nữa" cho biết còn bao nhiêu task ẩn.

**Modal chi tiết ngày (Day Detail Modal):** Khi click vào ô lịch, modal overlay mờ hiện ra chứa:
- **Phần ghi chú:** Giao diện màu vàng gradient với editor (textarea) và display. Người dùng click vào vùng trống để thêm ghi chú, lưu vào localStorage theo key `taskflow_calendar_notes`. Có nút chỉnh sửa (✏️) và xóa (🗑️) khi đã có nội dung.
- **Liên kết hệ sinh thái:** Component `RelatedLinks` hiển thị shortcut đến Tasks, Timebox, Notes liên quan đến ngày đó.
- **Form tạo công việc:** Khi nhấn "Thêm mới", form xuất hiện cho phép nhập tên, mô tả, chọn thời gian (input type=time), độ ưu tiên. Task được tạo với hạn chót chính xác theo ngày đã chọn + thời gian nhập.
- **Danh sách công việc trong ngày:** Nếu có task, hiển thị list với indicator trạng thái bên trái, badge trạng thái và priority, hỗ trợ click để chuyển sang trang chi tiết task. Task quá hạn có nền đỏ nhạt (`#fef2f2`).

**Xuất iCal:** Hàm `exportToiCal` tạo file `.ics` chuẩn RFC 5545, chuyển đổi từ danh sách task có `due_date` sang VEVENT với UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION, CATEGORIES. File được tải về tự động qua Blob URL.

**Tính năng liên quan:** Click vào event badge trên lịch hoặc vào task item trong modal → `router.push(/tasks/${task.id})` để mở chi tiết task.

---

## MỤC 3.3.2. Trang Quản lý Nhiệm vụ (`/tasks`)

Giao diện quản lý nhiệm vụ là trung tâm vận hành chính của hệ thống, được thiết kế dạng ứng dụng danh sách có bộ lọc mạnh mẽ:

**Header:** Gradient xanh lá nhạt, bên trái icon đồng hồ cát + tiêu đề "Nhiệm Vụ" + phụ đề "Quản lý và theo dõi tiến độ công việc", bên phải nút "Tạo Nhiệm Vụ" màu teal đậm với hiệu ứng shadow và hover lift.

**Thanh lọc (Filter Bar):** Cung cấp 5 công cụ lọc/thao tác:
1. **Segmented button nhóm trạng thái:** 5 nút nằm trong container nền xám bo góc – Tất cả, Chưa làm, Đang làm, Hoàn thành, Quá hạn. Nút active có nền trắng + shadow nhỏ, badge số lượng hiển thị bên phải mỗi label.
2. **Dropdown ưu tiên:** Chọn Cao / Trung bình / Thấp.
3. **Dropdown danh mục:** Danh sách động lấy từ danh mục có trong dữ liệu task.
4. **Dropdown sắp xếp:** Hạn gần / Hạn xa.
5. **Nút "Bỏ lọc":** Reset toàn bộ filter và sort về mặc định.

**Lưới thẻ (Task Grid):** CSS Grid tự động điều chỉnh `repeat(auto-fill, minmax(340px, 1fr))`. Mỗi TaskCard hiển thị dot trạng thái, tiêu đề, tag danh mục với icon tương ứng, ngày hạn dạng `DD/MM`, badge priority màu sắc. Trạng thái loading hiển thị 6 skeleton cards với hiệu ứng shimmer. Khi không có kết quả lọc, trang hiển thị empty state có title động ("Chưa có nhiệm vụ nào" hoặc "Không tìm thấy kết quả"), phụ đề và nút tạo mới.

**Modal TaskForm:** Component tái sử dụng popup-centered với backdrop mờ, form một cột gồm: tiêu đề (text, required), mô tả (textarea), danh mục (select), độ ưu tiên (3 nút chọn màu), ngày hạn chót (date input), dự án liên kết (select). Form hỗ trợ cả chế độ tạo mới và chỉnh sửa, đóng khi click overlay hoặc nút hủy.

---

## MỤC 3.3.3. Trang Kanban Board (`/kanban`)

Kanban Board cung cấp trực quan hóa quy trình công việc dạng bảng kéo thả (drag-and-drop), xây dựng với 4 cột tương ứng 4 trạng thái:

**Cấu trúc cột:** Sử dụng CSS Grid 4 cột bằng nhau (bằng `1fr`). Mỗi cột có header với icon, label ("Chưa Làm / Đang Làm / Hoàn Thành / Quá Hạn"), badge đếm số task màu sắc. Viền dưới header có độ dày 2px và màu tương ứng trạng thái (xám, vàng, xanh, đỏ) để phân biệt trực quan.

**Thẻ Kanban (Kanban Card):** Thiết kế theo phong cách dark glassmorphism với nền gradient tối trong suốt (`rgba(20,20,22,0.8)` → `rgba(10,10,12,0.9)`), viền trắng trong suốt, `backdrop-filter: blur(20px)`. Thẻ chứa:
- Thanh priority bên trái 4px gradient (đỏ/vàng/xanh theo mức độ).
- Tiêu đề màu trắng đậm (`font-weight: 600`, `text-shadow`).
- Mô tả rút gọn tối đa 2 dòng bằng `-webkit-line-clamp`.
- Meta: tag danh mục có icon emoji, ngày hạn chót với màu động (đỏ nếu quá hạn, vàng nếu sắp hết hạn, xám nếu bình thường).
- Footer: badge priority viết hoa uppercase, gợi ý "⠿ kéo thả" chỉ hiện khi hover.

**Kéo thả (Drag & Drop):**  
- `dragstart`: gán `draggedTask`.  
- `dragover`/`dragleave`: bật/tắt class `drag-over` làm viền cột đổi sang màu teal và nền teal 5%.  
- `drop`: cập nhật trạng thái task, ưu tiên update optimistic UI. Nếu chuyển sang "done" từ trạng thái khác → kích hoạt hiệu ứng pháo hoa (`canvas-confetti`) với màu teal, xanh lá, trắng.  
- Thẻ đang kéo (`dragging`) mờ mà giảm opacity, scale thu nhỏ 0.96, xoay 2deg, shadow mạnh. Nếu drop thất bại (lỗi API), rollback về trạng thái cũ.

**Nút thêm task:** Mỗi cột có nút dashed "+ Thêm công việc" ở đáy, click mở TaskForm với `defaultStatus` tương ứng cột đó.

**Responsive:** Dưới 768px board chuyển sang flexbox ngang có scroll ngang (`scroll-snap-type: x mandatory`), mỗi cột chiếm `min-width: 280px`, scroll-snap-align start.

---

## MỤC 3.3.1. Trang Dashboard – Trang tổng quan (`/dashboard`)

Đây là trang chủ hiển thị sau khi đăng nhập thành công, cung cấp cái nhìn tổng hợp toàn diện về tình hình học tập của người dùng:

**Banner thông báo toàn cục (Global Banner):**  
Nằm ở vị trí absolute top, chiều cao cố định 38px. Chỉ hiển thị khi có thông báo hệ thống. Nội dung chạy ngang dạng marquee vô hạn với `animation: translateX` 20s linear. Banner có màu gradient động theo `type` thông báo (info=teal, success=xanh lá, warning=cam, error=đỏ). Có badge "Thông báo" kèm icon chuông, dấu ✦ phân cách các thông báo, và nút đóng (×) để ẩn. Icon chuông trong badge có animation `shake` nhẹ để thu hút sự chú ý.

**Banner lời mời dự án (Invitations Banner):**  
Khi người dùng có lời mời tham gia nhóm học tập, banner màu vàng nhạt (`#fffbeb`) với viền vàng hiển thị danh sách các lời mời. Mỗi item gồm tên dự án, tên người mời + email, hai nút "Đồng ý" (xanh lá) và "Từ chối" (viền xám). Khi nhấn đồng ý, hệ thống gọi API và cập nhật danh sách dự án.

**Thẻ thống kê trạng thái (Stats Grid):**  
Bốn card lớn `minmax(180px, 1fr)` thể hiện số liệu: Cần làm (nút tròn xám), Đang làm (nút tròn vàng), Đã xong (nút tronc xanh lá), Quá hạn (nút tròn đỏ, chỉ hiển khi >0). Mỗi card có icon, số lớn 1.8rem, label uppercase. Hiệu ứng hover: card nâng 2px, background chuyển gradient màu tương ứng (ví dụ card "Cần làm" hover sang tím, card "Đang làm" hover sang xanh ngọc), mũi tên phải hiện ra.

**Biểu đồ phân bổ trạng thái (Status Bars):**  
Bên trong card "status-card", bốn thanh ngang hiển thị tỷ lệ phần trăm của từng trạng thái: label + chấm màu + số lượng + track 6px + fill gradient. Chiều rộng fill được tính động `(count/total)*100%` và chuyển đổi mượt mà `transition: width 0.6s ease`.

**Biểu đồ danh mục (Category Chart):**  
Chart.js cột hiển thị số lượng công việc theo từng danh mục. Cột bo tròn 6px (`borderRadius: 6`), palette 6 màu teal-xanh. Không có legend, trục x hiển nhãn category, trục y grid line mờ.

**Phân tích xu hướng 7 ngày (Trend Chart):**  
Biểu đồ đường Chart.js vẽ hai đường: "Tạo mới" (cam) và "Hoàn thành" (xanh lá), vùng dưới đường fill mờ, tension 0.3. Trục x là ngày/tháng 7 ngày gần nhất, trục y step size 1 để đếm số công việc rời rạc.

**Phân tích trì hoãn (Procrastination Analyzer):**  
Khu vực nổi bật bên phải dashboard, gồm:
- **Vòng gauge 90px:** `conic-gradient` hiển thị % chỉ số trì hoãn, màu đổi theo mức độ (xanh <30, cam 30-60, đỏ ≥60). Số % lớn ở giữa.
- **Badge rủi ro:** Pill-shaped text "Nguy cơ Trì hoãn Thấp/Trung Bình/Cảnh Báo Cao".
- **Đoạn lời khuyên:** Dòng text nhỏ bên dưới badge.
- **Khung giờ vàng (Peak Hours):** Phân tích khung Sáng/Chiều/Tối/Đêm dựa trên số task hoàn thành trong từng khoảng. Hiển thị emoji tương ứng (🌅☀️🌃🦉), tên khung giờ và lời khích lệ. Phía dưới là 4 hàng bar chart ngang hiển thị số lượng theo từng khung.
- **Việc bị dời hạn nhiều nhất:** Danh sách 3 task có `postpone_count` cao nhất, mỗi item hiển thị tên và số lần dời.

**Widget bên phải:**  
Cột 2 widget trên mobile:
1. *Sắp đến hạn*: list 5 task sắp hết hạn nhất, mỗi dòng có dot priority, tiêu đề ellipsis, ngày hạn `DD/MM`, tag priority màu.
2. *Hiệu suất hôm nay*: Vòng tròn SVG 120px, stroke-dasharray tỷ lệ % hoàn thành trong ngày, gradient `#34d399 → #10b981`, số % lớn ở trung tâm.
3. *OKRs*: Click vào mở `/semester-plan`. Hiển thị tên kế hoạch + progress bar gradient teal.
4. *Thống kê nhanh:* 2×2 grid nền màu khác nhau (Đang làm-vàng, Quá hạn-đỏ, Hoàn thành-xanh, Tổng-xanh teal).

**Hệ sinh thái liên kết (Ecosystem Hub):**  
3 thẻ ngang dạng shortcut card:
- Ghi chú: icon bút, label "Ghi chú", progress bar vàng.
- Lịch: icon lịch, label "Lịch", progress bar cam.
- Thời gian: icon đồng hồ, `formatMinutes()` hiển thị phút/giờ học hôm nay, progress bar tím.

Smart Insight badge màu vàng ở đáy: động theo tỷ lệ hoàn thành (>=75% "Tuyệt vời!", <40% "Hãy ưu tiên...", có overdue "Bạn có X nhiệm vụ trễ hạn").

**Footer/Cấu trúc responsive:**  
Trên mobile (≤768px), stats grid chuyển 2 cột, charts xếp chồng 1 cột, padding toàn trang giảm, widgets xếp dọc. Giao diện gradient nền nhạt kéo dài toàn bộ trang.

---

## GHI CHÚ KHI DÙNG NỘI DUNG TRÊN CHO BÁO CÁO

1. **Chèn hình ảnh minh họa kèm theo:**  
   - Hình 3.XX: Screenshot trang Reports (xuất PDF trước khi chèn).  
   - Hình 3.XX: Screenshot trang Projects (lưới card + button tạo).  
   - Hình 3.XX: Screenshot trang Calendar (lưới tháng có task).  
   - Hình 3.XX: Screenshot trang Dashboard (banner thông báo + stats grid).  
   - Hình 3.XX: Screenshot trang Kanban (4 cột có task).

2. **Kích thước ảnh đề xuất:**  
   Chụp màn hình ở resolution 1920×1080 hoặc 1366×768, nén JPEG quality 85% để vừa khổ A4 báo cáo.

3. **Điều chỉnh cấu trúc chương:**  
   Đặt các mục trên vào **Chương 3: Thiết kế và xây dựng hệ thống**, mục **3.3. Giao diện người dùng**. Bạn có thể gộp các trang lại thành nhóm chức năng lớn (ví dụ: 3.3.1 Trang chủ Dashboard, 3.3.2 Trang Nhiệm vụ & Kanban, 3.3.3 Quản lý dự án, 3.3.4 Lịch & Báo cáo, 3.3.5 Trang phân tích và AI).

4. **Sơ đồ có thể bổ sung ở mục 3.2 Kiến trúc:**  
   - Sơ đồ phân rán (wireframe) các trang chính.  
   - Sơ đồ luồng chuyển trạng thái nhiệm vụ.  
   - Sơ đồ các chức năng trang Reports (block diagram).

5. **Bảng tóm tắt chức năng giao diện:**  
   Bạn có thể trích xuất bảng sau để đặt vào phần tổng quan giao diện:

   | Trang | Đường dẫn | Chức năng chính |
   |---|---|---|
   | Dashboard | `/dashboard` | Thống kê tổng hợp, biểu đồ, phân tích trì hoãn, khung giờ vàng, OKRs, ecosystem hub |
   | Nhiệm vụ | `/tasks` | CRUD task, lọc, sắp xếp, tìm kiếm, xóa mềm |
   | Kanban | `/kanban` | Kéo thả task, 4 trạng thái, confetti khi hoàn thành |
   | Dự án | `/projects` | Nhóm công việc, progress bar, mời thành viên |
   | Chi tiết dự án | `/projects/:id` | Milestones, chat nhóm, so sánh lịch trình |
   | Lịch | `/calendar` | Lưới tháng, ghi chú ngày, xuất .ics |
   | Báo cáo | `/reports` | Trend chart, Gantt, AI productivity, reminders, xuất PDF |
   | Ma trận Eisenhower | `/eisenhower` | Phân loại 4 góc Q1-Q4 |
   | Pomodoro | `/focus-room` | Hẹn giờ 25/5 phút, nhạc nền |
   | Hồ sơ | `/profile` | Avatar, kết bạn, XP/level |
   | Admin | `/admin/*` | Dashboard hệ thống, quản lý user/project/category, xuất CSV |

6. **Lưu ý định dạng:**  
   Nội dung này mặc định là Markdown. Khi chuyển sang Word/DOCX, giữ lại:  
   - Heading levels (Heading 2 cho mục 3.3.X, Heading 3 cho (1)(2)(3)...).  
   - Bullet points và số thứ tự.  
   - Bảng (convert sang Word table giữ nguyên cấu trúc).  
   - In đậm các thuật ngữ công nghệ (Chart.js, Socket.io, html2pdf.js).

7. **Đề xuất đặt tên hình ảnh theo chuẩn báo cáo:**  
   - `hinh3.1_dashboard_tong_quan.png`  
   - `hinh3.2_trang_nhiem_vu.png`  
   - `hinh3.3_kanban_board.png`  
   - `hinh3.4_trang_du_an.png`  
   - `hinh3.5_lich_thang.png`  
   - `hinh3.6_bao_cao_pdf.png`
