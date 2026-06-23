require('dotenv').config();
const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  try {
    // 1. Hạ cấp tất cả tài khoản hiện có về lại 'user'
    await pool.execute("UPDATE users SET role='user'");
    console.log("✅ Đã reset toàn bộ tài khoản cũ về quyền 'user' bình thường.");

    // 2. Tạo tài khoản Admin chuyên biệt
    const adminEmail = 'admin@taskflow.com';
    const adminPass = 'admin123';
    
    // Xóa admin cũ nếu đã tạo hỏng
    await pool.execute("DELETE FROM users WHERE email = ?", [adminEmail]);

    // Tạo mới với mật khẩu mã hóa
    const hashed = await bcrypt.hash(adminPass, 12);
    await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ['System Admin', adminEmail, hashed, 'admin']
    );
    
    console.log("✅ Đã tạo tài khoản Admin độc lập thành công!");
    console.log(`\nEmail đăng nhập: ${adminEmail}\nMật khẩu: ${adminPass}\n`);

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    process.exit();
  }
}

setupAdmin();
