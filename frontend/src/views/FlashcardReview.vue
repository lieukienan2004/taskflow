<template>
  <div class="review-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="back-link">
        <router-link to="/flashcards" class="btn btn-secondary">
          ⬅️ Quay Lại
        </router-link>
      </div>
      <div class="deck-info-header" v-if="deck">
        <h2 class="deck-title" :style="{ color: deck.color }">{{ deck.name }}</h2>
        <span class="session-badge">Phiên Ôn Tập Hôm Nay</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>Đang chuẩn bị thẻ ôn tập cho bạn...</p>
    </div>

    <!-- Empty State / Finished State -->
    <div v-else-if="cards.length === 0 || currentIndex >= cards.length" class="finished-state glass-card">
      <div class="celebrate-icon">🎉</div>
      <h3>Xuất sắc! Bạn đã hoàn thành phiên ôn tập!</h3>
      <p>Hôm nay bạn không còn thẻ nào cần ôn tập trong bộ thẻ này nữa.</p>
      <p class="algorithm-tip">💡 Thuật toán lặp lại ngắt quãng SM-2 sẽ tự động tính toán thời gian và nhắc nhở bạn ôn tập lại các thẻ này khi đến hạn.</p>
      <div class="finished-actions">
        <router-link to="/flashcards" class="btn btn-primary">
          Quay về quản lý bộ thẻ
        </router-link>
      </div>
    </div>

    <!-- Main Active Review Interface -->
    <div v-else class="review-container">
      <!-- Progress Bar & Stats -->
      <div class="review-stats">
        <div class="progress-info">
          <span>Tiến trình: <strong>{{ currentIndex + 1 }}</strong> / {{ cards.length }} thẻ</span>
          <span>Đang ôn: <strong>{{ currentCard.front.substring(0, 20) }}...</strong></span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: ((currentIndex) / cards.length * 100) + '%' }"></div>
        </div>
      </div>

      <!-- Instructions & Hotkeys Tip -->
      <div class="hotkeys-tip text-slate-400">
        💡 Mẹo: Nhấn <strong>Space</strong> để lật thẻ. Nhấn phím số <strong>1, 2, 3, 4</strong> tương ứng để đánh giá độ nhớ.
      </div>

      <!-- 3D Flashcard Component -->
      <div class="card-scene" @click="flipCard">
        <div class="flashcard" :class="{ 'is-flipped': isFlipped }" :style="{ '--card-accent': deck?.color || '#117c75' }">
          <!-- Card Front Side -->
          <div class="card-side card-front">
            <div class="card-banner">Mặt trước</div>
            <div class="card-content-text">{{ currentCard.front }}</div>
            <div class="card-action-hint">Nhấp vào thẻ hoặc phím Space để lật mặt sau 🔄</div>
          </div>
          <!-- Card Back Side -->
          <div class="card-side card-back">
            <div class="card-banner">Mặt sau</div>
            <div class="card-content-text">{{ currentCard.back }}</div>
            <div class="card-action-hint">Đã xem đáp án. Vui lòng đánh giá mức độ nhớ bên dưới 👇</div>
          </div>
        </div>
      </div>

      <!-- Rating Buttons (Only shown when card is flipped/revealed) -->
      <transition name="slide-up">
        <div v-if="isFlipped" class="rating-panel glass-card">
          <h4 class="rating-title">Mức độ ghi nhớ của bạn:</h4>
          <div class="rating-buttons">
            <button class="rating-btn btn-again" @click.stop="submitRating(1)">
              <span class="rating-number">1</span>
              <span class="rating-text">Quên (Again)</span>
              <span class="rating-desc">Học lại ngay</span>
            </button>
            <button class="rating-btn btn-hard" @click.stop="submitRating(2)">
              <span class="rating-number">2</span>
              <span class="rating-text">Khó (Hard)</span>
              <span class="rating-desc">Ôn lại sớm</span>
            </button>
            <button class="rating-btn btn-good" @click.stop="submitRating(3)">
              <span class="rating-number">3</span>
              <span class="rating-text">Nhớ (Good)</span>
              <span class="rating-desc">Nhớ khá tốt</span>
            </button>
            <button class="rating-btn btn-easy" @click.stop="submitRating(4)">
              <span class="rating-number">4</span>
              <span class="rating-text">Dễ (Easy)</span>
              <span class="rating-desc">Rất thuộc, ôn muộn</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { flashcardApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'
import confetti from '@/utils/confettiHelper'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

const deckId = route.params.deckId

// States
const deck = ref(null)
const cards = ref([])
const currentIndex = ref(0)
const isFlipped = ref(false)
const loading = ref(true)
const submitting = ref(false)

// Trực tiếp lấy thẻ hiện tại
const currentCard = computed(() => {
  if (cards.value.length === 0 || currentIndex.value >= cards.value.length) return null
  return cards.value[currentIndex.value]
})

// Tải thông tin bộ thẻ và thẻ đến hạn ôn tập
const loadSessionData = async () => {
  loading.value = true
  try {
    const [deckRes, cardsRes] = await Promise.all([
      flashcardApi.getDeckById(deckId),
      flashcardApi.getDueCards(deckId)
    ])
    deck.value = deckRes.data.data
    cards.value = cardsRes.data.data
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể tải phiên ôn tập.', 'error')
    router.push('/flashcards')
  } finally {
    loading.value = false
  }
}

// Lật mặt thẻ
const flipCard = () => {
  if (submitting.value) return
  isFlipped.value = !isFlipped.value
}

// Đánh giá và lưu kết quả ôn tập (Gửi lên API để chạy thuật toán SM-2)
const submitRating = async (rating) => {
  if (!currentCard.value || submitting.value) return

  submitting.value = true
  try {
    const card = currentCard.value
    await flashcardApi.reviewCard(card.id, rating)
    
    // Tạo hiệu ứng thành công nhỏ
    taskStore.showToast(`🎯 Đã ghi nhận!`, 'success')

    // Chuyển sang thẻ tiếp theo
    isFlipped.value = false
    setTimeout(() => {
      currentIndex.value++
      submitting.value = false

      // Nếu hoàn thành thẻ cuối cùng
      if (currentIndex.value >= cards.value.length) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#117c75', '#34d399', '#2dd4bf', '#14B8A6', deck.value?.color || '#117c75']
        })
      }
    }, 200)

  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Lưu kết quả đánh giá thất bại.', 'error')
    submitting.value = false
  }
}

