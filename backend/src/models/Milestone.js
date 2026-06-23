const pool = require('../config/database');

class Milestone {
  static async getByProject(projectId) {
    const query = `
      SELECT m.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.milestone_id = m.id AND t.deleted_at IS NULL) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.milestone_id = m.id AND t.status = 'done' AND t.deleted_at IS NULL) as task_done
      FROM project_milestones m
      WHERE m.project_id = ?
      ORDER BY m.sort_order ASC, m.created_at ASC
    `;
    const [rows] = await pool.execute(query, [projectId]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM project_milestones WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(projectId, data) {
    const { name, description, status, due_date, sort_order } = data;
    const parsedDueDate = due_date ? new Date(due_date) : null;
    const [result] = await pool.execute(
      `INSERT INTO project_milestones (project_id, name, description, status, due_date, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        name,
        description || null,
        status || 'pending',
        parsedDueDate,
        sort_order || 0
      ]
    );
    return this.getById(result.insertId);
  }

  static async update(id, projectId, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'description', 'status', 'due_date', 'sort_order'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        let val = data[field];
        if (field === 'due_date' && val) {
          val = new Date(val);
        }
        fields.push(`${field} = ?`);
        params.push(val);
      }
    }
    
    if (fields.length === 0) return null;
    params.push(id, projectId);
    
    await pool.execute(
      `UPDATE project_milestones SET ${fields.join(', ')} WHERE id = ? AND project_id = ?`,
      params
    );
    return this.getById(id);
  }

  static async delete(id, projectId) {
    const [result] = await pool.execute(
      'DELETE FROM project_milestones WHERE id = ? AND project_id = ?',
      [id, projectId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Milestone;
