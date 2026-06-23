const pool = require('../config/database');

class SemesterPlan {
  static async getAll(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM semester_plans WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    for (const plan of rows) {
      const [objectives] = await pool.execute(
        'SELECT * FROM objectives WHERE plan_id = ? ORDER BY sort_order ASC',
        [plan.id]
      );
      for (const obj of objectives) {
        const [keyResults] = await pool.execute(
          'SELECT * FROM key_results WHERE objective_id = ? ORDER BY sort_order ASC',
          [obj.id]
        );
        obj.key_results = keyResults;
      }
      plan.objectives = objectives;
    }
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM semester_plans WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) return null;
    const plan = rows[0];
    const [objectives] = await pool.execute(
      'SELECT * FROM objectives WHERE plan_id = ? ORDER BY sort_order ASC',
      [plan.id]
    );
    for (const obj of objectives) {
      const [keyResults] = await pool.execute(
        'SELECT * FROM key_results WHERE objective_id = ? ORDER BY sort_order ASC',
        [obj.id]
      );
      const [tasks] = await pool.execute(
        `SELECT t.id, t.title, t.status, t.priority, t.due_date
         FROM tasks t JOIN objective_tasks ot ON t.id = ot.task_id
         WHERE ot.objective_id = ? AND t.deleted_at IS NULL`,
        [obj.id]
      );
      obj.key_results = keyResults;
      obj.tasks = tasks;
    }
    plan.objectives = objectives;
    return plan;
  }

  static async create(userId, data) {
    const { name, academic_year, semester, start_date, end_date } = data;
    const [result] = await pool.execute(
      'INSERT INTO semester_plans (user_id, name, academic_year, semester, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, academic_year || null, semester || null, start_date || null, end_date || null, 'active']
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    for (const key of ['name', 'academic_year', 'semester', 'start_date', 'end_date', 'status']) {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    }
    if (fields.length === 0) return this.getById(id, userId);
    values.push(id, userId);
    await pool.execute(`UPDATE semester_plans SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute('DELETE FROM semester_plans WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }

  static async createObjective(planId, userId, data) {
    const { title, description, target_gpa, priority, subject_id } = data;
    const [result] = await pool.execute(
      'INSERT INTO objectives (plan_id, title, description, target_gpa, priority, subject_id) VALUES (?, ?, ?, ?, ?, ?)',
      [planId, title, description || null, target_gpa || null, priority || 'medium', subject_id || null]
    );
    return result.insertId;
  }

  static async updateObjective(id, userId, data) {
    const fields = [];
    const values = [];
    for (const key of ['title', 'description', 'target_gpa', 'priority', 'status', 'sort_order', 'subject_id']) {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    }
    if (fields.length === 0) return;
    values.push(id);
    await pool.execute(`UPDATE objectives SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async deleteObjective(id, userId) {
    await pool.execute('DELETE FROM objectives WHERE id = ?', [id]);
  }

  static async createKeyResult(objectiveId, userId, data) {
    const { title, target_value, unit } = data;
    const [result] = await pool.execute(
      'INSERT INTO key_results (objective_id, title, target_value, unit) VALUES (?, ?, ?, ?)',
      [objectiveId, title, target_value || 100, unit || '%']
    );
    return result.insertId;
  }

  static async updateKeyResult(id, userId, data) {
    const fields = [];
    const values = [];
    for (const key of ['title', 'target_value', 'current_value', 'unit', 'status', 'sort_order']) {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    }
    if (fields.length === 0) return;
    values.push(id);
    await pool.execute(`UPDATE key_results SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async deleteKeyResult(id, userId) {
    await pool.execute('DELETE FROM key_results WHERE id = ?', [id]);
  }

  static async linkTask(objectiveId, userId, taskId) {
    await pool.execute(
      'INSERT IGNORE INTO objective_tasks (objective_id, task_id) VALUES (?, ?)',
      [objectiveId, taskId]
    );
  }

  static async unlinkTask(objectiveId, userId, taskId) {
    await pool.execute(
      'DELETE FROM objective_tasks WHERE objective_id = ? AND task_id = ?',
      [objectiveId, taskId]
    );
  }
}

module.exports = SemesterPlan;
