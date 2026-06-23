<template>
  <div class="flashcards-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🗂️ Thẻ Ghi Nhớ & Ôn Tập</h1>
        <p class="page-subtitle">Phương pháp Lặp lại Ngắt quãng (Spaced Repetition) giúp tối ưu hóa việc ghi nhớ lý thuyết.</p>
      </div>
      <button class="btn btn-primary add-deck-btn" @click="openCreateDeckModal">
        ➕ Tạo Bộ Thẻ Mới
      </button>
    </div>

    <!-- Main Grid / List of Decks -->
    <div v-if="loadingDecks" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>Đang tải danh sách bộ thẻ học tập...</p>
    </div>

    <div v-else-if="decks.length === 0" class="empty-state glass-card">
      <div class="empty-icon">🎴</div>
      <h3>Chưa có bộ thẻ ghi nhớ nào</h3>
      <p>Hãy tạo một bộ thẻ mới (ví dụ: "Giải tích 1", "Từ vựng Anh văn") để bắt đầu học tập và ôn tập thông minh!</p>
    </div>

    <div v-else class="decks-grid">
      <div 
        v-for="deck in decks" 
        :key="deck.id" 
        class="deck-card glass-card"
        :style="{ '--deck-color': deck.color, borderColor: deck.color }"
      >
        <!-- Deck Header Info -->
        <div class="deck-card-header">
          <span class="deck-badge" :style="{ background: deck.color + '20', color: deck.color }">
            {{ deck.total_cards }} thẻ
          </span>
          <div class="deck-actions">
            <button class="action-icon-btn edit" @click="openEditDeckModal(deck)" title="Sửa bộ thẻ">✏️</button>
            <button class="action-icon-btn delete" @click="deleteDeck(deck.id)" title="Xóa bộ thẻ">✕</button>
          </div>
        </div>

        <div class="deck-card-body">
          <h3 class="deck-title">{{ deck.name }}</h3>
          <p class="deck-desc">{{ deck.description || 'Không có mô tả cho bộ thẻ này.' }}</p>
        </div>

        <!-- Deck Info & Study CTA -->
        <div class="deck-card-footer">
          <div class="due-info">
            <span v-if="deck.due_cards > 0" class="due-badge">
              🔥 {{ deck.due_cards }} thẻ cần ôn tập
            </span>
            <span v-else class="done-badge">
              ✅ Hoàn thành hôm nay
            </span>
          </div>

          <div class="cta-buttons">
            <button class="btn btn-manage" @click="selectDeckForManagement(deck)">
              ⚙️ Quản lý thẻ
            </button>
            <router-link 
              :to="'/flashcards/' + deck.id + '/review'" 
              class="btn btn-review" 
              :class="{ 'btn-primary': deck.due_cards > 0, 'btn-secondary': deck.due_cards === 0 }"
            >
              ⚡ Ôn tập
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Cards Management for Selected Deck -->
    <div v-if="selectedDeck" class="cards-management-section glass-card" ref="managementSection" :style="{ borderColor: selectedDeck.color }">
      <div class="section-header">
        <div>
          <h3>⚙️ Quản lý thẻ của bộ: <span class="highlight-text" :style="{ color: selectedDeck.color }">{{ selectedDeck.name }}</span></h3>
          <p class="section-subtitle">Tổng số: {{ cards.length }} thẻ ghi nhớ. Mặt trước (Câu hỏi), mặt sau (Đáp án).</p>
        </div>
        <button class="btn btn-secondary close-section-btn" @click="closeManagementSection">Đóng ✕</button>
      </div>

      <!-- Quick Add Form -->
      <form @submit.prevent="saveCard" class="card-add-form glass-card">
        <h4 class="form-title">{{ editingCardId ? '✏️ Sửa Thẻ Ghi Nhớ' : '➕ Thêm Thẻ Ghi Nhớ Mới' }}</h4>
        <div class="form-fields">
          <div class="field-group">
            <label>Mặt Trước (Câu hỏi / Thuật ngữ / Từ vựng)</label>
            <textarea 
              v-model="cardForm.front" 
              placeholder="Nhập nội dung hiển thị ở mặt trước (Câu hỏi, từ vựng)..." 
              rows="2" 
              required
              class="premium-textarea"
            ></textarea>
          </div>
          <div class="field-group">
            <label>Mặt Sau (Câu trả lời / Giải nghĩa / Định nghĩa)</label>
            <textarea 
              v-model="cardForm.back" 
              placeholder="Nhập nội dung hiển thị ở mặt sau (Đáp án, định nghĩa chi tiết)..." 
              rows="2" 
              required
              class="premium-textarea"
            ></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button v-if="editingCardId" type="button" class="btn btn-secondary" @click="cancelEditCard">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary" :disabled="submittingCard">
            {{ submittingCard ? 'Đang lưu...' : (editingCardId ? 'Cập Nhật Thẻ' : 'Thêm Vào Bộ Thẻ') }}
          </button>
        </div>
      </form>

      <!-- Cards Grid List -->
      <div v-if="loadingCards" class="spinner-wrapper">
        <div class="spinner"></div>
      </div>
      <div v-else-if="cards.length === 0" class="empty-cards-state">
        <p>Bộ thẻ này chưa có thẻ nào. Hãy điền vào form phía trên để thêm thẻ đầu tiên nhé!</p>
      </div>
      <div v-else class="cards-list">
        <div v-for="card in cards" :key="card.id" class="card-item glass-card">
          <div class="card-preview-sides">
            <div class="preview-side font-bold text-slate-100">
              <span class="side-badge">Mặt trước</span>
              <p>{{ card.front }}</p>
            </div>
            <div class="preview-side border-l border-slate-800 text-slate-300">
              <span class="side-badge">Mặt sau</span>
              <p>{{ card.back }}</p>
            </div>
          </div>
          <div class="card-item-meta">
            <span class="meta-item" title="Độ dễ ghi nhớ">EF: {{ card.ease_factor }}</span>
            <span class="meta-item" title="Số lần lặp lại thành công">Rep: {{ card.repetitions }}</span>
            <span class="meta-item" title="Hạn ôn tiếp theo">Ôn tiếp: {{ formatDate(card.next_review) }}</span>
            <div class="card-item-actions">
              <button class="action-btn edit-btn" @click="startEditCard(card)">✏️ Sửa</button>
              <button class="action-btn delete-btn" @click="deleteCard(card.id)">🗑️ Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create/Edit Deck -->
    <transition name="fade">
      <div v-if="showDeckModal" class="modal-overlay" @click.self="closeDeckModal">
        <div class="modal-content glass-card" :style="{ borderColor: deckForm.color }">
          <div class="modal-header">
            <h3>{{ editingDeckId ? '✏️ Cập Nhật Bộ Thẻ' : '🗂️ Tạo Bộ Thẻ Học Tập Mới' }}</h3>
            <button class="close-btn" @click="closeDeckModal">✕</button>
          </div>
          <form @submit.prevent="saveDeck" class="modal-body">
            <div class="premium-form-group">
              <label class="premium-label">Tên bộ thẻ</label>
              <input 
                v-model="deckForm.name" 
                type="text" 
                placeholder="Ví dụ: Anh Văn Chuyên Ngành, Giải Tích..." 
                required 
                class="premium-input"
              />
            </div>
            <div class="premium-form-group" style="margin-top: 15px;">
              <label class="premium-label">Mô tả bộ thẻ</label>
              <textarea 
                v-model="deckForm.description" 
                placeholder="Ghi chú tóm tắt nội dung bộ thẻ này..." 
                class="premium-input" 
                rows="3"
              ></textarea>
            </div>
            <div class="premium-form-group" style="margin-top: 15px;">
              <label class="premium-label">Màu sắc chủ đề</label>
              <div class="color-palette">
                <span 
                  v-for="c in colorPresets" 
                  :key="c.value" 
                  class="color-dot" 
                  :style="{ background: c.value }"
                  :class="{ active: deckForm.color === c.value }"
                  @click="deckForm.color = c.value"
                  :title="c.name"
                ></span>
              </div>
            </div>

            <div class="modal-footer" style="margin-top: 25px; padding: 0;">
              <button type="button" class="btn-premium-secondary" @click="closeDeckModal">Hủy bỏ</button>
              <button type="submit" class="btn-premium-primary" :disabled="submittingDeck">
                {{ submittingDeck ? 'Đang lưu...' : (editingDeckId ? 'Cập Nhật' : 'Tạo Bộ Thẻ') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { flashcardApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

// State bộ thẻ
const decks = ref([])
const loadingDecks = ref(false)
const submittingDeck = ref(false)
const showDeckModal = ref(false)
const editingDeckId = ref(null)
const deckForm = ref({
  name: '',
  description: '',
  color: '#117c75'
})

// Preset màu sắc cực đẹp
const colorPresets = [
  { name: 'Tím', value: '#117c75' },
  { name: 'Tím Neon', value: '#2dd4bf' },
  { name: 'Xanh ngọc', value: '#14B8A6' },
  { name: 'Hồng san hô', value: '#F43F5E' },
  { name: 'Xanh Indigo', value: '#6366F1' }
]

// State quản lý thẻ của bộ thẻ được chọn
const selectedDeck = ref(null)
const cards = ref([])
const loadingCards = ref(false)
const submittingCard = ref(false)
const editingCardId = ref(null)
const cardForm = ref({
  front: '',
  back: ''
})
const managementSection = ref(null)

// Tải danh sách bộ thẻ từ API
const loadDecks = async () => {
  loadingDecks.value = true
  try {
    const res = await flashcardApi.getDecks()
    decks.value = res.data.data
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể tải danh sách bộ thẻ.', 'error')
  } finally {
    loadingDecks.value = false
  }
}

// Mở modal tạo bộ thẻ mới
const openCreateDeckModal = () => {
  editingDeckId.value = null
  deckForm.value = {
    name: '',
    description: '',
    color: colorPresets[0].value
  }
  showDeckModal.value = true
}

// Mở modal sửa bộ thẻ
const openEditDeckModal = (deck) => {
  editingDeckId.value = deck.id
  deckForm.value = {
    name: deck.name,
    description: deck.description || '',
    color: deck.color || '#117c75'
  }
  showDeckModal.value = true
}

const closeDeckModal = () => {
  showDeckModal.value = false
}

// Lưu thông tin bộ thẻ (Tạo mới hoặc Cập nhật)
const saveDeck = async () => {
  if (!deckForm.value.name.trim()) return

  submittingDeck.value = true
  try {
    if (editingDeckId.value) {
      await flashcardApi.updateDeck(editingDeckId.value, deckForm.value)
      taskStore.showToast('✅ Cập nhật bộ thẻ thành công!')
    } else {
      await flashcardApi.createDeck(deckForm.value)
      taskStore.showToast('✅ Tạo bộ thẻ học tập mới thành công!')
    }
    showDeckModal.value = false
    await loadDecks()
    // Nếu đang sửa bộ thẻ hiện tại đang được chọn thì cập nhật lại thông tin hiển thị
    if (selectedDeck.value && selectedDeck.value.id === editingDeckId.value) {
      selectedDeck.value.name = deckForm.value.name
      selectedDeck.value.color = deckForm.value.color
    }
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Lưu thông tin bộ thẻ thất bại.', 'error')
  } finally {
    submittingDeck.value = false
  }
}

// Xóa bộ thẻ
const deleteDeck = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bộ thẻ này không? Toàn bộ các thẻ ghi nhớ bên trong cũng sẽ bị xóa vĩnh viễn.')) return

  try {
    await flashcardApi.deleteDeck(id)
    taskStore.showToast('🗑️ Đã xóa bộ thẻ học tập.')
    if (selectedDeck.value && selectedDeck.value.id === id) {
      selectedDeck.value = null
    }
    await loadDecks()
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể xóa bộ thẻ.', 'error')
  }
}

// Chọn bộ thẻ để quản lý các thẻ bên trong
const selectDeckForManagement = async (deck) => {
  selectedDeck.value = deck
  editingCardId.value = null
  cardForm.value = { front: '', back: '' }
  await loadCards(deck.id)

  // Cuộn trang mượt mà xuống phần quản lý thẻ
  nextTick(() => {
    if (managementSection.value) {
      managementSection.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const closeManagementSection = () => {
  selectedDeck.value = null
  cards.value = []
}

// Tải thẻ của một bộ
const loadCards = async (deckId) => {
  loadingCards.value = true
  try {
    const res = await flashcardApi.getCards(deckId)
    cards.value = res.data.data
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể tải danh sách thẻ.', 'error')
  } finally {
    loadingCards.value = false
  }
}

// Lưu thẻ ghi nhớ (Thêm mới hoặc Sửa)
const saveCard = async () => {
  if (!cardForm.value.front.trim() || !cardForm.value.back.trim() || !selectedDeck.value) return

  submittingCard.value = true
  try {
    if (editingCardId.value) {
      await flashcardApi.updateCard(editingCardId.value, {
        front: cardForm.value.front,
        back: cardForm.value.back
      })
      taskStore.showToast('✅ Cập nhật thẻ thành công!')
    } else {
      await flashcardApi.createCard({
        deck_id: selectedDeck.value.id,
        front: cardForm.value.front,
        back: cardForm.value.back
      })
      taskStore.showToast('✅ Thêm thẻ ghi nhớ mới thành công!')
    }
    
    cardForm.value = { front: '', back: '' }
    editingCardId.value = null
    await loadCards(selectedDeck.value.id)
    await loadDecks() // Cập nhật lại số lượng thẻ hiển thị ở danh mục bộ thẻ
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể lưu thẻ ghi nhớ.', 'error')
  } finally {
    submittingCard.value = false
  }
}

// Sửa thẻ ghi nhớ
const startEditCard = (card) => {
  editingCardId.value = card.id
  cardForm.value = {
    front: card.front,
    back: card.back
  }
}

const cancelEditCard = () => {
  editingCardId.value = null
  cardForm.value = { front: '', back: '' }
}

// Xóa thẻ ghi nhớ
const deleteCard = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa thẻ ghi nhớ này?')) return

  try {
    await flashcardApi.deleteCard(id)
    taskStore.showToast('🗑️ Đã xóa thẻ ghi nhớ.')
    await loadCards(selectedDeck.value.id)
    await loadDecks() // Cập nhật số lượng
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể xóa thẻ.', 'error')
  }
}

// Định dạng thời gian
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  if (date <= now) return 'Cần ôn ngay 🔥'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadDecks()
})
</script>

<style scoped>
.flashcards-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s ease both;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
.page-subtitle { color: var(--text-secondary); font-size: 0.875rem; }

.add-deck-btn {
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(17,124,117, 0.25);
  transition: all 0.3s ease;
}
.add-deck-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17,124,117, 0.45);
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.empty-state h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
.empty-state p { color: var(--text-secondary); font-size: 0.95rem; max-width: 450px; }

/* Decks Grid */
.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.deck-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 20px;
  border-top: 4px solid var(--deck-color) !important;
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.deck-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(var(--deck-color), 0.12);
}

.deck-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.deck-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.deck-actions {
  display: flex;
  gap: 6px;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}
.deck-card:hover .deck-actions {
  opacity: 1;
}
.action-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #a1a1aa;
  padding: 4px;
  transition: all 0.2s ease;
}
.action-icon-btn:hover {
  transform: scale(1.15);
}
.action-icon-btn.delete:hover { color: #ef4444; }

.deck-card-body {
  flex: 1;
  margin-bottom: 16px;
}
.deck-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  line-height: 1.4;
}
.deck-desc {
  font-size: 0.85rem;
  color: #a1a1aa;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.deck-card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.due-info {
  display: flex;
  align-items: center;
}
.due-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffedd5;
  background: rgba(251, 146, 60, 0.15);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(251, 146, 60, 0.3);
  animation: pulse-badge 2s infinite;
}
@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.done-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: #d1fae5;
  background: rgba(52, 211, 153, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.cta-buttons {
  display: flex;
  gap: 10px;
}
.cta-buttons .btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}
.btn-manage {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a1a1aa;
}
.btn-manage:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.btn-review {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.btn-review.btn-secondary {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #71717a;
  cursor: default;
  pointer-events: none;
}

/* Management Section */
.cards-management-section {
  padding: 24px;
  border-top: 3px solid var(--border-color);
  margin-top: 10px;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 16px;
}
.section-header h3 { font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.section-subtitle { color: var(--text-secondary); font-size: 0.85rem; }
.close-section-btn { font-size: 0.8rem; font-weight: 600; padding: 6px 12px; }

.highlight-text { font-weight: 900; }

/* Quick Add Form */
.card-add-form {
  padding: 16px;
  margin-bottom: 24px;
}
.form-title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #117c75;
  margin-bottom: 14px;
  letter-spacing: 0.05em;
}
.form-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 768px) {
  .form-fields { grid-template-columns: 1fr; }
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #a1a1aa;
  text-transform: uppercase;
}
.premium-textarea {
  width: 100%;
  background: rgba(13, 18, 30, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: #f8fafc;
  padding: 10px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  resize: vertical;
}
.premium-textarea:focus {
  border-color: #117c75;
  box-shadow: 0 0 10px rgba(17,124,117, 0.15);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}
.form-actions .btn {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 16px;
}

/* Spinner & Empty State */
.spinner-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px;
}
.empty-cards-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 40px 10px;
}

