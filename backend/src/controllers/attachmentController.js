const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const getAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    const [attachments] = await pool.execute(
      'SELECT * FROM task_attachments WHERE task_id = ? ORDER BY created_at DESC',
      [taskId]
    );

    res.json({ success: true, data: attachments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có tệp nào được tải lên hoặc tệp không hợp lệ' });
    }

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      // Clean up uploaded file if task verification fails
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    const filename = req.file.originalname;
    const filepath = '/uploads/attachments/' + req.file.filename;
    const filesize = req.file.size;
    const filetype = req.file.mimetype;

    const [result] = await pool.execute(
      `INSERT INTO task_attachments (task_id, user_id, filename, filepath, filesize, filetype) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [taskId, userId, filename, filepath, filesize, filetype]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
      [taskId, userId, 'attachment_added', filename]
    );

    const [newAttachment] = await pool.execute('SELECT * FROM task_attachments WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newAttachment[0], message: 'Tải tệp lên thành công' });
  } catch (err) {
    console.error(err);
    // Clean up uploaded file in case of database error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { taskId, id } = req.params;
    const userId = req.user.id;

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    // Get attachment info
    const [attachments] = await pool.execute(
      'SELECT * FROM task_attachments WHERE id = ? AND task_id = ?',
      [id, taskId]
    );

    if (attachments.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tệp đính kèm' });
    }

    const attachment = attachments[0];
    const physicalPath = path.join(__dirname, '../../', attachment.filepath);

    // Delete database record first
    await pool.execute(
      'DELETE FROM task_attachments WHERE id = ? AND task_id = ?',
      [id, taskId]
    );

    // Try to delete physical file
    if (fs.existsSync(physicalPath)) {
      fs.unlink(physicalPath, (err) => {
        if (err) console.error('Lỗi khi xóa tệp vật lý:', err);
      });
    }

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action, old_value) VALUES (?, ?, ?, ?)',
      [taskId, userId, 'attachment_removed', attachment.filename]
    );

    res.json({ success: true, message: 'Xóa tệp đính kèm thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { taskId, id } = req.params;
    const userId = req.user.id;

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    // Get attachment info
    const [attachments] = await pool.execute(
      'SELECT * FROM task_attachments WHERE id = ? AND task_id = ?',
      [id, taskId]
    );

    if (attachments.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tệp đính kèm' });
    }

    const attachment = attachments[0];
    const physicalPath = path.join(__dirname, '../../', attachment.filepath);

    if (!fs.existsSync(physicalPath)) {
      return res.status(404).json({ success: false, message: 'Tệp vật lý không tồn tại trên hệ thống' });
    }

    res.download(physicalPath, attachment.filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const addLinkAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { filename, filepath } = req.body;

    if (!filename || !filepath) {
      return res.status(400).json({ success: false, message: 'Thiếu tên liên kết hoặc địa chỉ liên kết' });
    }

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    const [result] = await pool.execute(
      `INSERT INTO task_attachments (task_id, user_id, filename, filepath, filesize, filetype) 
       VALUES (?, ?, ?, ?, 0, 'url')`,
      [taskId, userId, filename, filepath]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
      [taskId, userId, 'attachment_added', `Liên kết: ${filename}`]
    );

    const [newAttachment] = await pool.execute('SELECT * FROM task_attachments WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newAttachment[0], message: 'Thêm liên kết tài nguyên thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getAttachments, uploadAttachment, deleteAttachment, downloadAttachment, addLinkAttachment };
