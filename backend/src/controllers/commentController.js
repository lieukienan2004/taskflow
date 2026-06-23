const pool = require('../config/database');

const getTimeline = async (req, res) => {
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

    // Query comments
    const [comments] = await pool.execute(
      `SELECT tc.*, u.name as user_name, u.avatar as user_avatar 
       FROM task_comments tc 
       JOIN users u ON tc.user_id = u.id 
       WHERE tc.task_id = ?`,
      [taskId]
    );

    // Query activities
    const [activities] = await pool.execute(
      `SELECT ta.*, u.name as user_name 
       FROM task_activities ta 
       JOIN users u ON ta.user_id = u.id 
       WHERE ta.task_id = ?`,
      [taskId]
    );

    // Format comments and activities
    const formattedComments = comments.map(c => ({
      id: `comment_${c.id}`,
      db_id: c.id,
      type: 'comment',
      task_id: c.task_id,
      user_id: c.user_id,
      user_name: c.user_name,
      user_avatar: c.user_avatar,
      content: c.content,
      created_at: c.created_at
    }));

    const formattedActivities = activities.map(a => ({
      id: `activity_${a.id}`,
      db_id: a.id,
      type: 'activity',
      task_id: a.task_id,
      user_id: a.user_id,
      user_name: a.user_name,
      action: a.action,
      old_value: a.old_value,
      new_value: a.new_value,
      created_at: a.created_at
    }));

    // Merge and sort
    const timeline = [...formattedComments, ...formattedActivities].sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json({ success: true, data: timeline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
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
      'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, userId, content.trim()]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
      [taskId, userId, 'comment_added', content.trim().substring(0, 100) + (content.trim().length > 100 ? '...' : '')]
    );

    const [newComment] = await pool.execute(
      `SELECT tc.*, u.name as user_name, u.avatar as user_avatar 
       FROM task_comments tc 
       JOIN users u ON tc.user_id = u.id 
       WHERE tc.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newComment[0], message: 'Thêm bình luận thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteComment = async (req, res) => {
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

    // Check comment existence and ownership
    const [comments] = await pool.execute(
      'SELECT id FROM task_comments WHERE id = ? AND task_id = ? AND user_id = ?',
      [id, taskId, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận hoặc bạn không có quyền xóa' });
    }

    await pool.execute(
      'DELETE FROM task_comments WHERE id = ? AND task_id = ? AND user_id = ?',
      [id, taskId, userId]
    );

    res.json({ success: true, message: 'Xóa bình luận thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getTimeline, createComment, deleteComment };
