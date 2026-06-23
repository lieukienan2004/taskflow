const express = require('express');
const router = express.Router();
const { 
  getAllUsers, deleteUser, changeUserRole, getSystemStats,
  getCategories, createCategory, deleteCategory,
  getNotifications, createNotification, deleteNotification,
  getLogs, backupDatabase, exportData, getSettings, updateSettings,
  getUserDetail, getAllProjects, getTrends, toggleUserStatus
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// Tất cả route admin đều phải đăng nhập VÀ là admin
router.use(authMiddleware, isAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);

router.get('/stats', getSystemStats);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);

router.get('/logs', getLogs);
router.get('/backup', backupDatabase);
router.get('/export', exportData);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/users/:id', getUserDetail);
router.put('/users/:id/status', toggleUserStatus);
router.get('/projects', getAllProjects);
router.get('/trends', getTrends);

module.exports = router;
