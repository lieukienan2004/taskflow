const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getAllByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await Project.getById(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    const milestones = await Milestone.getByProject(projectId);
    res.json({ success: true, data: milestones });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { name, description, status, due_date, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên mốc tiến độ là bắt buộc' });
    }

    // Verify project ownership
    const project = await Project.getById(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    const milestone = await Milestone.create(projectId, {
      name,
      description,
      status: status || 'pending',
      due_date,
      sort_order: sort_order || 0
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await Project.getById(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    // Verify milestone existence
    const existingMilestone = await Milestone.getById(id);
    if (!existingMilestone || existingMilestone.project_id !== parseInt(projectId)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mốc tiến độ' });
    }

    // Auto-update status if all tasks completed
    let updateData = { ...req.body };
    const tasks = await Task.getAll(userId, { project_id: projectId });
    const milestoneTasks = tasks.filter(t => t.milestone_id === parseInt(id));
    if (milestoneTasks.length > 0 && milestoneTasks.every(t => t.status === 'done')) {
      updateData.status = 'completed';
    }

    const milestone = await Milestone.update(id, projectId, updateData);
    res.json({ success: true, data: milestone });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await Project.getById(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    const success = await Milestone.delete(id, projectId);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mốc tiến độ' });
    }

    res.json({ success: true, message: 'Đã xóa mốc tiến độ thành công' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
