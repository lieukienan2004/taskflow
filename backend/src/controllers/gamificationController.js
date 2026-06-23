const Gamification = require('../models/Gamification');

const getProfile = async (req, res) => {
  try {
    const profile = await Gamification.get(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await Gamification.update(req.user.id, req.body);
    res.json({ success: true, data: profile, message: 'Cập nhật thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const awardXP = async (req, res) => {
  try {
    const { amount, priority } = req.body;
    const result = await Gamification.awardXP(req.user.id, amount, priority);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const deductXP = async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await Gamification.deductXP(req.user.id, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getProfile, updateProfile, awardXP, deductXP };
