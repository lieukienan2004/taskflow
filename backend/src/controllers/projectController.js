const Project = require('../models/Project');
const ProjectChat = require('../models/ProjectChat');
const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const projects = await Project.getAll(req.user.id);
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Tên dự án là bắt buộc' });
    }
    const project = await Project.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const project = await Project.update(req.params.id, req.user.id, req.body);
    if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.delete = async (req, res) => {
  try {
    const success = await Project.delete(req.params.id, req.user.id);
    if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    res.json({ success: true, message: 'Đã xóa dự án' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await Project.getMembers(req.params.id);
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email là bắt buộc' });
    }
    const invitee = await Project.addMember(req.params.id, req.user.id, email);
    res.status(201).json({ success: true, message: 'Đã gửi lời mời tham gia nhóm học tập thành công.', data: invitee });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi gửi lời mời' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const success = await Project.removeMember(req.params.id, req.user.id, req.params.userId);
    if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên hoặc bạn không có quyền' });
    res.json({ success: true, message: 'Đã xóa thành viên khỏi dự án/hủy lời mời.' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const invitations = await Project.getPendingInvitations(req.user.id);
    res.json({ success: true, data: invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const success = await Project.handleInvitation(req.params.id, req.user.id, 'accept');
    if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời hoặc đã xử lý trước đó.' });
    res.json({ success: true, message: 'Đã chấp nhận lời mời tham gia dự án.' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.declineInvitation = async (req, res) => {
  try {
    const success = await Project.handleInvitation(req.params.id, req.user.id, 'decline');
    if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời.' });
    res.json({ success: true, message: 'Đã từ chối lời mời.' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getProjectChats = async (req, res) => {
  try {
    const chats = await ProjectChat.getByProjectId(req.params.id, req.user.id);
    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Error fetching project chats:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

exports.createProjectChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
    }
    const chat = await ProjectChat.create(req.params.id, req.user.id, message);
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Error creating project chat:', error);
    res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

exports.getStudySlots = async (req, res) => {
  try {
    const projectId = req.params.id;
    const pool = require('../config/database');
    const Project = require('../models/Project');

    // 1. Fetch all members (includes owner)
    const members = await Project.getMembers(projectId);
    // Filter only accepted members (owner is accepted by default)
    const acceptedMembers = members.filter(m => m.status === 'accepted');
    const userIds = acceptedMembers.map(m => m.user_id);

    // 2. Fetch class schedules for all accepted members
    let schedules = [];
    if (userIds.length > 0) {
      const query = `SELECT * FROM class_schedules WHERE user_id IN (${userIds.map(() => '?').join(',')})`;
      const [rows] = await pool.execute(query, userIds);
      schedules = rows;
    }

    // 3. Define slot parameters
    const days = [
      { value: 1, label: 'Thứ Hai' },
      { value: 2, label: 'Thứ Ba' },
      { value: 3, label: 'Thứ Tư' },
      { value: 4, label: 'Thứ Năm' },
      { value: 5, label: 'Thứ Sáu' },
      { value: 6, label: 'Thứ Bảy' },
      { value: 0, label: 'Chủ Nhật' }
    ];

    const sessions = [
      { key: 'morning', label: 'Sáng', startStr: '07:00', endStr: '11:30', startMin: 420, endMin: 690 },
      { key: 'afternoon', label: 'Chiều', startStr: '13:00', endStr: '17:30', startMin: 780, endMin: 1050 },
      { key: 'evening', label: 'Tối', startStr: '18:00', endStr: '22:00', startMin: 1080, endMin: 1320 }
    ];

    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      return hours * 60 + minutes;
    };

    // 4. Calculate study slots
    const result = [];
    for (const day of days) {
      const daySlots = [];
      for (const session of sessions) {
        const busyMembers = [];
        const freeMembers = [];

        for (const member of acceptedMembers) {
          const memberSchedules = schedules.filter(s => s.user_id === member.user_id && s.day_of_week === day.value);
          let isMemberBusy = false;
          let busyReason = '';

          for (const sched of memberSchedules) {
            const sMin = parseTimeToMinutes(sched.start_time);
            const eMin = parseTimeToMinutes(sched.end_time);
            if (sMin < session.endMin && session.startMin < eMin) {
              isMemberBusy = true;
              busyReason = `${sched.subject_name} (${sched.start_time.slice(0, 5)} - ${sched.end_time.slice(0, 5)}${sched.room ? ', Phòng ' + sched.room : ''})`;
              break;
            }
          }

          if (isMemberBusy) {
            busyMembers.push({
              user_id: member.user_id,
              name: member.name,
              avatar: member.avatar,
              reason: busyReason
            });
          } else {
            freeMembers.push({
              user_id: member.user_id,
              name: member.name,
              avatar: member.avatar
            });
          }
        }

        daySlots.push({
          sessionKey: session.key,
          sessionLabel: session.label,
          timeRange: `${session.startStr} - ${session.endStr}`,
          isFullyFree: busyMembers.length === 0,
          busyMembers,
          freeMembers
        });
      }

      result.push({
        dayValue: day.value,
        dayLabel: day.label,
        slots: daySlots
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Đối chiếu thời khóa biểu thành công!'
    });

  } catch (error) {
    console.error('Error calculating study slots:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tính toán lịch học trống' });
  }
};

exports.getContributions = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const isMember = await ProjectChat.isMember(projectId, userId);
    if (!isMember) return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });

    const [members] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.avatar,
              pm.role, pm.status as member_status
       FROM users u
       JOIN project_members pm ON pm.user_id = u.id
       WHERE pm.project_id = ? AND pm.status = 'accepted'
       UNION
       SELECT u.id, u.name, u.email, u.avatar,
              'owner' as role, 'accepted' as member_status
       FROM users u
       JOIN projects p ON p.user_id = u.id
       WHERE p.id = ?`,
      [projectId, projectId]
    );

    const memberIds = members.map(m => m.id);
    if (memberIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const placeholders = memberIds.map(() => '?').join(',');

    const [taskStats] = await pool.execute(
      `SELECT assigned_to as user_id,
              COUNT(*) as total_tasks,
              SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
              SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
              SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_tasks,
              SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks
       FROM tasks
       WHERE project_id = ? AND assigned_to IS NOT NULL AND deleted_at IS NULL
       GROUP BY assigned_to`,
      [projectId]
    );

    const [createdStats] = await pool.execute(
      `SELECT user_id,
              COUNT(*) as created_tasks
       FROM tasks
       WHERE project_id = ? AND deleted_at IS NULL
       GROUP BY user_id`,
      [projectId]
    );

    const [chatStats] = await pool.execute(
      `SELECT user_id,
              COUNT(*) as messages_sent,
              MAX(created_at) as last_message_at
       FROM project_chats
       WHERE project_id = ?
       GROUP BY user_id`,
      [projectId]
    );

    const [chatTotal] = await pool.execute(
      `SELECT COUNT(*) as total FROM project_chats WHERE project_id = ?`,
      [projectId]
    );

    const totalMessages = chatTotal[0]?.total || 0;

    const taskMap = {};
    taskStats.forEach(r => { taskMap[r.user_id] = r; });

    const createdMap = {};
    createdStats.forEach(r => { createdMap[r.user_id] = r; });

    const chatMap = {};
    chatStats.forEach(r => { chatMap[r.user_id] = r; });

    const result = members.map(m => {
      const ts = taskMap[m.id] || {};
      const cs = createdMap[m.id] || {};
      const ch = chatMap[m.id] || {};

      const totalDone = ts.completed_tasks || 0;
      const totalAssigned = ts.total_tasks || 0;
      const completionRate = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 0;

      let score = 0;
      score += (ts.completed_tasks || 0) * 10;
      score += (ts.in_progress_tasks || 0) * 3;
      score += (cs.created_tasks || 0) * 2;
      score += (ch.messages_sent || 0) * 1;

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        avatar: m.avatar,
        role: m.role,
        stats: {
          total_tasks: ts.total_tasks || 0,
          completed_tasks: ts.completed_tasks || 0,
          in_progress_tasks: ts.in_progress_tasks || 0,
          todo_tasks: ts.todo_tasks || 0,
          overdue_tasks: ts.overdue_tasks || 0,
          created_tasks: cs.created_tasks || 0,
          messages_sent: ch.messages_sent || 0,
          last_message_at: ch.last_message_at || null,
          completion_rate: completionRate,
          contribution_score: score
        }
      };
    });

    result.sort((a, b) => b.stats.contribution_score - a.stats.contribution_score);

    const maxScore = result.length > 0 ? result[0].stats.contribution_score : 1;
    result.forEach((m, idx) => {
      m.rank = idx + 1;
      m.score_percent = maxScore > 0 ? Math.round((m.stats.contribution_score / maxScore) * 100) : 0;
    });

    res.json({
      success: true,
      data: {
        members: result,
        total_messages: totalMessages,
        total_members: members.length
      }
    });

  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu đóng góp' });
  }
};
