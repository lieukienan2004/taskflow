const Note = require('../models/Note');

const getNotes = async (req, res) => {
  try {
    const notes = await Note.getAll(req.user.id);
    res.json({ success: true, data: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const getNote = async (req, res) => {
  try {
    const note = await Note.getById(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú.' });
    res.json({ success: true, data: note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, color } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống.' });
    }
    const note = await Note.create(req.user.id, { title: title.trim(), content: content || '', color: color || '#7c3aed' });
    res.status(201).json({ success: true, data: note, message: 'Tạo ghi chú thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.update(req.params.id, req.user.id, req.body);
    if (!note) return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú.' });
    res.json({ success: true, data: note, message: 'Cập nhật ghi chú thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const deleted = await Note.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú.' });
    res.json({ success: true, message: 'Xóa ghi chú thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
