const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');

router.use(auth);

router.get('/invitations', projectController.getInvitations);
router.post('/invitations/:id/accept', projectController.acceptInvitation);
router.post('/invitations/:id/decline', projectController.declineInvitation);

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

router.get('/:id/members', projectController.getMembers);
router.get('/:id/study-slots', projectController.getStudySlots);
router.post('/:id/members', projectController.inviteMember);
router.delete('/:id/members/:userId', projectController.removeMember);

router.get('/:id/chats', projectController.getProjectChats);
router.post('/:id/chats', projectController.createProjectChat);

router.get('/:id/contributions', projectController.getContributions);

module.exports = router;
