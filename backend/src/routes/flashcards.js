const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/flashcardController');
const auth = require('../middleware/auth');

// Tất cả endpoints đều cần xác thực đăng nhập
router.use(auth);

// --- Bộ thẻ (Decks) ---
router.get('/decks', getDecks);
router.get('/decks/:id', getDeckById);
router.post('/decks', createDeck);
router.put('/decks/:id', updateDeck);
router.delete('/decks/:id', deleteDeck);

// --- Thẻ ghi nhớ (Cards) ---
router.get('/decks/:deckId/cards', getCards);
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);

// --- Ôn tập (Review) ---
router.get('/decks/:deckId/review', getDueCards);
router.post('/cards/:id/review', reviewCard);

module.exports = router;
