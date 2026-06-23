const express = require('express');
const router = express.Router();
const { getGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getGrades);
router.post('/', createGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

module.exports = router;
