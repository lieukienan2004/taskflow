const jwt = require('jsonwebtoken');
const pool = require('./config/database');

// In-memory map of online users: userId -> socketId
const onlineUsers = new Map();

const getOnlineUserIds = () => [...onlineUsers.keys()];

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_super_secret_key_2026');
      socket.userId = decoded.id;
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[Socket] User connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);

    // Update last_seen in DB
    try {
      await pool.execute('UPDATE users SET last_seen = NOW() WHERE id = ?', [socket.userId]);
    } catch (e) { /* ignore */ }

    // Broadcast online status to all connected users
    io.emit('online-users', getOnlineUserIds());

    socket.join(`user:${socket.userId}`);

    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('project-message', async (data) => {
      const { projectId, message } = data;
      if (!projectId || !message) return;

      try {
        const [result] = await pool.execute(
          'INSERT INTO project_chats (project_id, user_id, message) VALUES (?, ?, ?)',
          [projectId, socket.userId, message]
        );

        const [rows] = await pool.execute(`
          SELECT pc.*, u.name as user_name, u.avatar as user_avatar
          FROM project_chats pc
          JOIN users u ON pc.user_id = u.id
          WHERE pc.id = ?
        `, [result.insertId]);

        io.to(`project:${projectId}`).emit('new-message', rows[0]);
      } catch (err) {
        console.error('[Socket] Error saving message:', err);
        socket.emit('error', { message: 'Không thể gửi tin nhắn' });
      }
    });

    socket.on('task-updated', (data) => {
      const { taskId, projectId } = data;
      if (projectId) {
        socket.to(`project:${projectId}`).emit('task-changed', data);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`[Socket] User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);

      // Update last_seen
      try {
        await pool.execute('UPDATE users SET last_seen = NOW() WHERE id = ?', [socket.userId]);
      } catch (e) { /* ignore */ }

      io.emit('online-users', getOnlineUserIds());
    });
  });
};

module.exports = setupSocket;
module.exports.onlineUsers = onlineUsers;
module.exports.getOnlineUserIds = getOnlineUserIds;
