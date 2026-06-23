const Task = require('../models/Task');
const Habit = require('../models/Habit');
const pool = require('../config/database');

const getStats = async (req, res) => {
  try {
    await Task.updateOverdue(req.user.id);
    const taskStats = await Task.getStats(req.user.id);
    const habitStats = await Habit.getStats(req.user.id);
    res.json({ 
      success: true, 
      data: {
        ...taskStats,
        habits: habitStats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getHeatmap = async (req, res) => {
  try {
    const data = await Task.getActivityHeatmap(req.user.id);
    
    // Safely format date keys as YYYY-MM-DD
    const heatmap = {};
    data.forEach(row => {
      if (row.date) {
        const dateObj = new Date(row.date);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        heatmap[dateStr] = row.count;
      }
    });
    
    res.json({ success: true, data: heatmap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'weekly';
    let dateFilter, groupBy;
    if (period === 'monthly') {
      dateFilter = 'INTERVAL 30 DAY';
      groupBy = 'DATE(created_at)';
    } else if (period === 'yearly') {
      dateFilter = 'INTERVAL 365 DAY';
      groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
    } else {
      dateFilter = 'INTERVAL 7 DAY';
      groupBy = 'DATE(created_at)';
    }
    const [rows] = await pool.execute(
      `SELECT ${groupBy} as period,
        COUNT(*) as created,
        SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo
       FROM tasks
       WHERE deleted_at IS NULL AND user_id = ?
         AND created_at >= DATE_SUB(NOW(), ${dateFilter})
       GROUP BY ${groupBy}
       ORDER BY period ASC`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Trends Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getStats, getHeatmap, getTrends };
