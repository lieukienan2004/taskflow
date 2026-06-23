const pool = require('../config/database');

class Note {
  static async getAll(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(userId, data) {
    const [result] = await pool.execute(
      'INSERT INTO notes (user_id, title, content, color) VALUES (?, ?, ?, ?)',
      [userId, data.title, data.content, data.color || '#7c3aed']
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (fields.length === 0) return this.getById(id, userId);
    fields.push('updated_at = NOW()');
    values.push(id, userId);
    await pool.execute(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Note;
