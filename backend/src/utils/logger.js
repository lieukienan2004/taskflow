const pool = require('../config/database');

const logActivity = async (userId, action, details = null) => {
  try {
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId || null, action, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

module.exports = logActivity;
