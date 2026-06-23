const Habit = require('../models/Habit');

exports.getAll = async (req, res) => {
  try {
    const habits = await Habit.getAll(req.userId);
    res.json({ success: true, data: habits });
  } catch (err) {
    console.error('Get habits error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const habit = await Habit.getById(req.params.id, req.userId);
    if (!habit) return res.status(404).json({ success: false, message: 'Không tìm thấy thói quen' });
    res.json({ success: true, data: habit });
  } catch (err) {
    console.error('Get habit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên thói quen không được để trống' });
    const habit = await Habit.create(req.userId, req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    console.error('Create habit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const habit = await Habit.update(req.params.id, req.userId, req.body);
    if (!habit) return res.status(404).json({ success: false, message: 'Không tìm thấy thói quen' });
    res.json({ success: true, data: habit });
  } catch (err) {
    console.error('Update habit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Habit.delete(req.params.id, req.userId);
    res.json({ success: true, message: 'Đã xóa thói quen' });
  } catch (err) {
    console.error('Delete habit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.toggleDay = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ success: false, message: 'Thiếu ngày' });
    const habit = await Habit.toggleDay(req.params.id, req.userId, date);
    if (!habit) return res.status(404).json({ success: false, message: 'Không tìm thấy thói quen' });
    res.json({ success: true, data: habit });
  } catch (err) {
    console.error('Toggle day error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Habit.getStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Get habit stats error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
