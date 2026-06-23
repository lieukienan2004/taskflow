const pool = require('../config/database');

class Habit {
  static async getAll(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    // Load habit_logs for each habit
    for (const habit of rows) {
      const [logs] = await pool.execute(
        'SELECT completed_date FROM habit_logs WHERE habit_id = ? ORDER BY completed_date DESC',
        [habit.id]
      );
      habit.completedDates = logs.map(l => {
        const d = new Date(l.completed_date);
        return d.toISOString().split('T')[0];
      });
    }
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) return null;
    const habit = rows[0];
    const [logs] = await pool.execute(
      'SELECT completed_date FROM habit_logs WHERE habit_id = ? ORDER BY completed_date DESC',
      [habit.id]
    );
    habit.completedDates = logs.map(l => {
      const d = new Date(l.completed_date);
      return d.toISOString().split('T')[0];
    });
    return habit;
  }

  static async create(userId, data) {
    const { name, description, icon, goal } = data;
    const [result] = await pool.execute(
      'INSERT INTO habits (user_id, name, description, icon, goal) VALUES (?, ?, ?, ?, ?)',
      [userId, name, description || null, icon || '📚', goal || 'daily']
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, data) {
    const { name, description, icon, goal } = data;
    await pool.execute(
      'UPDATE habits SET name = ?, description = ?, icon = ?, goal = ? WHERE id = ? AND user_id = ?',
      [name, description || null, icon || '📚', goal || 'daily', id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    await pool.execute('DELETE FROM habit_logs WHERE habit_id = ?', [id]);
    await pool.execute('DELETE FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async toggleDay(habitId, userId, dateStr) {
    // Check if log exists
    const [existing] = await pool.execute(
      'SELECT id FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
      [habitId, dateStr]
    );
    if (existing.length > 0) {
      // Remove log
      await pool.execute(
        'DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
        [habitId, dateStr]
      );
    } else {
      // Add log
      await pool.execute(
        'INSERT IGNORE INTO habit_logs (habit_id, completed_date) VALUES (?, ?)',
        [habitId, dateStr]
      );
    }
    // Update streaks
    await this.updateStreaks(habitId, userId);
    return this.getById(habitId, userId);
  }

  static async updateStreaks(habitId, userId) {
    const [logs] = await pool.execute(
      'SELECT completed_date FROM habit_logs WHERE habit_id = ? ORDER BY completed_date DESC',
      [habitId]
    );
    const dates = logs.map(l => {
      const d = new Date(l.completed_date);
      return d.toISOString().split('T')[0];
    });
    
    let currentStreak = 0;
    let bestStreak = 0;
    
    if (dates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate current streak
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dates.includes(checkStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Calculate best streak
      const sortedDates = [...dates].sort().reverse();
      let tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }
    
    await pool.execute(
      'UPDATE habits SET current_streak = ?, best_streak = GREATEST(best_streak, ?) WHERE id = ?',
      [currentStreak, bestStreak, habitId]
    );
  }

  static async getStats(userId) {
    const [habits] = await pool.execute(
      'SELECT COUNT(*) as total FROM habits WHERE user_id = ?',
      [userId]
    );
    const today = new Date().toISOString().split('T')[0];
    const [todayLogs] = await pool.execute(
      `SELECT COUNT(DISTINCT h.id) as completed 
       FROM habits h 
       INNER JOIN habit_logs hl ON h.id = hl.habit_id 
       WHERE h.user_id = ? AND hl.completed_date = ?`,
      [userId, today]
    );
    return {
      total: habits[0].total,
      todayCompleted: todayLogs[0].completed
    };
  }
}

module.exports = Habit;
