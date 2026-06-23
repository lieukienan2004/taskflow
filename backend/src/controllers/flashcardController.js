const Flashcard = require('../models/Flashcard');

// --- Decks ---
const getDecks = async (req, res) => {
  try {
    const userId = req.user.id;
    const decks = await Flashcard.getDecksByUserId(userId);
    res.json({ success: true, data: decks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách bộ thẻ.' });
  }
};

const getDeckById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deck = await Flashcard.getDeckById(id, userId);

    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ thẻ.' });
    }

    res.json({ success: true, data: deck });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải bộ thẻ.' });
  }
};

const createDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên bộ thẻ không được để trống.' });
    }

    const deck = await Flashcard.createDeck(userId, { name, description, color });
    res.status(201).json({ success: true, data: deck, message: 'Tạo bộ thẻ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo bộ thẻ.' });
  }
};

const updateDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên bộ thẻ không được để trống.' });
    }

    const deck = await Flashcard.updateDeck(id, userId, { name, description, color });

    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ thẻ để cập nhật.' });
    }

    res.json({ success: true, data: deck, message: 'Cập nhật bộ thẻ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bộ thẻ.' });
  }
};

const deleteDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const success = await Flashcard.deleteDeck(id, userId);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ thẻ để xóa.' });
    }

    res.json({ success: true, message: 'Xóa bộ thẻ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa bộ thẻ.' });
  }
};

// --- Cards ---
const getCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deckId } = req.params;

    const cards = await Flashcard.getCardsByDeckId(deckId, userId);
    res.json({ success: true, data: cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải thẻ ghi nhớ.' });
  }
};

const createCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deck_id, front, back } = req.body;

    if (!deck_id || !front || !back) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: deck_id, front, back.' });
    }

    const card = await Flashcard.createCard(deck_id, userId, { front, back });
    res.status(201).json({ success: true, data: card, message: 'Tạo thẻ ghi nhớ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi server khi tạo thẻ.' });
  }
};

const updateCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { front, back } = req.body;

    if (!front || !back) {
      return res.status(400).json({ success: false, message: 'Mặt trước và mặt sau không được để trống.' });
    }

    const card = await Flashcard.updateCard(id, userId, { front, back });

    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ hoặc bạn không có quyền.' });
    }

    res.json({ success: true, data: card, message: 'Cập nhật thẻ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thẻ.' });
  }
};

const deleteCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const success = await Flashcard.deleteCard(id, userId);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ hoặc bạn không có quyền.' });
    }

    res.json({ success: true, message: 'Xóa thẻ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa thẻ.' });
  }
};

// --- Review Session & SM-2 Algorithm ---
const getDueCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deckId } = req.params;

    const cards = await Flashcard.getDueCardsForReview(deckId, userId);
    res.json({ success: true, data: cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải thẻ cần ôn tập.' });
  }
};

const reviewCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // Card ID
    const { rating } = req.body; // 1: Again, 2: Hard, 3: Good, 4: Easy

    if (!rating || ![1, 2, 3, 4].includes(parseInt(rating))) {
      return res.status(400).json({ success: false, message: 'Đánh giá rating (1-4) không hợp lệ.' });
    }

    // Lấy thông tin thẻ để lấy các giá trị cũ
    const card = await Flashcard.getCardById(id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ ghi nhớ.' });
    }

    // Ánh xạ rating người dùng (1, 2, 3, 4) sang thang điểm của SM-2 (0-5)
    // 1 (Again) -> q = 1 (Failed to recall)
    // 2 (Hard)  -> q = 3 (Correct but hard)
    // 3 (Good)  -> q = 4 (Correct after hesitation)
    // 4 (Easy)  -> q = 5 (Perfect response)
    let q = 1;
    if (rating === 2) q = 3;
    else if (rating === 3) q = 4;
    else if (rating === 4) q = 5;

    let newRepetitions = card.repetitions;
    let newIntervalDays = card.interval_days;
    let newEaseFactor = parseFloat(card.ease_factor);

    if (q < 3) {
      // Đánh giá là Quên (Again) -> Quay lại từ đầu
      newRepetitions = 0;
      newIntervalDays = 1;
    } else {
      // Trả lời đúng
      if (newRepetitions === 0) {
        newIntervalDays = 1;
      } else if (newRepetitions === 1) {
        newIntervalDays = 6;
      } else {
        newIntervalDays = Math.round(newIntervalDays * newEaseFactor);
      }
      newRepetitions += 1;
    }

    // Tính toán Ease Factor mới: EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    newEaseFactor = newEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3; // Giới hạn dưới chuẩn của SM-2
    }
    newEaseFactor = parseFloat(newEaseFactor.toFixed(2));

    // Tính toán thời gian ôn tập tiếp theo (next_review)
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newIntervalDays);

    const updatedCard = await Flashcard.updateReviewStats(id, {
      ease_factor: newEaseFactor,
      repetitions: newRepetitions,
      interval_days: newIntervalDays,
      next_review: nextReviewDate
    });

    res.json({
      success: true,
      data: updatedCard,
      message: `Đã cập nhật lịch ôn tập! Lần ôn tiếp theo sau: ${newIntervalDays} ngày.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lưu kết quả ôn tập.' });
  }
};

module.exports = {
  getDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  getCards,
  createCard,
  updateCard,
  deleteCard,
  getDueCards,
  reviewCard
};
