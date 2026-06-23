const TimeLog = require('../models/TimeLog');

exports.getByTask = async (req, res) => {
  try {
    const logs = await TimeLog.getByTaskId(req.params.taskId, req.userId);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Get time logs error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getActive = async (req, res) => {
  try {
    const active = await TimeLog.getActive(req.userId);
    res.json({ success: true, data: active });
  } catch (err) {
    console.error('Get active timer error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.start = async (req, res) => {
  try {
    const { task_id } = req.body;
    if (!task_id) return res.status(400).json({ success: false, message: 'Thiếu task_id' });
    const log = await TimeLog.start(req.userId, task_id);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    console.error('Start timer error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.stop = async (req, res) => {
  try {
    const { notes } = req.body;
    const log = await TimeLog.stop(req.params.id, req.userId, notes);
    if (!log) return res.status(404).json({ success: false, message: 'Không tìm thấy phiên đang chạy' });
    res.json({ success: true, data: log });
  } catch (err) {
    console.error('Stop timer error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await TimeLog.getStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Get time stats error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getByTaskStats = async (req, res) => {
  try {
    const stats = await TimeLog.getByTaskStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Get task time stats error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
