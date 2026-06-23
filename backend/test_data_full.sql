-- =====================================================
-- TASKFLOW - DỮ LIỆU TEST ĐẦY ĐỦ
-- File này chứa tất cả dữ liệu test cho toàn bộ hệ thống
-- =====================================================

USE taskflow;

-- =====================================================
-- 1. XÓA DỮ LIỆU CŨ (nếu có)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
TRUNCATE TABLE grades;
TRUNCATE TABLE habits;
TRUNCATE TABLE habit_logs;
TRUNCATE TABLE class_schedules;
TRUNCATE TABLE finance_transactions;
TRUNCATE TABLE monthly_budgets;
TRUNCATE TABLE flashcards;
TRUNCATE TABLE friendships;
TRUNCATE TABLE projects;
TRUNCATE TABLE milestones;
TRUNCATE TABLE project_members;
TRUNCATE TABLE project_chat;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 2. USERS - Người dùng test
-- =====================================================
-- Password mặc định: 123456 (đã hash bcrypt)
INSERT INTO users (name, email, password, student_id, class_name, department, avatar, created_at) VALUES
('Nguyễn Văn Hạnh', 'hanh@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQeMF8xS4.GQv8xKfOPx/W', '110121001', 'DA21TTA', 'Công nghệ thông tin', '/uploads/avatars/default1.jpg', '2026-06-15 08:30:00'),
('Trần Thị Mai', 'mai@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQeMF8xS4.GQv8xKfOPx/W', '110121002', 'DA21TTA', 'Công nghệ thông tin', '/uploads/avatars/default2.jpg', '2026-06-16 09:00:00'),
('Lê Văn Tùng', 'tung@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQeMF8xS4.GQv8xKfOPx/W', '110121003', 'DA21TTB', 'Công nghệ thông tin', NULL, '2026-06-17 10:15:00'),
('Phạm Thị Lan', 'lan@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQeMF8xS4.GQv8xKfOPx/W', '110121004', 'DA21TTA', 'Công nghệ thông tin', NULL, '2026-06-18 11:20:00');

-- =====================================================
-- 3. TASKS - Nhiệm vụ học tập
-- =====================================================
INSERT INTO tasks (user_id, title, description, status, priority, category, due_date, created_at) VALUES
-- Tasks của user 1 (Hạnh)
(1, 'Hoàn thiện báo cáo đồ án', 'Hoàn thiện chương 3 và 4, thêm hình ảnh minh họa', 'in_progress', 'high', 'Học tập', DATE_ADD(NOW(), INTERVAL 2 DAY), NOW()),
(1, 'Nộp bài tập Lập trình Web', 'Làm bài tập tuần 8 về Vue.js và Vuex', 'todo', 'high', 'Học tập', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW()),
(1, 'Ôn tập cho kỳ thi giữa kỳ', 'Ôn lại 5 chương đầu môn Cấu trúc dữ liệu', 'todo', 'medium', 'Học tập', DATE_ADD(NOW(), INTERVAL 5 DAY), NOW()),
(1, 'Đọc sách Clean Code', 'Đọc chương 5, 6, 7 và ghi chú', 'in_progress', 'low', 'Cá nhân', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW()),
(1, 'Họp nhóm dự án', 'Review tiến độ và phân công công việc tuần tới', 'done', 'high', 'Học tập', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Nộp đề cương chi tiết', 'Hoàn thiện đề cương và gửi cho giảng viên', 'overdue', 'high', 'Học tập', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'Tập gym buổi chiều', 'Lịch tập: Ngực, vai, tay theo routine', 'done', 'low', 'Sức khỏe', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Mua sắm đồ dùng học tập', 'Mua vở, bút, tài liệu tham khảo', 'todo', 'low', 'Cá nhân', DATE_ADD(NOW(), INTERVAL 3 DAY), NOW()),

-- Tasks của user 2 (Mai)
(2, 'Làm slide thuyết trình', 'Chuẩn bị slide cho buổi báo cáo tiến độ', 'in_progress', 'high', 'Học tập', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW()),
(2, 'Review code của bạn', 'Kiểm tra và góp ý code của bạn Tùng', 'todo', 'medium', 'Học tập', DATE_ADD(NOW(), INTERVAL 2 DAY), NOW());