/* Cards List */
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.card-item {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 3px solid rgba(255,255,255,0.05);
}
.card-item:hover {
  border-left-color: #117c75;
}
.card-preview-sides {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 600px) {
  .card-preview-sides {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
.preview-side {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 10px;
}
.side-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.preview-side p {
  font-size: 0.92rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-item-meta {
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.meta-item {
  font-size: 0.72rem;
  color: #71717a;
  background: rgba(255,255,255,0.02);
  padding: 2px 8px;
  border-radius: 4px;
}
.card-item-actions {
  margin-left: auto;
  display: flex;
  gap: 12px;
}
.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  transition: color 0.2s ease;
}
.edit-btn { color: #a1a1aa; }
.edit-btn:hover { color: #117c75; }
.delete-btn { color: #71717a; }
.delete-btn:hover { color: #ef4444; }

/* Modals & Color palette */
.color-palette {
  display: flex;
  gap: 8px;
}
.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.color-dot:hover { transform: scale(1.15); }
.color-dot.active {
  border-color: #fff;
  box-shadow: 0 0 8px currentColor;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(5, 5, 8, 0.85);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease both;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 24px;
  background: rgba(13, 18, 32, 0.95);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8);
  animation: zoomIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 { font-size: 1.25rem; font-weight: 800; color: #fff; }
.close-btn { background: transparent; border: none; font-size: 1.2rem; color: #a1a1aa; cursor: pointer; }
.close-btn:hover { color: #fff; }

.premium-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}
.premium-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #117c75;
  text-transform: uppercase;
}
.premium-input {
  background: rgba(13, 18, 30, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: #f8fafc;
  padding: 10px 14px;
  font-size: 0.92rem;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}
.premium-input:focus {
  border-color: #117c75;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-premium-secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #a1a1aa;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  cursor: pointer;
}
.btn-premium-primary {
  background: #117c75;
  border: none;
  color: #050508;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  cursor: pointer;
}
.btn-premium-primary:hover {
  background: #fff;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
