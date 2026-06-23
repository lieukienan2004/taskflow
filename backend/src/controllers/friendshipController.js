const Friendship = require('../models/Friendship');

const getFriendships = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await Friendship.getFriends(userId);
    const pending = await Friendship.getPendingRequests(userId);
    res.json({
      success: true,
      data: { friends, pending }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách bạn bè.' });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Email.'
      });
    }

    await Friendship.sendRequest(userId, email.trim());
    res.status(201).json({
      success: true,
      message: 'Gửi lời mời kết bạn thành công!'
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message || 'Không thể gửi lời mời kết bạn.'
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Friendship.acceptRequest(id, userId);
    res.json({
      success: true,
      message: 'Đã chấp nhận lời mời kết bạn.'
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message || 'Không thể chấp nhận lời mời kết bạn.'
    });
  }
};

const removeFriendship = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Friendship.declineOrRemove(id, userId);
    res.json({
      success: true,
      message: 'Đã xóa liên kết bạn bè.'
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message || 'Không thể thực hiện yêu cầu.'
    });
  }
};

module.exports = {
  getFriendships,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship
};
