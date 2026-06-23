const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

const setAdmin = async () => {
  try {
    const email = 'admin@taskflow.com';
    const password = 'admin123';
    const name = 'Admin';
    
    const hashed = await bcrypt.hash(password, 12);
    
    // Cập nhật tài khoản admin@taskflow.com (đã tồn tại)
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length > 0) {
      await pool.execute(
        'UPDATE users SET password = ?, role = ?, name = ? WHERE id = ?',
        [hashed, 'admin', name, rows[0].id]
      );
      console.log('Đã cập nhật mật khẩu admin.');
    } else {
      await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashed, 'admin']
      );
      console.log('Đã tạo tài khoản admin mới.');
    }
    
    // Đồng bộ tài khoản cũ (email = 'admin') thành role admin
    await pool.execute(
      "UPDATE users SET role = 'admin' WHERE email = 'admin'"
    );
    
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
};

setAdmin();
