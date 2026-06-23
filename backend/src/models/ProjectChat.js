const pool = require('../config/database');

class ProjectChat {
  // Check if a user is a member of a project (either owner or an accepted member)
  static async isMember(projectId, userId) {
    const query = `
      SELECT id FROM projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL
      UNION
      SELECT id FROM project_members WHERE project_id = ? AND user_id = ? AND status = 'accepted'
    `;
    const [rows] = await pool.execute(query, [projectId, userId, projectId, userId]);
    return rows.length > 0;
  }

  static async create(projectId, userId, message) {
    // 1. Verify membership
    const member = await this.isMember(projectId, userId);
    if (!member) {
      throw new Error('Bạn không có quyền đăng tin nhắn trong dự án này.');
    }

    // 2. Insert message
    const [result] = await pool.execute(
      'INSERT INTO project_chats (project_id, user_id, message) VALUES (?, ?, ?)',
      [projectId, userId, message]
    );

    // 3. Return the inserted chat details
    return this.getChatById(result.insertId);
  }

  static async getChatById(id) {
    const query = `
      SELECT pc.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar
      FROM project_chats pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async getByProjectId(projectId, userId) {
    // 1. Verify membership
    const member = await this.isMember(projectId, userId);
    if (!member) {
      throw new Error('Bạn không có quyền xem tin nhắn của dự án này.');
    }

    // 2. Retrieve messages
    const query = `
      SELECT pc.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar
      FROM project_chats pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.project_id = ?
      ORDER BY pc.created_at ASC
    `;
    const [rows] = await pool.execute(query, [projectId]);
    return rows;
  }
}

module.exports = ProjectChat;
