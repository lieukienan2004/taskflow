const SemesterPlan = require('../models/SemesterPlan');

const getAll = async (req, res) => {
  try {
    const plans = await SemesterPlan.getAll(req.user.id);
    res.json({ success: true, data: plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const getById = async (req, res) => {
  try {
    const plan = await SemesterPlan.getById(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Khong tim thay' });
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const create = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ success: false, message: 'Ten ke hoach la bat buoc' });
    const plan = await SemesterPlan.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    console.error('[CREATE ERROR]', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message, stack: err.stack ? err.stack.split('\n').slice(0,3).join('\\n') : '' });
  }
};

const update = async (req, res) => {
  try {
    const plan = await SemesterPlan.update(req.params.id, req.user.id, req.body);
    if (!plan) return res.status(404).json({ success: false, message: 'Khong tim thay' });
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await SemesterPlan.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Khong tim thay' });
    res.json({ success: true, message: 'Da xoa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const createObjective = async (req, res) => {
  try {
    const id = await SemesterPlan.createObjective(req.params.planId, req.user.id, req.body);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const updateObjective = async (req, res) => {
  try {
    await SemesterPlan.updateObjective(req.params.objectiveId, req.user.id, req.body);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const deleteObjective = async (req, res) => {
  try {
    await SemesterPlan.deleteObjective(req.params.objectiveId, req.user.id);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const createKeyResult = async (req, res) => {
  try {
    await SemesterPlan.createKeyResult(req.params.objectiveId, req.user.id, req.body);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const updateKeyResult = async (req, res) => {
  try {
    await SemesterPlan.updateKeyResult(req.params.krId, req.user.id, req.body);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const deleteKeyResult = async (req, res) => {
  try {
    await SemesterPlan.deleteKeyResult(req.params.krId, req.user.id);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const linkTask = async (req, res) => {
  try {
    await SemesterPlan.linkTask(req.params.objectiveId, req.user.id, req.body.task_id);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

const unlinkTask = async (req, res) => {
  try {
    await SemesterPlan.unlinkTask(req.params.objectiveId, req.user.id, req.params.taskId);
    const plan = await SemesterPlan.getById(req.params.planId, req.user.id);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Loi server' });
  }
};

module.exports = {
  getAll, getById, create, update, remove,
  createObjective, updateObjective, deleteObjective,
  createKeyResult, updateKeyResult, deleteKeyResult,
  linkTask, unlinkTask
};
