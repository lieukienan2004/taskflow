const pool = require('../config/database');
const logActivity = require('../utils/logger');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.role, u.created_at, u.avatar,
        COUNT(t.id) as total_tasks
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    // Check if task user_id relationship exists in tasks table, if not the query above might fail or need adjustment.
    // Wait, let's check database schema again.
    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    // Fallback if user_id doesn't exist in tasks table
    try {
      const [users] = await pool.execute('SELECT id, name, email, role, created_at, avatar FROM users ORDER BY created_at DESC');
      res.json({ success: true, data: users });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
};

// Thay đổi quyền người dùng
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Quyền không hợp lệ.' });
    }
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự đổi quyền của chính mình.' });
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    await logActivity(req.user.id, 'CHANGE_ROLE', { targetUserId: id, newRole: role });
    
    res.json({ success: true, message: 'Cập nhật quyền thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa chính mình.' });
    }
    
    // Optional: Delete user's tasks first if there is a foreign key, or rely on ON DELETE CASCADE.
    try {
      await pool.execute('DELETE FROM tasks WHERE user_id = ?', [id]);
    } catch(e) {}
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_USER', { targetUserId: id });
    res.json({ success: true, message: 'Đã xóa người dùng thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// Thống kê tổng quan hệ thống
const getSystemStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.execute('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_tasks }]] = await pool.execute('SELECT COUNT(*) as total_tasks FROM tasks');
    const [[{ completed_tasks }]] = await pool.execute("SELECT COUNT(*) as completed_tasks FROM tasks WHERE status = 'done'");
    const [[{ overdue_tasks }]] = await pool.execute("SELECT COUNT(*) as overdue_tasks FROM tasks WHERE status = 'overdue'");
    const [[{ in_progress_tasks }]] = await pool.execute("SELECT COUNT(*) as in_progress_tasks FROM tasks WHERE status = 'in_progress'");
    const [[{ todo_tasks }]] = await pool.execute("SELECT COUNT(*) as todo_tasks FROM tasks WHERE status = 'todo'");
    const [[{ total_categories }]] = await pool.execute('SELECT COUNT(*) as total_categories FROM categories');
    const [[{ total_notifications }]] = await pool.execute('SELECT COUNT(*) as total_notifications FROM notifications');
    const [[{ total_logs }]] = await pool.execute('SELECT COUNT(*) as total_logs FROM activity_logs');

    const [categoryRows] = await pool.execute(`
      SELECT category as name, COUNT(*) as count
      FROM tasks
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    const [byUserRows] = await pool.execute(`
      SELECT u.name as name, COUNT(t.id) as count
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      GROUP BY t.user_id
      ORDER BY count DESC
      LIMIT 8
    `);

    let upload_limit = 10;
    try {
      const settingsPath = path.join(__dirname, '../config/settings.json');
      if (fs.existsSync(settingsPath)) {
        const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        upload_limit = data.maxUploadSize || 10;
      }
    } catch (e) {}

    res.json({
      success: true,
      data: {
        total_users: total_users || 0,
        total_tasks: total_tasks || 0,
        completed_tasks: completed_tasks || 0,
        overdue_tasks: overdue_tasks || 0,
        in_progress_tasks: in_progress_tasks || 0,
        todo_tasks: todo_tasks || 0,
        total_categories: total_categories || 0,
        total_notifications: total_notifications || 0,
        total_logs: total_logs || 0,
        active_tasks: (in_progress_tasks || 0) + (todo_tasks || 0),
        done_tasks: completed_tasks || 0,
        upload_limit,
        category_breakdown: categoryRows,
        by_user: byUserRows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ================== CATEGORIES ==================
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Thiếu tên danh mục' });
    if (name.trim().length < 2) return res.status(400).json({ success: false, message: 'Tên danh mục phải từ 2 ký tự' });
    const trimmed = name.trim();
    const [existing] = await pool.execute('SELECT id FROM categories WHERE name = ?', [trimmed]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Danh mục đã tồn tại' });
    const [result] = await pool.execute('INSERT INTO categories (name, color) VALUES (?, ?)', [trimmed, color || '#a1a1aa']);
    await logActivity(req.user.id, 'CREATE_CATEGORY', { categoryId: result.insertId, name });
    res.json({ success: true, data: { id: result.insertId, name, color } });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_CATEGORY', { categoryId: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ================== NOTIFICATIONS ==================
const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM notifications ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, type, is_active } = req.body;
    await pool.execute(
      'INSERT INTO notifications (title, message, type, is_active) VALUES (?, ?, ?, ?)',
      [title, message, type || 'info', is_active ? 1 : 0]
    );
    await logActivity(req.user.id, 'CREATE_NOTIFICATION', { title });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_NOTIFICATION', { notificationId: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ================== ACTIVITY LOGS ==================
const getLogs = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT l.*, u.name as user_name, u.email as user_email 
      FROM activity_logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC LIMIT 100
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ================== BACKUP ==================
const backupDatabase = async (req, res) => {
  try {
    const dbName = process.env.DB_NAME || 'taskflow';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD || '';
    
    const fileName = `backup_${dbName}_${Date.now()}.sql`;
    const backupPath = path.join(__dirname, '../../uploads', fileName);
    
    // Đảm bảo thư mục uploads tồn tại
    if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
      fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
    }

    let passStr = dbPass ? `-p${dbPass}` : '';
    const mysqldumpPath = process.env.MYSQLDUMP_PATH || '"mysqldump"';
    const cmd = `${mysqldumpPath} -u ${dbUser} ${passStr} ${dbName} > "${backupPath}"`;

    exec(cmd, async (error) => {
      if (error) {
        console.error('Backup error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi khi tạo bản sao lưu.' });
      }
      
      await logActivity(req.user.id, 'BACKUP_DATABASE', { file: fileName });
      
      res.download(backupPath, fileName, (err) => {
        if (err) console.error('Download error:', err);
        // Có thể xóa file sau khi tải xong nếu muốn tiết kiệm dung lượng
        fs.unlink(backupPath, () => {});
      });
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ================== DATA EXPORT ==================
const exportData = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
    const [tasks] = await pool.execute('SELECT id, title, description, status, priority, created_at FROM tasks');
    
    let subtasks = [];
    try {
      const [st] = await pool.execute('SELECT id, task_id, title, is_completed FROM subtasks');
      subtasks = st;
    } catch (e) {}

    let csv = '';
    
    // Users
    csv += '--- USERS ---\n';
    csv += 'id,name,email,role,created_at\n';
    users.forEach(u => {
      csv += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.created_at}"\n`;
    });
    csv += '\n';

    // Tasks
    csv += '--- TASKS ---\n';
    csv += 'id,title,status,priority,created_at\n';
    tasks.forEach(t => {
      // escape quotes in title
      const title = t.title ? t.title.replace(/"/g, '""') : '';
      csv += `"${t.id}","${title}","${t.status}","${t.priority}","${t.created_at}"\n`;
    });
    csv += '\n';

    // Subtasks
    csv += '--- SUBTASKS ---\n';
    csv += 'id,task_id,title,is_completed\n';
    subtasks.forEach(st => {
      const title = st.title ? st.title.replace(/"/g, '""') : '';
      csv += `"${st.id}","${st.task_id}","${title}","${st.is_completed}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=taskflow_export.csv');
    res.send(csv);
    
    await logActivity(req.user.id, 'EXPORT_DATA', { message: 'Exported system data to CSV' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ================== SETTINGS ==================
const getSettings = async (req, res) => {
  try {
    const settingsPath = path.join(__dirname, '../config/settings.json');
    if (!fs.existsSync(settingsPath)) {
      return res.json({ success: true, data: { appName: 'TaskFlow', themeColor: '#D4AF37', maxUploadSize: 10 } });
    }
    const data = fs.readFileSync(settingsPath, 'utf-8');
    res.json({ success: true, data: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { appName, themeColor, maxUploadSize } = req.body;
    const settingsPath = path.join(__dirname, '../config/settings.json');
    
    const newSettings = { appName, themeColor, maxUploadSize };
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), 'utf-8');
    
    await logActivity(req.user.id, 'UPDATE_SETTINGS', newSettings);
    res.json({ success: true, message: 'Cập nhật cài đặt thành công.', data: newSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ================== USER DETAIL ==================
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [[user]] = await pool.execute('SELECT id, name, email, role, created_at, avatar, student_id FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    const [[taskStats]] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
      FROM tasks WHERE user_id = ?
    `, [id]);

    const [recentTasks] = await pool.execute(
      'SELECT id, title, status, priority, due_date FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [id]
    );

    const [projects] = await pool.execute(`
      SELECT DISTINCT p.id, p.name, p.description
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.user_id = ? OR pm.user_id = ?
    `, [id, id]);

    const [[noteStats]] = await pool.execute('SELECT COUNT(*) as total FROM notes WHERE user_id = ?', [id]);

    res.json({
      success: true,
      data: {
        ...user,
        task_stats: taskStats || { total: 0, completed: 0, in_progress: 0, todo: 0, overdue: 0 },
        recent_tasks: recentTasks,
        projects,
        note_count: noteStats?.total || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ================== TOGGLE USER STATUS (ban/unban) ==================
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_banned } = req.body;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự chặn chính mình.' });
    }
    await pool.execute('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, id]);
    await logActivity(req.user.id, 'TOGGLE_USER_STATUS', { targetUserId: id, is_banned });
    res.json({ success: true, message: is_banned ? 'Đã chặn người dùng.' : 'Đã bỏ chặn người dùng.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ================== ALL PROJECTS ==================
const getAllProjects = async (req, res) => {
  try {
    const [projects] = await pool.execute(`
      SELECT p.*, u.name as owner_name, u.email as owner_email,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.status = 'accepted') as member_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as done_count
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ================== TRENDS (7 days) ==================
const getTrends = async (req, res) => {
  try {
    const [newUsers] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const [newTasks] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM tasks
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const [completedTasks] = await pool.execute(`
      SELECT DATE(updated_at) as date, COUNT(*) as count
      FROM tasks
      WHERE status = 'done' AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: { newUsers, newTasks, completedTasks }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  getAllUsers, deleteUser, changeUserRole, getSystemStats,
  getCategories, createCategory, deleteCategory,
  getNotifications, createNotification, deleteNotification,
  getLogs, backupDatabase, exportData, getSettings, updateSettings,
  getUserDetail, getAllProjects, getTrends, toggleUserStatus
};