-- =====================================================
-- 4. GRADES - Điểm số các môn học
-- =====================================================
INSERT INTO grades (user_id, subject_name, credits, grade_attendance, grade_midterm, grade_final, weight_attendance, weight_midterm, weight_final, target_gpa) VALUES
-- Điểm của user 1 (Hạnh)
(1, 'Lập trình Web', 3, 9.0, 8.5, 8.8, 10, 30, 60, 'A'),
(1, 'Cấu trúc dữ liệu và giải thuật', 4, 8.5, 7.5, 8.0, 10, 30, 60, 'B+'),
(1, 'Cơ sở dữ liệu', 3, 9.5, 9.0, 9.2, 10, 30, 60, 'A'),
(1, 'Mạng máy tính', 3, 8.0, 7.0, 7.5, 10, 30, 60, 'B'),
(1, 'Tiếng Anh chuyên ngành', 2, 9.0, NULL, NULL, 10, 30, 60, 'A'),

-- Điểm của user 2 (Mai)
(2, 'Lập trình hướng đối tượng', 4, 9.5, 9.0, 9.3, 10, 30, 60, 'A'),
(2, 'Phân tích thiết kế hệ thống', 3, 8.5, 8.0, 8.2, 10, 30, 60, 'B+');

-- =====================================================
-- 5. HABITS - Thói quen theo dõi
-- =====================================================
INSERT INTO habits (user_id, name, icon, frequency, target_days, current_streak, longest_streak, color) VALUES
-- Thói quen của user 1 (Hạnh)
(1, 'Đọc sách 30 phút', '📚', 'daily', 7, 5, 12, '#3b82f6'),
(1, 'Tập gym', '💪', 'weekly', 3, 2, 4, '#ef4444'),
(1, 'Học từ vựng tiếng Anh', '🎓', 'daily', 7, 3, 8, '#8b5cf6'),
(1, 'Thiền 10 phút', '🧘', 'daily', 7, 7, 15, '#10b981'),

-- Thói quen của user 2 (Mai)
(2, 'Chạy bộ buổi sáng', '🏃', 'daily', 7, 4, 10, '#f59e0b'),
(2, 'Viết nhật ký', '✍️', 'daily', 7, 2, 6, '#ec4899');

