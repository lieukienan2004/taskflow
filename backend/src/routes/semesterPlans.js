const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/semesterPlanController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.post('/:planId/objectives', ctrl.createObjective);
router.put('/:planId/objectives/:objectiveId', ctrl.updateObjective);
router.delete('/:planId/objectives/:objectiveId', ctrl.deleteObjective);

router.post('/:planId/objectives/:objectiveId/key-results', ctrl.createKeyResult);
router.put('/:planId/objectives/:objectiveId/key-results/:krId', ctrl.updateKeyResult);
router.delete('/:planId/objectives/:objectiveId/key-results/:krId', ctrl.deleteKeyResult);

router.post('/:planId/objectives/:objectiveId/tasks', ctrl.linkTask);
router.delete('/:planId/objectives/:objectiveId/tasks/:taskId', ctrl.unlinkTask);

module.exports = router;
