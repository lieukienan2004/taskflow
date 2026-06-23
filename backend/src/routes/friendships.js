const express = require('express');
const router = express.Router();
const {
  getFriendships,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship
} = require('../controllers/friendshipController');
const auth = require('../middleware/auth');
const pool = require('../config/database');

router.use(auth);

router.get('/', getFriendships);
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const [friends] = await pool.execute(`
      SELECT u.id, u.last_seen FROM users u
      JOIN friendships f ON (f.user_id = u.id OR f.friend_id = u.id)
      WHERE (f.user_id = ? OR f.friend_id = ?)
      AND f.status = 'accepted' AND u.id != ?
    `, [userId, userId, userId]);

    const { onlineUsers } = require('../socketHandler');
    const result = friends.map(f => ({
      id: f.id,
      online: onlineUsers.has(f.id),
      last_seen: f.last_seen
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy trạng thái online' });
  }
});
router.post('/request', sendFriendRequest);
router.post('/accept/:id', acceptFriendRequest);
router.delete('/:id', removeFriendship);

module.exports = router;
