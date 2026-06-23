const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/notifications/active', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM notifications WHERE is_active = 1 ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
