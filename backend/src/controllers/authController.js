const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const googleLogin = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }
    let user = await User.findByEmail(email);
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: require('crypto').randomBytes(16).toString('hex'),
        avatar: avatar || null
      });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: 'Đăng nhập Google thành công!', data: { user: safeUser, token } });
  } catch (err) {
    console.error('[Google Auth Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi xác thực Google.' });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const user = await User.create({ 
      name, 
      email, 
      password
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: { user, token }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: { user: safeUser, token }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên không được để trống.' });
    }
    const user = await User.updateProfile(req.user.id, { 
      name: name.trim()
    });
    res.json({ success: true, data: user, message: 'Cập nhật hồ sơ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }
    const user = await User.findByIdWithPassword(req.user.id);
    const isMatch = await User.verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }
    await User.changePassword(req.user.id, newPassword);
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/auth/avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh.' });
    }

    // Delete old avatar file if exists
    const currentUser = await User.findById(req.user.id);
    if (currentUser.avatar) {
      const oldPath = path.join(__dirname, '../../', currentUser.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.updateAvatar(req.user.id, avatarPath);
    res.json({ success: true, data: user, message: 'Cập nhật ảnh đại diện thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({ success: true, message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' });
    }

    const newPassword = 'TF' + crypto.randomBytes(4).toString('hex') + '!';
    await User.changePassword(user.id, newPassword);

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: '[TaskFlow] Đặt lại mật khẩu',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#117c75;">🔐 Đặt lại mật khẩu</h2>
          <hr style="border:1px solid #e2e8f0;"/>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Yêu cầu đặt lại mật khẩu cho tài khoản TaskFlow của bạn đã được xử lý.</p>
          <div style="background:#f0fdf9;border:2px dashed #117c75;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
            <p style="margin:0 0 8px;color:#64748b;font-size:14px;">Mật khẩu mới của bạn là:</p>
            <p style="margin:0;font-size:24px;font-weight:bold;color:#117c75;letter-spacing:2px;background:#fff;padding:12px 20px;border-radius:8px;display:inline-block;border:1px solid #e2e8f0;">${newPassword}</p>
          </div>
          <p style="color:#ef4444;font-weight:600;">⚠️ Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập.</p>
          <hr style="border:1px solid #e2e8f0;margin-top:20px;"/>
          <p style="color:#94a3b8;font-size:12px;">Email tự động từ hệ thống TaskFlow. Vui lòng không reply.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.' });
  } catch (err) {
    console.error('[Forgot Password Error]', err);
    res.status(500).json({ success: false, message: 'Không thể gửi mật khẩu. Vui lòng thử lại.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, uploadAvatar, googleLogin, forgotPassword };
