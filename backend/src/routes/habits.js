const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const habitController = require('../controllers/habitController');

router.get('/', auth, habitController.getAll);
router.get('/stats', auth, habitController.getStats);
router.get('/:id', auth, habitController.getById);
router.post('/', auth, habitController.create);
router.put('/:id', auth, habitController.update);
router.delete('/:id', auth, habitController.delete);
router.post('/:id/toggle', auth, habitController.toggleDay);

module.exports = router;
