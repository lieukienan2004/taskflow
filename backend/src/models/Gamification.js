const pool = require('../config/database');

class Gamification {
  static async get(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM gamification WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      const [result] = await pool.execute(
        'INSERT INTO gamification (user_id) VALUES (?)',
        [userId]
      );
      const [newRows] = await pool.execute(
        'SELECT * FROM gamification WHERE id = ?',
        [result.insertId]
      );
      return newRows[0];
    }
    return rows[0];
  }

  static async update(userId, data) {
    const fields = [];
    const values = [];
    if (data.xp !== undefined) { fields.push('xp = ?'); values.push(data.xp); }
    if (data.level !== undefined) { fields.push('level = ?'); values.push(data.level); }
    if (data.streak !== undefined) { fields.push('streak = ?'); values.push(data.streak); }
    if (data.last_completed_date !== undefined) { fields.push('last_completed_date = ?'); values.push(data.last_completed_date); }
    if (data.achievements !== undefined) { fields.push('achievements = ?'); values.push(JSON.stringify(data.achievements)); }
    if (data.converted_notes_count !== undefined) { fields.push('converted_notes_count = ?'); values.push(data.converted_notes_count); }
    if (data.gold !== undefined) { fields.push('gold = ?'); values.push(data.gold); }
    if (data.class_type !== undefined) { fields.push('class_type = ?'); values.push(data.class_type); }
    if (data.purchased_titles !== undefined) { fields.push('purchased_titles = ?'); values.push(JSON.stringify(data.purchased_titles)); }
    if (data.active_title !== undefined) { fields.push('active_title = ?'); values.push(data.active_title); }
    if (fields.length === 0) return this.get(userId);
    values.push(userId);
    await pool.execute(
      `UPDATE gamification SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
    return this.get(userId);
  }

  static async awardXP(userId, amount, priority) {
    const profile = await this.get(userId);
    let xp = profile.xp + amount;
    let level = profile.level;
    const nextLevelXP = level * 300;
    let leveledUp = false;
    if (xp >= nextLevelXP) {
      level++;
      xp -= nextLevelXP;
      leveledUp = true;
    }
    await this.update(userId, { xp, level });
    return { xp, level, leveledUp, previousLevel: profile.level };
  }

  static async deductXP(userId, amount) {
    const profile = await this.get(userId);
    const xp = Math.max(0, profile.xp - amount);
    await this.update(userId, { xp });
    return { xp, level: profile.level };
  }

  static async updateStreak(userId) {
    const profile = await this.get(userId);
    const today = new Date().toISOString().slice(0, 10);
    let streak = 1;
    let lastDate = today;
    if (profile.last_completed_date) {
      const last = new Date(profile.last_completed_date);
      const current = new Date(today);
      const diffDays = Math.ceil(Math.abs(current - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak = profile.streak + 1;
      } else if (diffDays === 0) {
        streak = profile.streak;
        lastDate = profile.last_completed_date;
      }
    }
    await this.update(userId, { streak, last_completed_date: lastDate });
    return streak;
  }
}

module.exports = Gamification;
