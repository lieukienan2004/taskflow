-- Xóa và tạo lại với encoding đúng
DROP DATABASE IF EXISTS taskflow;
CREATE DATABASE taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskflow;

-- Tạo bảng tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'done', 'overdue') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'Chung',
  due_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Du lieu mau
INSERT INTO tasks (title, description, status, priority, category, due_date) VALUES
('Hoan thien bao cao thang 4', 'Tong hop so lieu va viet bao cao thang 4 cho phong ke toan', 'in_progress', 'high', 'Cong viec', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Hop nhom du an', 'Chuan bi slide va agenda cho buoi hop nhom tuan nay', 'todo', 'high', 'Cong viec', DATE_ADD(NOW(), INTERVAL 2 DAY)),
('On tap tieng Anh', 'Hoc 20 tu vung moi va luyen nghe 30 phut', 'todo', 'medium', 'Hoc tap', DATE_ADD(NOW(), INTERVAL 3 DAY)),
('Tap gym buoi chieu', 'Lich tap: nguc, tay, vai theo routine moi', 'done', 'low', 'Suc khoe', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Doc sach Clean Code', 'Doc chuong 5 va 6, ghi chu cac diem quan trong', 'in_progress', 'medium', 'Hoc tap', DATE_ADD(NOW(), INTERVAL 5 DAY)),
('Thanh toan hoa don dien', 'Kiem tra va thanh toan hoa don thang nay truoc han', 'todo', 'high', 'Ca nhan', DATE_ADD(NOW(), INTERVAL 18 HOUR)),
('Review code pull request', 'Review PR #42 cua thanh vien nhom va de lai comments', 'todo', 'high', 'Cong viec', DATE_ADD(NOW(), INTERVAL 4 HOUR)),
('Mua sam cuoi tuan', 'Lap danh sach do can mua: thuc pham, do dung gia dinh', 'done', 'low', 'Ca nhan', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Cap nhat CV', 'Cap nhat kinh nghiem va ky nang moi vao ho so xin viec', 'overdue', 'medium', 'Ca nhan', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Nghien cuu Vue 3 Composition API', 'Tim hieu sau ve Composition API, Pinia va cac best practices', 'in_progress', 'high', 'Hoc tap', DATE_ADD(NOW(), INTERVAL 7 DAY));
