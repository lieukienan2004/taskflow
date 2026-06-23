const express = require('express');
const router = express.Router({ mergeParams: true });
const milestoneController = require('../controllers/milestoneController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', milestoneController.getAllByProject);
router.post('/', milestoneController.create);
router.put('/:id', milestoneController.update);
router.delete('/:id', milestoneController.delete);

module.exports = router;
