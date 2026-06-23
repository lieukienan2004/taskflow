const pool = require('../config/database');

class TimeLog {
  static async getByTaskId(taskId, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM time_logs WHERE task_id = ? AND user_id = ? ORDER BY start_time DESC',
      [taskId, userId]
    );
    return rows;
  }

  static async getActive(userId) {
    const [rows] = await pool.execute(
      `SELECT tl.*, t.title as task_title 
       FROM time_logs tl 
       JOIN tasks t ON tl.task_id = t.id 
       WHERE tl.user_id = ? AND tl.end_time IS NULL 
       ORDER BY tl.start_time DESC LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  static async start(userId, taskId) {
    const active = await this.getActive(userId);
    if (active) {
      await this.stop(active.id, userId);
    }
    const [result] = await pool.execute(
      'INSERT INTO time_logs (task_id, user_id, start_time) VALUES (?, ?, NOW())',
      [taskId, userId]
    );
    return { id: result.insertId, task_id: taskId, start_time: new Date() };
  }

  static async stop(id, userId, notes) {
    const [existing] = await pool.execute(
      'SELECT * FROM time_logs WHERE id = ? AND user_id = ? AND end_time IS NULL',
      [id, userId]
    );
    if (existing.length === 0) return null;
    
    const startTime = new Date(existing[0].start_time);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    await pool.execute(
      'UPDATE time_logs SET end_time = NOW(), duration_minutes = ?, notes = ? WHERE id = ? AND user_id = ?',
      [durationMinutes, notes || null, id, userId]
    );
    return { ...existing[0], end_time: endTime, duration_minutes: durationMinutes };
  }

  static async getStats(userId) {
    const [totalResult] = await pool.execute(
      'SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes FROM time_logs WHERE user_id = ?',
      [userId]
    );
    const [todayResult] = await pool.execute(
      'SELECT COALESCE(SUM(duration_minutes), 0) as today_minutes FROM time_logs WHERE user_id = ? AND DATE(start_time) = CURDATE()',
      [userId]
    );
    const [weekResult] = await pool.execute(
      'SELECT COALESCE(SUM(duration_minutes), 0) as week_minutes FROM time_logs WHERE user_id = ? AND YEARWEEK(start_time) = YEARWEEK(NOW())',
      [userId]
    );
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total_sessions FROM time_logs WHERE user_id = ? AND end_time IS NOT NULL',
      [userId]
    );
    return {
      total_minutes: totalResult[0].total_minutes,
      today_minutes: todayResult[0].today_minutes,
      week_minutes: weekResult[0].week_minutes,
      total_sessions: countResult[0].total_sessions
    };
  }

  static async getByTaskStats(userId) {
    const [rows] = await pool.execute(
      `SELECT t.id, t.title, COALESCE(SUM(tl.duration_minutes), 0) as total_minutes, COUNT(tl.id) as sessions
       FROM tasks t 
       LEFT JOIN time_logs tl ON t.id = tl.task_id AND tl.end_time IS NOT NULL
       WHERE t.deleted_at IS NULL AND t.user_id = ?
       GROUP BY t.id, t.title
       HAVING total_minutes > 0
       ORDER BY total_minutes DESC
       LIMIT 10`,
      [userId]
    );
    return rows;
  }
}

module.exports = TimeLog;
