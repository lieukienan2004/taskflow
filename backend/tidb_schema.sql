USE taskflow;

-- Tạo bảng users trước
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  avatar VARCHAR(500) NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo admin account
INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@taskflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin');

-- Tạo bảng tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'done', 'overdue') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'Chung',
  due_date DATETIME NULL,
  user_id INT NULL,
  project_id INT NULL,
  start_time DATETIME NULL DEFAULT NULL,
  end_time DATETIME NULL DEFAULT NULL,
  postpone_count INT DEFAULT 0,
  recurrence VARCHAR(20) DEFAULT 'none',
  milestone_id INT NULL DEFAULT NULL,
  subject_id INT NULL DEFAULT NULL,
  assigned_to INT NULL DEFAULT NULL,
  eisenhower_quadrant ENUM('q1', 'q2', 'q3', 'q4') DEFAULT 'q2',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo bảng projects
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  color VARCHAR(20) DEFAULT '#D4AF37',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'active',
  subject_id INT NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- task_comments
CREATE TABLE IF NOT EXISTS task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- task_activities
CREATE TABLE IF NOT EXISTS task_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_value VARCHAR(255) NULL,
  new_value VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- task_attachments
CREATE TABLE IF NOT EXISTS task_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  filesize INT DEFAULT 0,
  filetype VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- task_dependencies
CREATE TABLE IF NOT EXISTS task_dependencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  depends_on_task_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_dependency (task_id, depends_on_task_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- project_milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
  due_date DATETIME NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- grades
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  credits INT NOT NULL,
  grade_attendance DECIMAL(4,2) NULL DEFAULT NULL,
  grade_midterm DECIMAL(4,2) NULL DEFAULT NULL,
  grade_final DECIMAL(4,2) NULL DEFAULT NULL,
  weight_attendance INT DEFAULT 10,
  weight_midterm INT DEFAULT 30,
  weight_final INT DEFAULT 60,
  target_gpa VARCHAR(2) DEFAULT 'A',
  exam_date DATETIME NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- class_schedules
CREATE TABLE IF NOT EXISTS class_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- project_members
CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'member') DEFAULT 'member',
  status ENUM('pending', 'accepted') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_member (project_id, user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- friendships
CREATE TABLE IF NOT EXISTS friendships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  status ENUM('pending', 'accepted') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_friendship (user_id, friend_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- project_chats
CREATE TABLE IF NOT EXISTS project_chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- flashcard_decks
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  color VARCHAR(50) DEFAULT '#D4AF37',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deck_id INT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor DECIMAL(5, 2) DEFAULT 2.50,
  repetitions INT DEFAULT 0,
  interval_days INT DEFAULT 0,
  next_review DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- notes
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NULL,
  color VARCHAR(20) DEFAULT '#7c3aed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- gamification
CREATE TABLE IF NOT EXISTS gamification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  last_completed_date DATE NULL,
  achievements JSON DEFAULT ('[]'),
  converted_notes_count INT DEFAULT 0,
  gold INT DEFAULT 50,
  class_type VARCHAR(20) DEFAULT NULL,
  purchased_titles JSON DEFAULT ('[]'),
  active_title VARCHAR(100) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- semester_plans
CREATE TABLE IF NOT EXISTS semester_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  academic_year VARCHAR(20) DEFAULT NULL,
  semester VARCHAR(20) DEFAULT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('active','completed','draft') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- objectives
CREATE TABLE IF NOT EXISTS objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  target_gpa DECIMAL(3,2) NULL,
  priority ENUM('low','medium','high') DEFAULT 'medium',
  status ENUM('pending','in_progress','achieved','cancelled') DEFAULT 'pending',
  sort_order INT DEFAULT 0,
  subject_id INT NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- key_results
CREATE TABLE IF NOT EXISTS key_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  objective_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL DEFAULT 100,
  current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT '%',
  status ENUM('pending','in_progress','achieved','cancelled') DEFAULT 'pending',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- objective_tasks
CREATE TABLE IF NOT EXISTS objective_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  objective_id INT NOT NULL,
  task_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_obj_task (objective_id, task_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- subjects
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- habits
CREATE TABLE IF NOT EXISTS habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  icon VARCHAR(20) DEFAULT '📚',
  goal ENUM('daily','weekly','custom') DEFAULT 'daily',
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  habit_id INT NOT NULL,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_habit_date (habit_id, completed_date)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- time_logs
CREATE TABLE IF NOT EXISTS time_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  duration_minutes INT DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- task_templates (nếu có)
CREATE TABLE IF NOT EXISTS task_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'Chung',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
