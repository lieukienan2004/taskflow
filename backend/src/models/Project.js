const pool = require('../config/database');

class Project {
  static async getAll(userId) {
    const query = `
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar, u.email as owner_email,
        (SELECT name FROM subjects s WHERE s.id = p.subject_id) as subject_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.deleted_at IS NULL) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done' AND t.deleted_at IS NULL) as task_done
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.deleted_at IS NULL AND (
        p.user_id = ? 
        OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ? AND status = 'accepted')
      )
      ORDER BY p.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId, userId]);
    return rows;
  }

  static async getById(id, userId) {
    const query = `
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar, u.email as owner_email,
        (SELECT subject_name FROM grades g WHERE g.id = p.subject_id) as subject_name
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.deleted_at IS NULL AND (
        p.user_id = ?
        OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ? AND status = 'accepted')
      )
    `;
    const [rows] = await pool.execute(query, [id, userId, userId]);
    return rows[0] || null;
  }

  static async create(userId, data) {
    const { name, description, status, color, subject_id } = data;
    const [result] = await pool.execute(
      `INSERT INTO projects (user_id, name, description, status, color, subject_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, description || null, status || 'active', color || '#D4AF37', subject_id || null]
    );
    return this.getById(result.insertId, userId);
  }

  static async update(id, userId, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'description', 'status', 'color', 'subject_id'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    params.push(id, userId);
    
    await pool.execute(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      params
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'UPDATE projects SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async getMembers(projectId) {
    const query = `
      SELECT 'owner' as role, 'accepted' as status, u.id as user_id, u.name, u.email, u.avatar
      FROM projects p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.deleted_at IS NULL
      UNION
      SELECT pm.role, pm.status, u.id as user_id, u.name, u.email, u.avatar
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `;
    const [rows] = await pool.execute(query, [projectId, projectId]);
    return rows;
  }

  static async addMember(projectId, ownerId, email) {
    // 1. Check if user is owner
    const project = await this.getById(projectId, ownerId);
    if (!project || project.user_id !== ownerId) {
      throw new Error('Chỉ chủ sở hữu dự án mới có quyền mời thành viên.');
    }

    // 2. Find invitee
    const [users] = await pool.execute(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      throw new Error('Không tìm thấy người dùng với Email này.');
    }
    const invitee = users[0];

    // Check if invitee is the owner themselves
    if (invitee.id === ownerId) {
      throw new Error('Bạn không thể tự mời chính mình vào dự án.');
    }

    // 3. Check if already a member
    const [existing] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, invitee.id]
    );
    if (existing.length > 0) {
      throw new Error('Người dùng này đã là thành viên hoặc đã được mời vào dự án.');
    }

    // 4. Insert member
    await pool.execute(
      'INSERT INTO project_members (project_id, user_id, role, status) VALUES (?, ?, ?, ?)',
      [projectId, invitee.id, 'member', 'pending']
    );

    return invitee;
  }

  static async removeMember(projectId, ownerId, memberUserId) {
    // Check if user is owner
    const project = await this.getById(projectId, ownerId);
    if (!project || project.user_id !== ownerId) {
      throw new Error('Chỉ chủ sở hữu dự án mới có quyền xóa thành viên.');
    }
    const [result] = await pool.execute(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, memberUserId]
    );
    return result.affectedRows > 0;
  }

  static async getPendingInvitations(userId) {
    const query = `
      SELECT pm.id as member_row_id, pm.created_at as invited_at, p.id as project_id, p.name as project_name, p.description as project_description, p.color as project_color,
             u.name as owner_name, u.email as owner_email
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pm.user_id = ? AND pm.status = 'pending' AND p.deleted_at IS NULL
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  static async handleInvitation(projectId, userId, action) {
    if (action === 'accept') {
      const [result] = await pool.execute(
        "UPDATE project_members SET status = 'accepted' WHERE project_id = ? AND user_id = ? AND status = 'pending'",
        [projectId, userId]
      );
      return result.affectedRows > 0;
    } else if (action === 'decline') {
      const [result] = await pool.execute(
        "DELETE FROM project_members WHERE project_id = ? AND user_id = ? AND status = 'pending'",
        [projectId, userId]
      );
      return result.affectedRows > 0;
    }
    return false;
  }
}

module.exports = Project;
