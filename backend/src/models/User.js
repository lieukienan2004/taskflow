const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR name = ?', [email, email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  static async create({ name, email, password }) {
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    return this.findById(result.insertId);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(id, { name }) {
    await pool.execute(
      'UPDATE users SET name = ? WHERE id = ?', 
      [name, id]
    );
    return this.findById(id);
  }

  static async updateAvatar(id, avatarPath) {
    await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, id]);
    return this.findById(id);
  }

  static async changePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
  }

  static async findByIdWithPassword(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = User;
