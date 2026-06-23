const Subject = require('../models/Subject');

exports.getAll = async (req, res) => {
  try {
    const subjects = await Subject.getAll(req.user.id);
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const subject = await Subject.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const subject = await Subject.update(req.params.id, req.user.id, req.body);
    if (!subject) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
    res.json({ success: true, data: subject });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.delete = async (req, res) => {
  try {
    const success = await Subject.delete(req.params.id, req.user.id);
    if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
    res.json({ success: true, message: 'Đã xóa môn học' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
