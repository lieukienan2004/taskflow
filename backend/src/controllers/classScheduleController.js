const ClassSchedule = require('../models/ClassSchedule');
const Task = require('../models/Task');

const getNextDateForDay = (dayOfWeek) => {
  const targetDay = parseInt(dayOfWeek); // 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat, 0: Sun
  const resultDate = new Date();
  const currentJsDay = resultDate.getDay();

  let daysToAdd = targetDay - currentJsDay;
  if (daysToAdd < 0) {
    daysToAdd += 7; // Next week's class
  }
  resultDate.setDate(resultDate.getDate() + daysToAdd);
  return resultDate;
};

const getClassSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const schedules = await ClassSchedule.getAll(userId);
    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thời khóa biểu.' });
  }
};

const createClassSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      subject_name, 
      day_of_week, 
      start_time, 
      end_time, 
      room, 
      auto_prep, 
      auto_review,
      auto_prep_deadline,
      auto_review_deadline
    } = req.body;

    if (!subject_name || day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin: tên môn, thứ, giờ bắt đầu, giờ kết thúc.' });
    }

    const schedule = await ClassSchedule.create(userId, {
      subject_name,
      day_of_week: parseInt(day_of_week),
      start_time,
      end_time,
      room: room || null
    });

    // Tự động tạo các Task học tập tương ứng
    if (auto_prep || auto_review) {
      const nextClassDate = getNextDateForDay(day_of_week);

      if (auto_prep) {
        let prepDate;
        if (auto_prep_deadline) {
          prepDate = new Date(auto_prep_deadline);
        } else {
          prepDate = new Date(nextClassDate);
          prepDate.setDate(prepDate.getDate() - 1); // Trước 1 ngày
          prepDate.setHours(18, 0, 0, 0); // 18h tối
        }

        const prepDateInVN = new Date(prepDate.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const prepDayNum = prepDateInVN.getDay();
        const prepDayName = prepDayNum === 0 ? 'Chủ Nhật' : `Thứ ${prepDayNum + 1}`;
        const prepTimeStr = prepDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
        const prepDateStr = prepDateInVN.toLocaleDateString('vi-VN');

        await Task.create(userId, {
          title: `📚 Chuẩn bị bài môn ${subject_name}`,
          description: `Nhiệm vụ tự động: Chuẩn bị bài học trước buổi học môn ${subject_name} (Học lúc ${start_time.slice(0, 5)} ngày ${nextClassDate.toLocaleDateString('vi-VN')}). Hạn chót: ${prepTimeStr} ${prepDayName} ngày ${prepDateStr}.`,
          priority: 'medium',
          category: 'Học tập',
          due_date: prepDate.toISOString(),
          status: 'todo'
        });
      }

      if (auto_review) {
        let reviewDate;
        if (auto_review_deadline) {
          reviewDate = new Date(auto_review_deadline);
        } else {
          reviewDate = new Date(nextClassDate);
          reviewDate.setDate(reviewDate.getDate() + 2); // Sau 2 ngày
          reviewDate.setHours(21, 0, 0, 0); // 21h tối
        }

        const reviewDateInVN = new Date(reviewDate.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const reviewDayNum = reviewDateInVN.getDay();
        const reviewDayName = reviewDayNum === 0 ? 'Chủ Nhật' : `Thứ ${reviewDayNum + 1}`;
        const reviewTimeStr = reviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
        const reviewDateStr = reviewDateInVN.toLocaleDateString('vi-VN');

        await Task.create(userId, {
          title: `📝 Làm bài tập & Ôn tập môn ${subject_name}`,
          description: `Nhiệm vụ tự động: Làm bài tập và củng cố kiến thức của buổi học môn ${subject_name} ngày ${nextClassDate.toLocaleDateString('vi-VN')}. Hạn chót: ${reviewTimeStr} ${reviewDayName} ngày ${reviewDateStr}.`,
          priority: 'medium',
          category: 'Học tập',
          due_date: reviewDate.toISOString(),
          status: 'todo'
        });
      }
    }

    res.status(201).json({ success: true, data: schedule, message: 'Thêm lịch học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm lịch học.' });
  }
};

const updateClassSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { subject_name, day_of_week, start_time, end_time, room } = req.body;

    if (!subject_name || day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin: tên môn, thứ, giờ bắt đầu, giờ kết thúc.' });
    }

    const schedule = await ClassSchedule.update(id, userId, {
      subject_name,
      day_of_week: parseInt(day_of_week),
      start_time,
      end_time,
      room: room || null
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch học cần cập nhật.' });
    }

    res.json({ success: true, data: schedule, message: 'Cập nhật lịch học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật lịch học.' });
  }
};

const deleteClassSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Lấy thông tin lịch học trước để biết tên môn học cần dọn dẹp các nhiệm vụ tự động
    const schedule = await ClassSchedule.getById(id, userId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch học cần xóa.' });
    }

    const success = await ClassSchedule.delete(id, userId);

    if (success) {
      // Tiến hành soft delete các nhiệm vụ tự tạo tương ứng của môn học này
      const pool = require('../config/database');
      await pool.execute(
        `UPDATE tasks 
         SET deleted_at = NOW() 
         WHERE user_id = ? 
           AND deleted_at IS NULL 
           AND title IN (?, ?)`,
        [
          userId, 
          `📚 Chuẩn bị bài môn ${schedule.subject_name}`, 
          `📝 Làm bài tập & Ôn tập môn ${schedule.subject_name}`
        ]
      );
    }

    res.json({ success: true, message: 'Xóa lịch học và các nhiệm vụ liên kết thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa lịch học.' });
  }
};

module.exports = {
  getClassSchedules,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule
};
