const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Từ chối truy cập. Chỉ dành cho Quản trị viên.' });
  }
};

module.exports = { isAdmin };
