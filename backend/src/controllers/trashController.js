const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const getTrash = async (req, res) => {
  try {
    const userId = req.user.id;
    const [tasks] = await pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
      [userId]
    );
    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const restoreTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE tasks SET deleted_at = NULL WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc trong thùng rác' });
    }

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action) VALUES (?, ?, ?)',
      [id, userId, 'restored']
    );

    res.json({ success: true, message: 'Khôi phục công việc thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const permanentDelete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if task exists in trash
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL',
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc trong thùng rác' });
    }

    // Clean up physical attachment files first
    const [attachments] = await pool.execute(
      'SELECT filepath FROM task_attachments WHERE task_id = ?',
      [id]
    );

    for (const att of attachments) {
      const physicalPath = path.join(__dirname, '../../', att.filepath);
      if (fs.existsSync(physicalPath)) {
        fs.unlink(physicalPath, (err) => {
          if (err) console.error('Lỗi khi xóa tệp vật lý khi xóa vĩnh viễn task:', err);
        });
      }
    }

    // Delete the task (CASCADE will handle database records)
    await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL',
      [id, userId]
    );

    res.json({ success: true, message: 'Đã xóa vĩnh viễn công việc' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const emptyTrash = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all soft-deleted tasks to clean up their physical attachments
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE user_id = ? AND deleted_at IS NOT NULL',
      [userId]
    );

    if (tasks.length === 0) {
      return res.json({ success: true, message: 'Thùng rác đã trống' });
    }

    const taskIds = tasks.map(t => t.id);

    // Clean up physical attachment files
    for (const taskId of taskIds) {
      const [attachments] = await pool.execute(
        'SELECT filepath FROM task_attachments WHERE task_id = ?',
        [taskId]
      );
      for (const att of attachments) {
        const physicalPath = path.join(__dirname, '../../', att.filepath);
        if (fs.existsSync(physicalPath)) {
          fs.unlink(physicalPath, (err) => {
            if (err) console.error('Lỗi khi xóa tệp vật lý khi dọn thùng rác:', err);
          });
        }
      }
    }

    // Bulk delete tasks from DB
    const placeholders = taskIds.map(() => '?').join(',');
    await pool.execute(
      `DELETE FROM tasks WHERE id IN (${placeholders}) AND user_id = ?`,
      [...taskIds, userId]
    );

    res.json({ success: true, message: 'Đã dọn sạch thùng rác thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getTrash, restoreTask, permanentDelete, emptyTrash };
