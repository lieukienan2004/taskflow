const pool = require('../config/database');

class ClassSchedule {
  static async getAll(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM class_schedules WHERE user_id = ? ORDER BY day_of_week ASC, start_time ASC',
      [userId]
    );
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM class_schedules WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(userId, { subject_name, day_of_week, start_time, end_time, room = null }) {
    const [result] = await pool.execute(
      'INSERT INTO class_schedules (user_id, subject_name, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, subject_name, day_of_week, start_time, end_time, room]
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, { subject_name, day_of_week, start_time, end_time, room = null }) {
    await pool.execute(
      'UPDATE class_schedules SET subject_name = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ? WHERE id = ? AND user_id = ?',
      [subject_name, day_of_week, start_time, end_time, room, id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM class_schedules WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ClassSchedule;
