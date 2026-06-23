const pool = require('../config/database');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const hours = parseInt(req.query.hours) || 24;
    await Task.updateOverdue(userId);
    const [tasks] = await pool.execute(
      `SELECT id, title, due_date, priority, category, status
       FROM tasks
       WHERE deleted_at IS NULL AND user_id = ?
         AND status NOT IN ('done')
         AND due_date IS NOT NULL
         AND due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)
       ORDER BY due_date ASC`,
      [userId, hours]
    );
    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error('[Reminder Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const sendEmailReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task_id } = req.body;
    const task = await Task.getById(task_id, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }
    const [users] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [userId]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    const user = users[0];
    const dueDateStr = task.due_date
      ? new Date(task.due_date).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })
      : 'Không có hạn';
    const priorityLabel = task.priority === 'high' ? '🔴 Cao' : task.priority === 'low' ? '🟢 Thấp' : '🟡 Trung bình';

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: `[TaskFlow] Nhắc nhở: "${task.title}"即将到期限`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#117c75;">⏰ Nhắc nhở Deadline</h2>
          <hr style="border:1px solid #e2e8f0;"/>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Bạn có một công việc sắp đến hạn:</p>
          <div style="background:#f0fdf9;border:1px solid #117c75;border-radius:8px;padding:16px;margin:12px 0;">
            <h3 style="margin:0 0 8px 0;color:#117c75;">${task.title}</h3>
            <p style="margin:4px 0;"><strong>Ưu tiên:</strong> ${priorityLabel}</p>
            <p style="margin:4px 0;"><strong>Danh mục:</strong> ${task.category}</p>
            <p style="margin:4px 0;"><strong>Hạn chót:</strong> ${dueDateStr}</p>
            <p style="margin:4px 0;"><strong>Trạng thái:</strong> ${task.status === 'overdue' ? 'Quá hạn ⚠️' : task.status === 'in_progress' ? 'Đang thực hiện 🔄' : 'Chờ làm 📋'}</p>
          </div>
          <p>Hãy hoàn thành công việc đúng hạn để duy trì năng suất!</p>
          <hr style="border:1px solid #e2e8f0;margin-top:20px;"/>
          <p style="color:#94a3b8;font-size:12px;">Email tự động từ hệ thống TaskFlow</p>
        </div>
      `
    });

    res.json({ success: true, message: `Đã gửi email nhắc nhở đến ${user.email}` });
  } catch (err) {
    console.error('[Send Reminder Email Error]', err);
    res.status(500).json({ success: false, message: 'Gửi email thất bại' });
  }
};

module.exports = { getUpcomingReminders, sendEmailReminder };
