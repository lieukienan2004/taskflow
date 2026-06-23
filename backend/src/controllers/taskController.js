const Task = require('../models/Task');

const getAllTasks = async (req, res) => {
  try {
    await Task.updateOverdue(req.user.id);
    const filters = {
      status: req.query.status || null,
      priority: req.query.priority || null,
      category: req.query.category || null,
      search: req.query.search || null,
      view: req.query.view || null,
      page: req.query.page || null,
      limit: req.query.limit || null,
    };
    const result = await Task.getAll(req.user.id, filters);
    res.json({ success: true, data: result.tasks, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.getById(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    
    const pool = require('../config/database');
    const [[{ subtask_count }]] = await pool.execute('SELECT COUNT(*) as subtask_count FROM subtasks WHERE task_id = ?', [task.id]);
    const [[{ subtask_done }]] = await pool.execute('SELECT COUNT(*) as subtask_done FROM subtasks WHERE task_id = ? AND is_completed = 1', [task.id]);
    const [[{ comment_count }]] = await pool.execute('SELECT COUNT(*) as comment_count FROM task_comments WHERE task_id = ?', [task.id]);
    const [[{ attachment_count }]] = await pool.execute('SELECT COUNT(*) as attachment_count FROM task_attachments WHERE task_id = ?', [task.id]);
    
    task.subtask_count = subtask_count;
    task.subtask_done = subtask_done;
    task.comment_count = comment_count;
    task.attachment_count = attachment_count;

    res.json({ success: true, data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
    }
    const task = await Task.create(req.user.id, req.body);
    
    // Log activity
    try {
      const pool = require('../config/database');
      await pool.execute(
        'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
        [task.id, req.user.id, 'created', task.title]
      );
    } catch (e) {
      console.error('Error logging task creation:', e);
    }

    res.status(201).json({ success: true, data: task, message: 'Tạo công việc thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.getById(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });

    // Check if due_date is postponed
    if (req.body.due_date !== undefined) {
      const oldDue = task.due_date ? new Date(task.due_date).getTime() : null;
      const newDue = req.body.due_date ? new Date(req.body.due_date).getTime() : null;
      if (newDue && oldDue && newDue > oldDue) {
        req.body.postpone_count = (task.postpone_count || 0) + 1;
      }

      // Auto-revert status to 'todo' if new due_date is in the future and current/requested status is 'overdue'
      const now = Date.now();
      const currentStatus = req.body.status !== undefined ? req.body.status : task.status;
      if (newDue && newDue > now && currentStatus === 'overdue') {
        req.body.status = 'todo';
      }
    }

    const pool = require('../config/database');

    // Log status change
    if (req.body.status && req.body.status !== task.status) {
      try {
        await pool.execute(
          'INSERT INTO task_activities (task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
          [task.id, req.user.id, 'status_changed', task.status, req.body.status]
        );
      } catch (e) {
        console.error('Error logging status change:', e);
      }
    }

    // Log priority change
    if (req.body.priority && req.body.priority !== task.priority) {
      try {
        await pool.execute(
          'INSERT INTO task_activities (task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
          [task.id, req.user.id, 'priority_changed', task.priority, req.body.priority]
        );
      } catch (e) {
        console.error('Error logging priority change:', e);
      }
    }

    const updated = await Task.update(req.params.id, req.user.id, req.body);

    // Xử lý nhân bản công việc lặp lại khi chuyển trạng thái thành 'done'
    if (req.body.status === 'done' && task.status !== 'done' && task.recurrence && task.recurrence !== 'none') {
      try {
        const getNextDueDate = (currentDueDate, recurrence) => {
          const d = currentDueDate ? new Date(currentDueDate) : new Date();
          if (recurrence === 'daily') {
            d.setDate(d.getDate() + 1);
          } else if (recurrence === 'weekly') {
            d.setDate(d.getDate() + 7);
          } else if (recurrence === 'monthly') {
            d.setMonth(d.getMonth() + 1);
          } else if (recurrence === 'yearly') {
            d.setFullYear(d.getFullYear() + 1);
          } else {
            return null;
          }
          return d;
        };

        const nextDue = getNextDueDate(task.due_date, task.recurrence);

        // Tạo công việc mới cho chu kỳ tiếp theo
        const clonedTask = await Task.create(req.user.id, {
          title: task.title,
          description: task.description,
          status: 'todo',
          priority: task.priority,
          category: task.category,
          due_date: nextDue ? nextDue.toISOString().slice(0, 19).replace('T', ' ') : null,
          project_id: task.project_id,
          recurrence: task.recurrence
        });

        // Sao chép toàn bộ subtask ở trạng thái chưa hoàn thành
        const [subtasks] = await pool.execute('SELECT * FROM subtasks WHERE task_id = ?', [task.id]);
        for (const sub of subtasks) {
          await pool.execute(
            'INSERT INTO subtasks (task_id, title, is_completed, sort_order) VALUES (?, ?, 0, ?)',
            [clonedTask.id, sub.title, sub.sort_order]
          );
        }

        // Tắt lặp lại trên công việc cũ để tránh lặp đúp lần sau
        await Task.update(task.id, req.user.id, { recurrence: 'none' });
      } catch (err) {
        console.error('Error handling task recurrence:', err);
      }
    }

    res.json({ success: true, data: updated, message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    res.json({ success: true, message: 'Xóa công việc thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Task.getCategories(req.user.id);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getDependenciesAll = async (req, res) => {
  try {
    const pool = require('../config/database');
    const [rows] = await pool.execute(`
      SELECT td.id, td.task_id, td.depends_on_task_id, 
             t.title as task_title, t.status as task_status,
             dep.title as depends_on_title, dep.status as depends_on_status
      FROM task_dependencies td
      JOIN tasks t ON td.task_id = t.id
      JOIN tasks dep ON td.depends_on_task_id = dep.id
      WHERE t.user_id = ? AND t.deleted_at IS NULL AND dep.deleted_at IS NULL
    `, [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const addDependency = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { dependsOnTaskId } = req.body;
    const userId = req.user.id;
    const pool = require('../config/database');

    if (!dependsOnTaskId) {
      return res.status(400).json({ success: false, message: 'Thiếu dependsOnTaskId' });
    }

    if (taskId === parseInt(dependsOnTaskId)) {
      return res.status(400).json({ success: false, message: 'Một công việc không thể phụ thuộc vào chính nó' });
    }

    // Verify tasks exist and belong to user
    const task = await Task.getById(taskId, userId);
    const depTask = await Task.getById(dependsOnTaskId, userId);
    if (!task || !depTask) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy các công việc tương ứng' });
    }

    // Check for circular dependency
    const hasPath = async (start, end) => {
      const visited = new Set();
      const queue = [start];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === end) return true;
        if (visited.has(current)) continue;
        visited.add(current);

        const [rows] = await pool.execute(
          'SELECT depends_on_task_id FROM task_dependencies WHERE task_id = ?',
          [current]
        );
        for (const row of rows) {
          queue.push(row.depends_on_task_id);
        }
      }
      return false;
    };

    const circular = await hasPath(dependsOnTaskId, taskId);
    if (circular) {
      return res.status(400).json({ success: false, message: 'Lỗi phát hiện liên kết vòng (Circular dependency)!' });
    }

    // Check if already exists
    const [existing] = await pool.execute(
      'SELECT * FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?',
      [taskId, dependsOnTaskId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Liên kết phụ thuộc này đã tồn tại' });
    }

    await pool.execute(
      'INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)',
      [taskId, dependsOnTaskId]
    );

    // Log activity
    try {
      await pool.execute(
        'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
        [taskId, userId, 'created', `Thêm phụ thuộc vào công việc: ${depTask.title}`]
      );
    } catch (e) {
      console.error(e);
    }

    res.status(201).json({ success: true, message: 'Thêm liên kết phụ thuộc thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteDependency = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const dependsOnTaskId = parseInt(req.params.depId);
    const userId = req.user.id;
    const pool = require('../config/database');

    // Verify task ownership
    const task = await Task.getById(taskId, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    const [result] = await pool.execute(
      'DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?',
      [taskId, dependsOnTaskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy liên kết phụ thuộc' });
    }

    res.json({ success: true, message: 'Xóa liên kết phụ thuộc thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  getCategories,
  getDependenciesAll,
  addDependency,
  deleteDependency
};
