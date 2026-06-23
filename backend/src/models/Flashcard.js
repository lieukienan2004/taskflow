const pool = require('../config/database');

class Flashcard {
  // --- Decks ---
  static async createDeck(userId, { name, description = null, color = '#D4AF37' }) {
    const [result] = await pool.execute(
      'INSERT INTO flashcard_decks (user_id, name, description, color) VALUES (?, ?, ?, ?)',
      [userId, name, description, color]
    );
    return this.getDeckById(result.insertId, userId);
  }

  static async getDecksByUserId(userId) {
    // Lấy danh sách bộ thẻ kèm theo số lượng tổng thẻ và số thẻ đến hạn ôn tập
    const query = `
      SELECT d.*, 
             COUNT(c.id) as total_cards,
             SUM(CASE WHEN c.next_review <= NOW() THEN 1 ELSE 0 END) as due_cards
      FROM flashcard_decks d
      LEFT JOIN flashcards c ON d.id = c.deck_id
      WHERE d.user_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  static async getDeckById(deckId, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM flashcard_decks WHERE id = ? AND user_id = ?',
      [deckId, userId]
    );
    return rows[0] || null;
  }

  static async updateDeck(deckId, userId, { name, description = null, color = '#D4AF37' }) {
    await pool.execute(
      'UPDATE flashcard_decks SET name = ?, description = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, description, color, deckId, userId]
    );
    return this.getDeckById(deckId, userId);
  }

  static async deleteDeck(deckId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM flashcard_decks WHERE id = ? AND user_id = ?',
      [deckId, userId]
    );
    return result.affectedRows > 0;
  }

  // --- Flashcards ---
  static async getCardById(cardId) {
    const [rows] = await pool.execute('SELECT * FROM flashcards WHERE id = ?', [cardId]);
    return rows[0] || null;
  }

  static async getCardsByDeckId(deckId, userId) {
    // Xác thực bộ thẻ thuộc về user
    const deck = await this.getDeckById(deckId, userId);
    if (!deck) return [];

    const [rows] = await pool.execute(
      'SELECT * FROM flashcards WHERE deck_id = ? ORDER BY created_at DESC',
      [deckId]
    );
    return rows;
  }

  static async createCard(deckId, userId, { front, back }) {
    const deck = await this.getDeckById(deckId, userId);
    if (!deck) throw new Error('Bộ thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.');

    const [result] = await pool.execute(
      'INSERT INTO flashcards (deck_id, front, back) VALUES (?, ?, ?)',
      [deckId, front, back]
    );
    return this.getCardById(result.insertId);
  }

  static async updateCard(cardId, userId, { front, back }) {
    // Xác định quyền sở hữu thẻ thông qua deck
    const [rows] = await pool.execute(
      `SELECT c.* FROM flashcards c 
       JOIN flashcard_decks d ON c.deck_id = d.id 
       WHERE c.id = ? AND d.user_id = ?`,
      [cardId, userId]
    );
    if (rows.length === 0) return null;

    await pool.execute(
      'UPDATE flashcards SET front = ?, back = ? WHERE id = ?',
      [front, back, cardId]
    );
    return this.getCardById(cardId);
  }

  static async deleteCard(cardId, userId) {
    // Xác định quyền sở hữu thẻ thông qua deck
    const [rows] = await pool.execute(
      `SELECT c.* FROM flashcards c 
       JOIN flashcard_decks d ON c.deck_id = d.id 
       WHERE c.id = ? AND d.user_id = ?`,
      [cardId, userId]
    );
    if (rows.length === 0) return false;

    const [result] = await pool.execute('DELETE FROM flashcards WHERE id = ?', [cardId]);
    return result.affectedRows > 0;
  }

  static async getDueCardsForReview(deckId, userId) {
    const deck = await this.getDeckById(deckId, userId);
    if (!deck) return [];

    const [rows] = await pool.execute(
      'SELECT * FROM flashcards WHERE deck_id = ? AND next_review <= NOW() ORDER BY next_review ASC',
      [deckId]
    );
    return rows;
  }

  static async updateReviewStats(cardId, { ease_factor, repetitions, interval_days, next_review }) {
    await pool.execute(
      `UPDATE flashcards 
       SET ease_factor = ?, repetitions = ?, interval_days = ?, next_review = ? 
       WHERE id = ?`,
      [ease_factor, repetitions, interval_days, next_review, cardId]
    );
    return this.getCardById(cardId);
  }
}

module.exports = Flashcard;
