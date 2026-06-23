const pool = require('../config/database');

class Grade {
  static async getAll(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM grades WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM grades WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(userId, { subject_name, credits, grade_attendance = null, grade_midterm = null, grade_final = null, weight_attendance = 10, weight_midterm = 30, weight_final = 60, target_gpa = 'A', exam_date = null }) {
    const parsedExamDate = exam_date ? new Date(exam_date) : null;
    const [result] = await pool.execute(
      'INSERT INTO grades (user_id, subject_name, credits, grade_attendance, grade_midterm, grade_final, weight_attendance, weight_midterm, weight_final, target_gpa, exam_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, subject_name, credits, grade_attendance, grade_midterm, grade_final, weight_attendance, weight_midterm, weight_final, target_gpa, parsedExamDate]
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, { subject_name, credits, grade_attendance = null, grade_midterm = null, grade_final = null, weight_attendance = 10, weight_midterm = 30, weight_final = 60, target_gpa = 'A', exam_date = null }) {
    const parsedExamDate = exam_date ? new Date(exam_date) : null;
    await pool.execute(
      'UPDATE grades SET subject_name = ?, credits = ?, grade_attendance = ?, grade_midterm = ?, grade_final = ?, weight_attendance = ?, weight_midterm = ?, weight_final = ?, target_gpa = ?, exam_date = ? WHERE id = ? AND user_id = ?',
      [subject_name, credits, grade_attendance, grade_midterm, grade_final, weight_attendance, weight_midterm, weight_final, target_gpa, parsedExamDate, id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM grades WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Grade;
