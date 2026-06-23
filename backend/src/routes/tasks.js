const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllTasks, getTaskById, createTask,
  updateTask, deleteTask, getCategories,
  getDependenciesAll, addDependency, deleteDependency
} = require('../controllers/taskController');

// Tất cả routes đều cần đăng nhập
router.use(auth);

router.get('/categories', getCategories);
router.get('/dependencies/all', getDependenciesAll);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.post('/:id/dependencies', addDependency);
router.delete('/:id/dependencies/:depId', deleteDependency);
router.delete('/:id', deleteTask);

module.exports = router;
