const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const taskRoutes = require('./src/routes/tasks');
const statsRoutes = require('./src/routes/stats');
const authRoutes = require('./src/routes/auth');
const chatRoutes = require('./src/routes/chat');
const adminRoutes = require('./src/routes/admin');
const systemRoutes = require('./src/routes/system');
const subtaskRoutes = require('./src/routes/subtasks');
const commentRoutes = require('./src/routes/comments');
const attachmentRoutes = require('./src/routes/attachments');
const trashRoutes = require('./src/routes/trash');
const aiRoutes = require('./src/routes/ai');
const projectRoutes = require('./src/routes/projects');
const milestoneRoutes = require('./src/routes/milestones');

const classScheduleRoutes = require('./src/routes/classSchedules');
const friendshipRoutes = require('./src/routes/friendships');
const flashcardRoutes = require('./src/routes/flashcards');
const noteRoutes = require('./src/routes/notes');
const gamificationRoutes = require('./src/routes/gamification');
const semesterPlanRoutes = require('./src/routes/semesterPlans');
const habitRoutes = require('./src/routes/habits');
const timeLogRoutes = require('./src/routes/timeLogs');
const subjectRoutes = require('./src/routes/subjects');
const contactRoutes = require('./src/routes/contact');
const reminderRoutes = require('./src/routes/reminders');

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const setupSocket = require('./src/socketHandler');

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
});
setupSocket(io);

const PORT = process.env.PORT || 3001;

// Request Logger để debug
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/tasks/:taskId/subtasks', subtaskRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);
app.use('/api/tasks/:taskId/attachments', attachmentRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/milestones', milestoneRoutes);

app.use('/api/class-schedules', classScheduleRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/semester-plans', semesterPlanRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/time-logs', timeLogRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reminders', reminderRoutes);

// Health check
const pool = require('./src/config/database');
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as ok');
    res.json({ success: true, message: 'TaskFlow API đang hoạt động 🚀', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.json({ success: true, message: 'TaskFlow API đang hoạt động (DB error)', db: e.message, timestamp: new Date().toISOString() });
  }
});

// Debug: test login directly
app.post('/api/debug-login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.json({ step: 'params', ok: false, msg: 'missing params' });
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.json({ step: 'query', ok: false, msg: 'user not found' });
    res.json({ step: 'found', ok: true, user: { id: rows[0].id, email: rows[0].email, name: rows[0].name } });
  } catch (e) {
    res.json({ step: 'error', ok: false, msg: e.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
});

server.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow Backend đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health\n`);
});
