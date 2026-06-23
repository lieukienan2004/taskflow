const express = require('express');
const router = express.Router();

const projectRoutes = require('./projects');

router.use('/api/projects', projectRoutes);

module.exports = router;