// Xử lý các phím tắt bàn phím
const handleKeyDown = (e) => {
  if (loading.value || cards.value.length === 0 || currentIndex.value >= cards.value.length) return

  // Space lật thẻ
  if (e.code === 'Space') {
    e.preventDefault()
    flipCard()
  }

  // Phím số 1, 2, 3, 4 chọn mức độ nhớ (chỉ khả dụng sau khi lật thẻ xem đáp án)
  if (isFlipped.value) {
    if (e.key === '1') {
      submitRating(1)
    } else if (e.key === '2') {
      submitRating(2)
    } else if (e.key === '3') {
      submitRating(3)
    } else if (e.key === '4') {
      submitRating(4)
    }
  }
}

onMounted(() => {
  loadSessionData()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.review-page {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.4s ease both;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.deck-info-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.deck-title { font-size: 1.5rem; font-weight: 800; }
.session-badge {
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.loading-state, .finished-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
.celebrate-icon { font-size: 3.5rem; margin-bottom: 20px; animation: bounce 1.5s infinite; }
.finished-state h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; color: #fff; }
.finished-state p { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 12px; }
.algorithm-tip { font-style: italic; max-width: 450px; font-size: 0.85rem !important; }
.finished-actions { margin-top: 24px; }

/* Review Active Container */
.review-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.progress-info strong { color: #f8fafc; }
.progress-bar-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #117c75, #AA8C2C);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(17,124,117, 0.4);
}

.hotkeys-tip {
  font-size: 0.8rem;
  color: #71717a;
  text-align: center;
}

/* 3D Flashcard CSS */
.card-scene {
  width: 100%;
  height: 380px;
  perspective: 1000px;
  cursor: pointer;
}

.flashcard {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flashcard.is-flipped {
  transform: rotateY(180deg);
}

.card-side {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: rgba(13, 18, 32, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(15px);
}

/* Thêm viền sáng nhẹ theo màu sắc của Bộ thẻ */
.card-front {
  border-left: 5px solid var(--card-accent);
}
.card-back {
  border-right: 5px solid var(--card-accent);
  transform: rotateY(180deg);
}

.card-banner {
  position: absolute;
  top: 16px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #71717a;
  background: rgba(255, 255, 255, 0.03);
  padding: 3px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-content-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.6;
  text-align: center;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 90%;
  overflow-y: auto;
}

.card-action-hint {
  position: absolute;
  bottom: 20px;
  font-size: 0.75rem;
  color: #71717a;
  animation: pulse-hint 2s infinite;
}
@keyframes pulse-hint {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

/* Rating Panel styling */
.rating-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.rating-title {
  font-size: 0.92rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #117c75;
  letter-spacing: 0.05em;
  text-align: left;
}

.rating-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 600px) {
  .rating-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

.rating-btn {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  padding: 12px 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.rating-number {
  font-size: 0.72rem;
  font-weight: 800;
  background: rgba(255,255,255,0.05);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}
.rating-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f8fafc;
}
.rating-desc {
  font-size: 0.68rem;
  color: #71717a;
}

/* Hover States for rating buttons with neon accents */
.btn-again:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
}
.btn-again:hover .rating-number { background: #ef4444; color: #fff; }
.btn-again:hover .rating-text { color: #fca5a5; }

.btn-hard:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.4);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
}
.btn-hard:hover .rating-number { background: #f97316; color: #fff; }
.btn-hard:hover .rating-text { color: #ffedd5; }

.btn-good:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
}
.btn-good:hover .rating-number { background: #3b82f6; color: #fff; }
.btn-good:hover .rating-text { color: #dbeafe; }

.btn-easy:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}
.btn-easy:hover .rating-number { background: #10b981; color: #fff; }
.btn-easy:hover .rating-text { color: #d1fae5; }

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
