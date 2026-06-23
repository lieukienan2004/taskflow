const pool = require('../config/database');

const getSubtasks = async (req, res) => {
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

    const [subtasks] = await pool.execute(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, id ASC',
      [taskId]
    );

    res.json({ success: true, data: subtasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề công việc con không được để trống' });
    }

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    // Get max sort_order
    const [[{ max_sort }]] = await pool.execute(
      'SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM subtasks WHERE task_id = ?',
      [taskId]
    );

    const sortOrder = max_sort + 1;

    const [result] = await pool.execute(
      'INSERT INTO subtasks (task_id, title, sort_order) VALUES (?, ?, ?)',
      [taskId, title.trim(), sortOrder]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
      [taskId, userId, 'subtask_added', title.trim()]
    );

    const [newSubtask] = await pool.execute('SELECT * FROM subtasks WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newSubtask[0], message: 'Thêm công việc con thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateSubtask = async (req, res) => {
  try {
    const { taskId, id } = req.params;
    const { title, is_completed } = req.body;
    const userId = req.user.id;

    // Verify task ownership
    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    // Fetch existing subtask to check changes
    const [subtasks] = await pool.execute(
      'SELECT * FROM subtasks WHERE id = ? AND task_id = ?',
      [id, taskId]
    );

    if (subtasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc con' });
    }

    const subtask = subtasks[0];
    const newTitle = title !== undefined ? title.trim() : subtask.title;
    const newCompleted = is_completed !== undefined ? !!is_completed : !!subtask.is_completed;

    await pool.execute(
      'UPDATE subtasks SET title = ?, is_completed = ? WHERE id = ? AND task_id = ?',
      [newTitle, newCompleted ? 1 : 0, id, taskId]
    );

    // Log activity if completed status changed
    if (newCompleted !== !!subtask.is_completed) {
      const action = newCompleted ? 'subtask_completed' : 'subtask_uncompleted';
      await pool.execute(
        'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
        [taskId, userId, action, newTitle]
      );
    }

    const [updatedSubtask] = await pool.execute('SELECT * FROM subtasks WHERE id = ?', [id]);

    res.json({ success: true, data: updatedSubtask[0], message: 'Cập nhật công việc con thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteSubtask = async (req, res) => {
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

    // Fetch subtask to get title for activity log
    const [subtasks] = await pool.execute(
      'SELECT title FROM subtasks WHERE id = ? AND task_id = ?',
      [id, taskId]
    );

    if (subtasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc con' });
    }

    const subtaskTitle = subtasks[0].title;

    await pool.execute(
      'DELETE FROM subtasks WHERE id = ? AND task_id = ?',
      [id, taskId]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO task_activities (task_id, user_id, action, old_value) VALUES (?, ?, ?, ?)',
      [taskId, userId, 'subtask_removed', subtaskTitle]
    );

    res.json({ success: true, message: 'Xóa công việc con thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getSubtasks, createSubtask, updateSubtask, deleteSubtask };
