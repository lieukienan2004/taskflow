const pool = require('../config/database');

class Subject {
  static async getAll(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM subjects WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM subjects WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(userId, data) {
    const { name } = data;
    if (!name) throw new Error('Tên môn học là bắt buộc');
    const [result] = await pool.execute(
      'INSERT INTO subjects (user_id, name) VALUES (?, ?)',
      [userId, name]
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, data) {
    const { name } = data;
    if (!name) return null;
    await pool.execute(
      'UPDATE subjects SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM subjects WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Subject;
