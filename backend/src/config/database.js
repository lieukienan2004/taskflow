const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskflow',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Helper: create table with FK fallback for PlanetScale/Vitess
async function safeCreateTable(pool, sql, label) {
  try {
    await pool.execute(sql);
  } catch (e) {
    if (e.message.includes('Foreign key') || e.message.includes('foreign key') || e.message.includes('referenced')) {
      console.warn(`[Migration] ${label}: FK not supported, creating without FK...`);
      const noFK = sql
        .replace(/,\s*FOREIGN KEY[^,)]*\)\s*REFERENCES[^)]*\)(?:\s*ON DELETE[^)]*)?/gi, '')
        .replace(/FOREIGN KEY[^,)]*\)\s*REFERENCES[^)]*\)(?:\s*ON DELETE[^)]*)?/gi, '');
      try {
        await pool.execute(noFK);
      } catch (e2) {
        if (!e2.message.includes('already exists')) console.warn(`[Migration] ${label}:`, e2.message);
      }
    } else if (!e.message.includes('already exists')) {
      console.warn(`[Migration] ${label}:`, e.message);
    }
  }
}

// Auto-migration: add avatar column, postpone_count, and task_dependencies table
(async () => {
  try {
    try {
      await pool.execute(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) NULL DEFAULT NULL`
      );
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] avatar column:', e.message);
      }
    }

    try {
      await pool.execute(
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS postpone_count INT DEFAULT 0`
      );
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] postpone_count column:', e.message);
      }
    }

    // Thêm các cột cho tính năng Timeboxing và Projects
    try {
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INT NULL DEFAULT NULL`);
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time DATETIME NULL DEFAULT NULL`);
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time DATETIME NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] tasks columns:', e.message);
      }
    }

    // Tạo bảng projects
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        color VARCHAR(20) DEFAULT '#D4AF37',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'projects');

    // Thêm khóa ngoại project_id cho tasks nếu chưa có
    try {
      const [fkRows] = await pool.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'project_id' AND TABLE_SCHEMA = 'taskflow'
      `);
      if (fkRows.length === 0) {
        await pool.execute(`
          ALTER TABLE tasks 
          ADD CONSTRAINT fk_task_project 
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
        `);
      }
    } catch (e) {
      console.warn('[Migration] fk_task_project:', e.message);
    }

    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        depends_on_task_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE KEY unique_dependency (task_id, depends_on_task_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'task_dependencies');
    
    // Tạo bảng project_milestones
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS project_milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
        due_date DATETIME NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'project_milestones');

    try {
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20) DEFAULT 'none'`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] recurrence column:', e.message);
      }
    }

    try {
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id INT NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] milestone_id column:', e.message);
      }
    }

    try {
      const [fkMilestoneRows] = await pool.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'milestone_id' AND TABLE_SCHEMA = 'taskflow'
      `);
      if (fkMilestoneRows.length === 0) {
        await pool.execute(`
          ALTER TABLE tasks 
          ADD CONSTRAINT fk_task_milestone 
          FOREIGN KEY (milestone_id) REFERENCES project_milestones(id) ON DELETE SET NULL
        `);
      }
    } catch (e) {
      console.warn('[Migration] fk_task_milestone:', e.message);
    }

    // Tạo bảng grades (Quản lý điểm và GPA)
    await safeCreateTable(pool, `
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'grades');

    // Thêm cột exam_date vào grades
    try {
      await pool.execute(`ALTER TABLE grades ADD COLUMN IF NOT EXISTS exam_date DATETIME NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] grades exam_date column:', e.message);
      }
    }

    // Thêm cột subject_id vào tasks
    try {
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subject_id INT NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] tasks subject_id column:', e.message);
      }
    }

    // Thêm khóa ngoại subject_id liên kết tasks(subject_id) -> grades(id)
    try {
      const [fkSubjectRows] = await pool.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'subject_id' AND TABLE_SCHEMA = 'taskflow'
      `);
      if (fkSubjectRows.length === 0) {
        await pool.execute(`
          ALTER TABLE tasks 
          ADD CONSTRAINT fk_task_subject 
          FOREIGN KEY (subject_id) REFERENCES grades(id) ON DELETE SET NULL
        `);
      }
    } catch (e) {
      console.warn('[Migration] fk_task_subject:', e.message);
    }

    // Tạo bảng class_schedules (Thời khóa biểu học tập)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS class_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        day_of_week INT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'class_schedules');

    // 1. Sửa lỗi thiếu cột deleted_at và status trong projects
    try {
      await pool.execute(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] projects deleted_at column:', e.message);
      }
    }
    try {
      await pool.execute(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] projects status column:', e.message);
      }
    }

    // 2. Tạo bảng project_members
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS project_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('owner', 'member') DEFAULT 'member',
        status ENUM('pending', 'accepted') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_member (project_id, user_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'project_members');

    // 3. Thêm cột assigned_to vào tasks
    try {
      await pool.execute(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to INT NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] tasks assigned_to column:', e.message);
      }
    }

    // 4. Thêm khóa ngoại cho assigned_to
    try {
      const [fkAssignedRows] = await pool.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'assigned_to' AND TABLE_SCHEMA = 'taskflow'
      `);
      if (fkAssignedRows.length === 0) {
        await pool.execute(`
          ALTER TABLE tasks 
          ADD CONSTRAINT fk_task_assigned 
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        `);
      }
    } catch (e) {
      console.warn('[Migration] fk_task_assigned:', e.message);
    }

    // 5. Tạo bảng friendships
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS friendships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status ENUM('pending', 'accepted') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_friendship (user_id, friend_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'friendships');

    // 6. Tạo bảng project_chats
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS project_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'project_chats');

    // 7. Thêm cột eisenhower_quadrant cho bảng tasks (Ma trận Eisenhower)
    try {
      await pool.execute(
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS eisenhower_quadrant ENUM('q1', 'q2', 'q3', 'q4') DEFAULT 'q2'`
      );
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] tasks eisenhower_quadrant column:', e.message);
      }
    }

    // 10. Tạo bảng flashcard_decks (Bộ thẻ ghi nhớ)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS flashcard_decks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        color VARCHAR(50) DEFAULT '#D4AF37',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'flashcard_decks');

    // 11. Tạo bảng flashcards (Thẻ ghi nhớ với các thông số thuật toán SM-2)
    await safeCreateTable(pool, `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'flashcards');

    // 12. Tao bang notes
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NULL,
        color VARCHAR(20) DEFAULT '#7c3aed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'notes');

    // Them cot subject_id vao projects
    try {
      await pool.execute(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS subject_id INT NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.warn('[Migration] projects subject_id column:', e.message);
      }
    }
    try {
      const [fkSubjectRows] = await pool.execute(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'subject_id' AND TABLE_SCHEMA = 'taskflow'
      `);
      if (fkSubjectRows.length === 0) {
        await pool.execute(`
          ALTER TABLE projects
          ADD CONSTRAINT fk_project_subject
          FOREIGN KEY (subject_id) REFERENCES grades(id) ON DELETE SET NULL
        `);
      }
    } catch (e) {
      console.warn('[Migration] fk_project_subject:', e.message);
    }

    // 13. Tao bang gamification
    await safeCreateTable(pool, `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'gamification');

    // 14. Tao bang semester_plans (Ke hoach hoc ky)
    await safeCreateTable(pool, `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'semester_plans');

    // 15. Tao bang objectives (Muc tieu OKR)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS objectives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        target_gpa DECIMAL(3,2) NULL,
        priority ENUM('low','medium','high') DEFAULT 'medium',
        status ENUM('pending','in_progress','achieved','cancelled') DEFAULT 'pending',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES semester_plans(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'objectives');

    // 16. Tao bang key_results
    await safeCreateTable(pool, `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'key_results');

    // 17b. Them subject_id vao bang objectives
    try {
      await pool.execute(`ALTER TABLE objectives ADD COLUMN subject_id INT NULL DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.warn('[Migration] objectives.subject_id:', e.message);
    }

    // 17. Tao bang objective_tasks (lien ket OKR voi task)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS objective_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        objective_id INT NOT NULL,
        task_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE KEY unique_obj_task (objective_id, task_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'objective_tasks');

    // 18. Tao bang subjects (quan ly mon hoc rieng, khong phu thuoc vao grades)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'subjects');

    // 19. Them cot name vao subjects (neu chay migration cu chua co)
    try {
      await pool.execute(`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL AFTER user_id`);
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.warn('[Migration] subjects.name:', e.message);
    }

    // 20. Xoa cot subject_name neu co (da thay bang name)
    try {
      const [colCheck] = await pool.execute(`SHOW COLUMNS FROM subjects LIKE 'subject_name'`);
      if (colCheck.length > 0) {
        await pool.execute(`ALTER TABLE subjects DROP COLUMN subject_name`);
      }
    } catch (e) {
      console.warn('[Migration] subjects cleanup:', e.message);
    }

    // 21. Copy du lieu mon hoc tu grades sang subjects (1 lan)
    try {
      const [existingSubjects] = await pool.execute('SELECT COUNT(*) as cnt FROM subjects');
      if (existingSubjects[0].cnt === 0) {
        await pool.execute(`
          INSERT IGNORE INTO subjects (user_id, name)
          SELECT DISTINCT user_id, subject_name FROM grades WHERE subject_name IS NOT NULL
        `);
        console.log('[Migration] Copied subjects from grades.');
      }
    } catch (e) {
      console.warn('[Migration] Copy subjects:', e.message);
    }

    // 22. Chuyen FK cua tasks.subject_id va projects.subject_id tu grades sang subjects
    try {
      // Drop old FK if still pointing to grades
      const [taskFK] = await pool.execute(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'subject_id' 
         AND REFERENCED_TABLE_NAME = 'grades'`
      );
      for (const fk of taskFK) {
        await pool.execute(`ALTER TABLE tasks DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
      }
      // Add new FK to subjects (if not exists)
      const [newTaskFK] = await pool.execute(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'subject_id' 
         AND REFERENCED_TABLE_NAME = 'subjects'`
      );
      if (newTaskFK.length === 0) {
        await pool.execute(`UPDATE tasks SET subject_id = NULL WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM subjects)`);
        await pool.execute(`ALTER TABLE tasks ADD CONSTRAINT fk_task_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL`);
      }
    } catch (e) {
      console.warn('[Migration] tasks.subject_id FK:', e.message);
    }

    try {
      const [projFK] = await pool.execute(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'subject_id' 
         AND REFERENCED_TABLE_NAME = 'grades'`
      );
      for (const fk of projFK) {
        await pool.execute(`ALTER TABLE projects DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
      }
      const [newProjFK] = await pool.execute(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'subject_id' 
         AND REFERENCED_TABLE_NAME = 'subjects'`
      );
      if (newProjFK.length === 0) {
        await pool.execute(`UPDATE projects SET subject_id = NULL WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM subjects)`);
        await pool.execute(`ALTER TABLE projects ADD CONSTRAINT fk_project_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL`);
      }
    } catch (e) {
      console.warn('[Migration] projects.subject_id FK:', e.message);
    }

    // 23. Tao bang habits (Quan ly thoi quen)
    await safeCreateTable(pool, `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'habits');

    // 24. Tao bang habit_logs (Nhat ky hoan thanh thoi quen)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS habit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        habit_id INT NOT NULL,
        completed_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        UNIQUE KEY unique_habit_date (habit_id, completed_date)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'habit_logs');

    // 25. Tao bang time_logs (Theo doi thoi gian lam viec tren task)
    await safeCreateTable(pool, `
      CREATE TABLE IF NOT EXISTS time_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NULL,
        duration_minutes INT DEFAULT 0,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `, 'time_logs');

    console.log('[Migration] Database tables and columns verified successfully.');
  } catch (e) {
    console.error('[Migration Error]', e);
  }
})();

module.exports = pool;
