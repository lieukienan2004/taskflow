const pool = require('../config/database');

class Friendship {
  static async sendRequest(userId, email) {
    // 1. Tìm user muốn kết bạn
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Không tìm thấy tài khoản người dùng này.');
    }

    const friendId = users[0].id;

    if (friendId === userId) {
      throw new Error('Bạn không thể tự kết bạn với chính mình.');
    }

    // 2. Kiểm tra xem đã kết bạn hoặc gửi lời mời chưa
    const [existing] = await pool.execute(
      'SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );

    if (existing.length > 0) {
      const relation = existing[0];
      if (relation.status === 'accepted') {
        throw new Error('Hai bạn đã là bạn bè của nhau rồi.');
      } else if (relation.user_id === userId) {
        throw new Error('Bạn đã gửi lời mời kết bạn trước đó, đang chờ đối phương chấp nhận.');
      } else {
        throw new Error('Người này đã gửi lời mời kết bạn cho bạn trước đó, hãy đồng ý kết bạn.');
      }
    }

    // 3. Tạo lời mời kết bạn mới
    const [result] = await pool.execute(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, "pending")',
      [userId, friendId]
    );

    return result.insertId;
  }

  static async acceptRequest(friendshipId, userId) {
    const [result] = await pool.execute(
      'UPDATE friendships SET status = "accepted" WHERE id = ? AND friend_id = ? AND status = "pending"',
      [friendshipId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Lời mời kết bạn không tồn tại hoặc bạn không có quyền xác nhận.');
    }

    return true;
  }

  static async declineOrRemove(friendshipId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM friendships WHERE id = ? AND (user_id = ? OR friend_id = ?)',
      [friendshipId, userId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Mối quan hệ bạn bè không tồn tại hoặc bạn không có quyền xóa.');
    }

    return true;
  }

  static async getFriends(userId) {
    const [rows] = await pool.execute(
      `SELECT f.id AS friendship_id, u.id AS user_id, u.name, u.email, u.avatar
       FROM friendships f
       JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
       WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted' AND u.id != ?`,
      [userId, userId, userId]
    );
    return rows;
  }

  static async getPendingRequests(userId) {
    const [rows] = await pool.execute(
      `SELECT f.id AS friendship_id, u.id AS user_id, u.name, u.email, u.avatar
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [userId]
    );
    return rows;
  }
}

module.exports = Friendship;