-- =====================================================
-- 6. HABIT_LOGS - Lịch sử hoàn thành thói quen
-- =====================================================
INSERT INTO habit_logs (habit_id, completed_at, note) VALUES
-- Logs cho habit 1 (Đọc sách)
(1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Đọc Clean Code chương 5'),
(1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Đọc The Pragmatic Programmer'),
(1, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Đọc Design Patterns'),
(1, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Đọc Refactoring'),
(1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Đọc Code Complete'),

-- Logs cho habit 2 (Tập gym)
(2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Tập ngực và tay'),
(2, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Tập lưng và vai'),

-- Logs cho habit 4 (Thiền)
(4, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Thiền 15 phút'),
(4, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Thiền 10 phút'),
(4, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Thiền 10 phút'),
(4, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Thiền 20 phút'),
(4, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Thiền 10 phút'),
(4, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thiền 12 phút'),
(4, DATE_SUB(NOW(), INTERVAL 7 DAY), 'Thiền 10 phút');

-- =====================================================
-- 7. CLASS_SCHEDULES - Lịch học và lịch thi
-- =====================================================
INSERT INTO class_schedules (user_id, subject_name, type, day_of_week, start_time, end_time, room, teacher, exam_date, note) VALUES
-- Lịch học của user 1 (Hạnh)
(1, 'Lập trình Web', 'class', 'monday', '07:00:00', '09:00:00', 'A101', 'TS. Nguyễn Văn A', NULL, 'Mang laptop'),
(1, 'Lập trình Web', 'class', 'wednesday', '07:00:00', '09:00:00', 'A101', 'TS. Nguyễn Văn A', NULL, NULL),
(1, 'Cấu trúc dữ liệu', 'class', 'tuesday', '09:15:00', '11:15:00', 'B203', 'PGS.TS Trần Thị B', NULL, NULL),
(1, 'Cấu trúc dữ liệu', 'class', 'thursday', '09:15:00', '11:15:00', 'B203', 'PGS.TS Trần Thị B', NULL, NULL),
(1, 'Cơ sở dữ liệu', 'class', 'friday', '13:00:00', '15:00:00', 'C304', 'ThS. Lê Văn C', NULL, NULL),
(1, 'Mạng máy tính', 'class', 'monday', '13:00:00', '15:00:00', 'D105', 'TS. Phạm Thị D', NULL, NULL),
(1, 'Tiếng Anh chuyên ngành', 'class', 'saturday', '07:00:00', '09:00:00', 'E201', 'ThS. Hoàng Văn E', NULL, NULL),

-- Lịch thi của user 1
(1, 'Cơ sở dữ liệu', 'exam', NULL, '07:30:00', '09:30:00', 'Hội trường A', 'Ban giám thị', DATE_ADD(NOW(), INTERVAL 15 DAY), 'Thi giữa kỳ - mang theo CMND'),
(1, 'Mạng máy tính', 'exam', NULL, '13:00:00', '15:00:00', 'Phòng máy B1', 'Ban giám thị', DATE_ADD(NOW(), INTERVAL 20 DAY), 'Thi trên máy tính');

-- =====================================================
-- 8. FINANCE_TRANSACTIONS - Giao dịch tài chính
-- =====================================================
INSERT INTO finance_transactions (user_id, amount, type, category, description, transaction_date) VALUES
-- Giao dịch của user 1 (Hạnh)
(1, 5000000, 'income', 'Học bổng', 'Học bổng khuyến khích học tập kỳ 1', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 500000, 'income', 'Part-time', 'Làm gia sư môn Toán', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, -50000, 'expense', 'Ăn uống', 'Ăn trưa tại căng tin', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, -150000, 'expense', 'Sách vở', 'Mua tài liệu tham khảo', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, -200000, 'expense', 'Giải trí', 'Xem phim với bạn bè', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, -300000, 'expense', 'Học phí', 'Đóng tiền học thêm tiếng Anh', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, -80000, 'expense', 'Di chuyển', 'Tiền xe bus tháng này', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 1000000, 'income', 'Gia đình', 'Tiền tiêu vặt từ cha mẹ', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, -100000, 'expense', 'Khác', 'Mua quà sinh nhật bạn', DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Giao dịch của user 2 (Mai)
(2, 3000000, 'income', 'Học bổng', 'Học bổng KKHT', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, -60000, 'expense', 'Ăn uống', 'Ăn sáng quán cơm', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- 9. MONTHLY_BUDGETS - Ngân sách hàng tháng
-- =====================================================
INSERT INTO monthly_budgets (user_id, month, year, category, budget_amount, spent_amount) VALUES
-- Ngân sách tháng hiện tại của user 1
(1, MONTH(NOW()), YEAR(NOW()), 'Ăn uống', 2000000, 850000),
(1, MONTH(NOW()), YEAR(NOW()), 'Học phí', 5000000, 3000000),
(1, MONTH(NOW()), YEAR(NOW()), 'Sách vở', 500000, 150000),
(1, MONTH(NOW()), YEAR(NOW()), 'Giải trí', 1000000, 200000),
(1, MONTH(NOW()), YEAR(NOW()), 'Di chuyển', 300000, 80000),

-- Ngân sách tháng trước của user 1
(1, MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)), YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)), 'Ăn uống', 2000000, 1950000),
(1, MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)), YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)), 'Học phí', 5000000, 5000000);

-- =====================================================
-- 10. FLASHCARDS - Thẻ học từ vựng
-- =====================================================
INSERT INTO flashcards (user_id, deck_name, front, back, difficulty, last_reviewed, next_review, times_reviewed, times_correct) VALUES
-- Flashcards của user 1 - Bộ từ vựng tiếng Anh
(1, 'Từ vựng IELTS - Technology', 'innovation', 'sự đổi mới, sự cải tiến', 'medium', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 3, 2),
(1, 'Từ vựng IELTS - Technology', 'artificial intelligence', 'trí tuệ nhân tạo', 'easy', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 5, 5),
(1, 'Từ vựng IELTS - Technology', 'breakthrough', 'bước đột phá', 'hard', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), 2, 1),
(1, 'Từ vựng IELTS - Technology', 'cutting-edge', 'tiên tiến, hiện đại nhất', 'medium', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 4, 3),

-- Flashcards bộ lập trình
(1, 'Thuật ngữ lập trình', 'Algorithm', 'Giải thuật - chuỗi các bước để giải quyết vấn đề', 'easy', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 6, 6),
(1, 'Thuật ngữ lập trình', 'Recursion', 'Đệ quy - hàm tự gọi chính nó', 'hard', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 3, 1),
(1, 'Thuật ngữ lập trình', 'Big O Notation', 'Ký hiệu đánh giá độ phức tạp thuật toán', 'medium', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 4, 3);

-- =====================================================
-- 11. FRIENDSHIPS - Quan hệ bạn bè
-- =====================================================
INSERT INTO friendships (user_id, friend_id, status) VALUES
-- User 1 (Hạnh) kết bạn với user 2 (Mai) - đã chấp nhận
(1, 2, 'accepted'),
-- User 1 (Hạnh) gửi lời mời cho user 3 (Tùng) - đang chờ
(1, 3, 'pending'),
-- User 4 (Lan) gửi lời mời cho user 1 (Hạnh) - đang chờ
(4, 1, 'pending'),
-- User 2 (Mai) kết bạn với user 3 (Tùng) - đã chấp nhận
(2, 3, 'accepted');

-- =====================================================
-- 12. PROJECTS - Dự án nhóm
-- =====================================================
INSERT INTO projects (name, description, status, start_date, end_date, created_by) VALUES
('Hệ thống quản lý học tập TaskFlow', 'Xây dựng ứng dụng web giúp sinh viên quản lý học tập, lịch học, điểm số và tài chính cá nhân', 'in_progress', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 1),
('Website thương mại điện tử', 'Phát triển website bán hàng trực tuyến với đầy đủ tính năng giỏ hàng, thanh toán', 'planning', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 2),
('Ứng dụng giao đồ ăn', 'App mobile đặt đồ ăn trực tuyến cho khu vực trường học', 'completed', DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 3);

-- =====================================================
-- 13. PROJECT_MEMBERS - Thành viên dự án
-- =====================================================
INSERT INTO project_members (project_id, user_id, role) VALUES
-- Dự án 1: TaskFlow
(1, 1, 'leader'),
(1, 2, 'developer'),
(1, 3, 'developer'),

-- Dự án 2: Website TMĐT
(2, 2, 'leader'),
(2, 4, 'developer'),

-- Dự án 3: App giao đồ ăn
(3, 3, 'leader'),
(3, 1, 'developer');

-- =====================================================
-- 14. MILESTONES - Mốc tiến độ dự án
-- =====================================================
INSERT INTO milestones (project_id, title, description, due_date, status, `order`) VALUES
-- Milestones cho dự án 1 (TaskFlow)
(1, 'Hoàn thành phân tích yêu cầu', 'Thu thập và phân tích đầy đủ yêu cầu hệ thống, vẽ use case diagram', DATE_SUB(NOW(), INTERVAL 20 DAY), 'completed', 1),
(1, 'Thiết kế database và API', 'Thiết kế cấu trúc database, ERD và các API endpoints cần thiết', DATE_SUB(NOW(), INTERVAL 10 DAY), 'completed', 2),
(1, 'Phát triển Backend', 'Code backend với Node.js, Express và MySQL', DATE_ADD(NOW(), INTERVAL 5 DAY), 'in_progress', 3),
(1, 'Phát triển Frontend', 'Xây dựng giao diện người dùng với Vue.js', DATE_ADD(NOW(), INTERVAL 15 DAY), 'pending', 4),
(1, 'Testing và Deploy', 'Kiểm thử toàn bộ hệ thống và triển khai lên server', DATE_ADD(NOW(), INTERVAL 30 DAY), 'pending', 5),

-- Milestones cho dự án 2 (Website TMĐT)
(2, 'Nghiên cứu công nghệ', 'Tìm hiểu các công nghệ phù hợp cho dự án', DATE_ADD(NOW(), INTERVAL 15 DAY), 'pending', 1),
(2, 'Thiết kế UI/UX', 'Thiết kế giao diện và trải nghiệm người dùng', DATE_ADD(NOW(), INTERVAL 25 DAY), 'pending', 2);

-- =====================================================
-- 15. PROJECT_CHAT - Tin nhắn trong dự án
-- =====================================================
INSERT INTO project_chat (project_id, user_id, message, created_at) VALUES
-- Chat trong dự án 1 (TaskFlow)
(1, 1, 'Chào mọi người! Hôm nay chúng ta bắt đầu sprint mới nhé 🚀', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 2, 'Ok anh! Em đã chuẩn bị xong phần UI rồi ạ', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 50 MINUTE)),
(1, 3, 'Phần backend API authentication em đã hoàn thành, anh kiểm tra giúp em nhé', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 30 MINUTE)),
(1, 1, 'Tốt lắm! Chiều nay mình họp review code nha 👍', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 2, 'Em có thắc mắc về phần state management, anh có thể giải thích thêm được không ạ?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, 1, 'Được, chiều nay mình discuss kỹ hơn về Pinia và Vuex nhé', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 3, 'Em push code lên branch feature/auth rồi ạ, mọi người review giúp em', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

-- Chat trong dự án 2 (Website TMĐT)
(2, 2, 'Các bạn đã nghiên cứu về payment gateway nào chưa?', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 4, 'Em đang tìm hiểu VNPay và MoMo ạ', DATE_SUB(NOW(), INTERVAL 2 HOUR + INTERVAL 30 MINUTE));

-- =====================================================
-- THÔNG TIN ĐĂNG NHẬP TEST
-- =====================================================
-- Email: hanh@gmail.com | Password: 123456 (User chính - có đầy đủ dữ liệu)
-- Email: mai@gmail.com  | Password: 123456  
-- Email: tung@gmail.com | Password: 123456
-- Email: lan@gmail.com  | Password: 123456

-- =====================================================
-- KẾT THÚC FILE DỮ LIỆU TEST
-- =====================================================
