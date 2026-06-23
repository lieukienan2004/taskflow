const pool = require('../config/database');

class Task {
  static async getAll(userId, filters = {}) {
    let query = `
      SELECT t.*, 
        u2.name as assignee_name, u2.avatar as assignee_avatar, u2.email as assignee_email,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = 1) as subtask_done,
        (SELECT COUNT(*) FROM task_comments c WHERE c.task_id = t.id) as comment_count,
        (SELECT COUNT(*) FROM task_attachments a WHERE a.task_id = t.id) as attachment_count,
        (SELECT subject_name FROM grades g WHERE g.id = t.subject_id) as subject_name,
        CASE WHEN EXISTS (SELECT 1 FROM objective_tasks ot WHERE ot.task_id = t.id) THEN 1 ELSE 0 END as is_objective
      FROM tasks t 
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.deleted_at IS NULL AND (
        t.user_id = ?
        OR t.user_id IS NULL
        OR t.project_id IN (SELECT id FROM projects WHERE user_id = ?)
        OR t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ? AND status = 'accepted')
      )
    `;
    const params = [userId, userId, userId];

    if (filters.status) { query += ' AND t.status = ?'; params.push(filters.status); }
    if (filters.priority) { query += ' AND t.priority = ?'; params.push(filters.priority); }
    if (filters.category) { query += ' AND t.category = ?'; params.push(filters.category); }
    if (filters.project_id) { query += ' AND t.project_id = ?'; params.push(filters.project_id); }
    if (filters.milestone_id) { query += ' AND t.milestone_id = ?'; params.push(filters.milestone_id); }
    if (filters.subject_id) { query += ' AND t.subject_id = ?'; params.push(filters.subject_id); }
    if (filters.search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.view === 'personal') {
      query += ' AND t.project_id IS NULL AND t.id NOT IN (SELECT task_id FROM objective_tasks WHERE task_id IS NOT NULL)';
    } else if (filters.view === 'project') {
      query += ' AND t.project_id IS NOT NULL';
    } else if (filters.view === 'objective') {
      query += ' AND t.id IN (SELECT task_id FROM objective_tasks WHERE task_id IS NOT NULL)';
    }
    query += ' ORDER BY FIELD(t.priority,"high","medium","low"), t.due_date ASC, t.created_at DESC';

    // Pagination
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 50));
    const offset = (page - 1) * limit;

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]+?FROM tasks t/, 'SELECT COUNT(*) as total FROM tasks t');
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return { tasks: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getById(id, userId) {
    const query = `
      SELECT t.*, 
        u2.name as assignee_name, u2.avatar as assignee_avatar, u2.email as assignee_email,
        (SELECT subject_name FROM grades g WHERE g.id = t.subject_id) as subject_name
      FROM tasks t 
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ? AND t.deleted_at IS NULL AND (
        t.user_id = ? 
        OR t.project_id IN (SELECT id FROM projects WHERE user_id = ?)
        OR t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ? AND status = 'accepted')
      )
    `;
    const [rows] = await pool.execute(query, [id, userId, userId, userId]);
    return rows[0] || null;
  }

  static async create(userId, data) {
    const { title, description, status, priority, category, due_date, project_id, start_time, end_time, recurrence, milestone_id, subject_id, assigned_to, eisenhower_quadrant } = data;
    const parsedDueDate = due_date ? new Date(due_date) : null;
    const parsedStartTime = start_time ? new Date(start_time) : null;
    const parsedEndTime = end_time ? new Date(end_time) : null;

    const [result] = await pool.execute(
      `INSERT INTO tasks (user_id, title, description, status, priority, category, due_date, project_id, start_time, end_time, recurrence, milestone_id, subject_id, assigned_to, eisenhower_quadrant)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description || null, status || 'todo', priority || 'medium', category || 'Chung', parsedDueDate, project_id || null, parsedStartTime, parsedEndTime, recurrence || 'none', milestone_id || null, subject_id || null, assigned_to || null, eisenhower_quadrant || 'q2']
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['title', 'description', 'status', 'priority', 'category', 'due_date', 'postpone_count', 'project_id', 'start_time', 'end_time', 'recurrence', 'milestone_id', 'subject_id', 'assigned_to', 'eisenhower_quadrant'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        let val = data[field];
        if (['due_date', 'start_time', 'end_time'].includes(field) && val) {
          val = new Date(val);
        }
        fields.push(`${field} = ?`);
        params.push(val);
      }
    }
    if (fields.length === 0) return null;
    params.push(id, userId, userId, userId);
    await pool.execute(
      `UPDATE tasks 
       SET ${fields.join(', ')} 
       WHERE id = ? AND deleted_at IS NULL AND (
         user_id = ? 
         OR project_id IN (SELECT id FROM projects WHERE user_id = ?)
         OR project_id IN (SELECT project_id FROM project_members WHERE user_id = ? AND status = 'accepted')
       )`,
      params
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const query = `
      UPDATE tasks 
      SET deleted_at = NOW() 
      WHERE id = ? AND deleted_at IS NULL AND (
        user_id = ? 
        OR project_id IN (SELECT id FROM projects WHERE user_id = ?)
      )
    `;
    const [result] = await pool.execute(query, [id, userId, userId]);
    return result.affectedRows > 0;
  }

  static async updateOverdue(userId) {
    await pool.execute(
      `UPDATE tasks SET status = 'overdue'
        WHERE ((due_date < NOW() AND due_date IS NOT NULL) OR (end_time < NOW() AND end_time IS NOT NULL))
          AND status NOT IN ('done','overdue')
          AND deleted_at IS NULL AND user_id = ?`,
      [userId]
    );
  }

  static async getStats(userId) {
    const [statusStats] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM tasks WHERE deleted_at IS NULL AND user_id = ? GROUP BY status',
      [userId]
    );
    const [categoryStats] = await pool.execute(
      'SELECT category, COUNT(*) as count FROM tasks WHERE deleted_at IS NULL AND user_id = ? GROUP BY category ORDER BY count DESC',
      [userId]
    );
    const [priorityStats] = await pool.execute(
      'SELECT priority, COUNT(*) as count FROM tasks WHERE deleted_at IS NULL AND user_id = ? GROUP BY priority',
      [userId]
    );
    const [weeklyStats] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as created,
        SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as completed
       FROM tasks WHERE deleted_at IS NULL AND user_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [userId]
    );
    const [upcoming] = await pool.execute(
      `SELECT * FROM tasks WHERE deleted_at IS NULL AND user_id = ?
         AND status NOT IN ('done','overdue')
         AND due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
       ORDER BY due_date ASC`,
      [userId]
    );
    return { statusStats, categoryStats, priorityStats, weeklyStats, upcoming };
  }

  static async getCategories(userId) {
    const [taskCats] = await pool.execute(
      'SELECT DISTINCT category FROM tasks WHERE deleted_at IS NULL AND user_id = ? AND category IS NOT NULL AND category != \'\' ORDER BY category',
      [userId]
    );
    const [adminCats] = await pool.execute(
      'SELECT name FROM categories ORDER BY name'
    );
    const allCats = new Set();
    taskCats.forEach(r => { if (r.category) allCats.add(r.category); });
    adminCats.forEach(r => { if (r.name) allCats.add(r.name); });
    return [...allCats];
  }

  static async getActivityHeatmap(userId) {
    const [rows] = await pool.execute(
      `SELECT DATE(updated_at) as date, COUNT(*) as count 
       FROM tasks 
       WHERE status = 'done' AND deleted_at IS NULL AND user_id = ?
         AND updated_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
       GROUP BY DATE(updated_at)
       ORDER BY date ASC`,
      [userId]
    );
    return rows;
  }

  static async createNextRecurring(originalTask, userId) {
    if (!originalTask.recurrence || originalTask.recurrence === 'none') return null;
    
    const nextDueDate = new Date(originalTask.due_date);
    switch (originalTask.recurrence) {
      case 'daily': nextDueDate.setDate(nextDueDate.getDate() + 1); break;
      case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
      case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
      case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
    }
    
    const [result] = await pool.execute(
      `INSERT INTO tasks (user_id, title, description, status, priority, category, due_date, project_id, recurrence, milestone_id, subject_id, assigned_to, eisenhower_quadrant)
       VALUES (?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        originalTask.title,
        originalTask.description,
        originalTask.priority,
        originalTask.category,
        nextDueDate,
        originalTask.project_id,
        originalTask.recurrence,
        originalTask.milestone_id,
        originalTask.subject_id,
        originalTask.assigned_to,
        originalTask.eisenhower_quadrant
      ]
    );
    return this.getById(result.insertId, userId);
  }
}

module.exports = Task;
