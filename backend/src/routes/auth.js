const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, uploadAvatar, googleLogin, forgotPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;

