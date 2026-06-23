const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subjectController = require('../controllers/subjectController');

router.use(auth);

router.get('/', subjectController.getAll);
router.post('/', subjectController.create);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.delete);

module.exports = router;
