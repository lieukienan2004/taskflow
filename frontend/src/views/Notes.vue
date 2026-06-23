<template>
  <div class="notes-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">📝 Ghi Chú Nhanh</h1>
        <p class="page-subtitle">Phác thảo ý tưởng của bạn – Lưu trữ tức thì, chuyển thành Công việc trong chớp mắt!</p>
      </div>
      <div class="header-actions" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <button class="btn random-quiz-btn" @click="openQuizCenter" style="display: flex; align-items: center; gap: 6px; padding: 10px 18px; border: 1px solid rgba(17,124,117, 0.3); background: rgba(17,124,117, 0.05); color: #117c75; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
          🤖 Ôn Tập AI Quiz
        </button>
        <button class="btn btn-primary add-note-btn" @click="createNewNote">
          ➕ Viết Ghi Chú Mới
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="filter-row glass-card">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm ghi chú theo tiêu đề hoặc nội dung..." 
          class="search-input"
        />
      </div>
      <div class="notes-count">
        Tổng số: <strong>{{ filteredNotes.length }}</strong> ghi chú
      </div>
    </div>

    <!-- Notes Grid -->
    <div v-if="filteredNotes.length === 0" class="empty-state glass-card">
      <div class="empty-icon">💡</div>
      <h3>Không tìm thấy ghi chú nào</h3>
      <p>Hãy nhấn nút "Viết Ghi Chú Mới" ở góc trên bên phải để bắt đầu ghi lại ý tưởng đầu tiên của bạn!</p>
    </div>

    <div v-else class="notes-grid">
      <div 
        v-for="note in filteredNotes" 
        :key="note.id" 
        class="note-card glass-card"
        :style="{ '--note-color': note.color, borderColor: note.color }"
      >
        <!-- Card Header with Color Palette & Actions -->
        <div class="note-card-header">
          <div class="color-palette">
            <span 
              v-for="c in colors" 
              :key="c.value" 
              class="color-dot" 
              :style="{ background: c.value }"
              :class="{ active: note.color === c.value }"
              @click="changeNoteColor(note.id, c.value)"
              :title="c.name"
            ></span>
          </div>
          <button class="action-btn delete-btn" @click="deleteNote(note.id)" title="Xóa ghi chú">
            ✕
          </button>
        </div>

        <!-- Note Body -->
        <div class="note-card-body" @click="openEditModal(note)">
          <h3 class="note-card-title">{{ note.title || 'Chưa đặt tiêu đề' }}</h3>
          <p class="note-card-content">{{ note.content || 'Nhấn vào đây để viết nội dung chi tiết...' }}</p>
          <div class="note-date">🕒 Cập nhật: {{ formatDate(note.updated_at || note.updatedAt) }}</div>
        </div>

        <!-- Note Footer / Convert to Task Trigger -->
        <div class="note-card-footer" style="display: flex; gap: 8px; justify-content: flex-end; width: 100%;">
          <button class="btn btn-convert quiz-btn" @click="startQuizGeneration(note)" style="flex: 1; text-align: center; justify-content: center; display: flex; align-items: center; gap: 4px;">
            🤖 Tạo Quiz AI
          </button>
          <button class="btn btn-convert" @click="startConversion(note)" style="flex: 1; text-align: center; justify-content: center; display: flex; align-items: center; gap: 4px;">
            🚀 Chuyển Task
          </button>
        </div>

      </div>
    </div>

    <!-- Edit Modal -->
    <transition name="fade">
      <div v-if="editingNote" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content glass-card" :style="{ borderColor: editingNote.color }">
          <div class="modal-header">
            <h3>Sửa Ghi Chú</h3>
            <button class="close-btn" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body">
            <input 
              v-model="editingNote.title" 
              type="text" 
              placeholder="Tiêu đề ghi chú..." 
              class="modal-title-input" 
              @input="saveNotes(editingNote)"
            />
            <textarea 
              v-model="editingNote.content" 
              placeholder="Nội dung chi tiết..." 
              class="modal-content-textarea"
              rows="8"
              @input="saveNotes(editingNote)"
            ></textarea>
          </div>
          <div class="modal-footer">
            <div class="color-palette">
              <span 
                v-for="c in colors" 
                :key="c.value" 
                class="color-dot" 
                :style="{ background: c.value }"
                :class="{ active: editingNote.color === c.value }"
                @click="editingNote.color = c.value; saveNotes(editingNote)"
              ></span>
            </div>
            <button class="btn btn-primary" @click="closeEditModal">Đóng</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Convert to Task Modal -->
    <transition name="fade">
      <div v-if="convertingNote" class="modal-overlay" @click.self="cancelConversion">
        <div class="modal-content glass-card" style="border-color: #117c75; max-width: 600px;">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px; font-weight: 800; letter-spacing: 0.02em;">🚀 Chuyển Thành Công Việc</h3>
            <button class="close-btn" @click="cancelConversion">✕</button>
          </div>
          <div class="modal-body">
            <div class="note-summary-preview">
              <span class="preview-label">Nội dung ghi chú:</span>
              <h4 class="preview-title">{{ convertingNote.title || 'Chưa đặt tiêu đề' }}</h4>
              <p class="preview-content">{{ convertingNote.content || 'Không có nội dung chi tiết.' }}</p>
            </div>
            
            <div class="premium-form-grid">
              <div class="premium-form-group">
                <label class="premium-label">Độ ưu tiên</label>
                <select v-model="convertForm.priority" class="premium-select">
                  <option value="low">🟡 Thấp (Low)</option>
                  <option value="medium">🟠 Trung bình (Medium)</option>
                  <option value="high">🔴 Cao (High)</option>
                </select>
              </div>
              <div class="premium-form-group">
                <label class="premium-label">Danh mục</label>
                <select v-model="convertForm.category" class="premium-select">
                  <option value="Chung">📁 Chung</option>
                  <option value="Cong viec">💼 Công việc</option>
                  <option value="Hoc tap">🎓 Học tập</option>
                  <option value="Ca nhan">👤 Cá nhân</option>
                  <option value="Suc khoe">❤️ Sức khỏe</option>
                </select>
              </div>
              <div class="premium-form-group full-width">
                <label class="premium-label">Hạn chót (Due date)</label>
                <input type="datetime-local" v-model="convertForm.due_date" class="premium-input" />
              </div>
            </div>
          </div>
          <div class="modal-footer" style="margin-top: 20px;">
            <button class="btn-premium-secondary" @click="cancelConversion">Hủy</button>
            <button class="btn-premium-primary" @click="confirmConversion" :disabled="converting">
              <span>{{ converting ? 'Đang tạo...' : 'Tạo Công Việc' }}</span>
              <svg v-if="!converting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- AI Quiz Modal -->
    <transition name="fade">
      <div v-if="showQuizModal" class="modal-overlay" @click.self="closeQuizModal">
        <div class="modal-content glass-card quiz-modal-content" :style="{ borderColor: quizNote?.color || '#117c75', maxWidth: '650px' }">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px; font-weight: 800;">
              🤖 Trắc Nghiệm AI Quiz
              <span v-if="isRandomQuiz" class="premium-badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-size: 0.65em; padding: 2px 8px; border-radius: 99px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">🎲 Ôn Tập Ngẫu Nhiên</span>
            </h3>
            <button class="close-btn" @click="closeQuizModal">✕</button>
          </div>
          <div v-if="quizNote" class="quiz-topic-subheader" style="padding: 10px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85em; opacity: 0.6; color: #94a3b8;">Chủ đề ghi chú:</span>
            <span style="font-size: 0.9em; font-weight: 700; color: #117c75;">{{ quizNote?.title || 'Chưa đặt tiêu đề' }}</span>
          </div>

          <!-- Loading State -->
          <div v-if="loadingQuiz" class="quiz-loading-state">
            <div class="ai-brain-pulse">🧠</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill"></div>
            </div>
            <h4>{{ loadingMessage }}</h4>
            <p>Trích xuất nội dung cốt lõi và biên soạn bộ câu hỏi ôn tập chất lượng cao.</p>
          </div>

          <!-- Error State -->
          <div v-else-if="quizError" class="quiz-error-state">
            <div class="error-icon">⚠️</div>
            <h4>Gặp lỗi khi tạo câu hỏi</h4>
            <p>{{ quizError }}</p>
            <button class="btn btn-primary" @click="startQuizGeneration(quizNote)">Thử lại</button>
          </div>

          <!-- Quiz Active State -->
          <div v-else-if="quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length" class="quiz-active-state">
            <div class="quiz-progress-header">
              <span class="question-counter">Câu hỏi <strong>{{ currentQuestionIndex + 1 }}</strong> trên {{ quizQuestions.length }}</span>
              <div class="mini-progress-track">
                <div class="mini-progress-fill" :style="{ width: ((currentQuestionIndex) / quizQuestions.length) * 100 + '%' }"></div>
              </div>
            </div>

            <div class="quiz-question-card">
              <h4 class="question-text">{{ quizQuestions[currentQuestionIndex].question }}</h4>

              <div class="quiz-options-list">
                <button 
                  v-for="(option, idx) in quizQuestions[currentQuestionIndex].options" 
                  :key="idx" 
                  class="option-item-btn"
                  :class="{
                    'selected': selectedAnswer === idx,
                    'correct': answerSubmitted && idx === quizQuestions[currentQuestionIndex].correctIndex,
                    'incorrect': answerSubmitted && selectedAnswer === idx && idx !== quizQuestions[currentQuestionIndex].correctIndex,
                    'disabled': answerSubmitted
                  }"
                  @click="submitAnswer(idx)"
                  :disabled="answerSubmitted"
                >
                  <span class="option-badge">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                  <span class="option-text-val">{{ option }}</span>
                </button>
              </div>

              <!-- Explanation Area -->
              <transition name="fade">
                <div v-if="answerSubmitted" class="explanation-box" :class="{ 'correct': selectedAnswer === quizQuestions[currentQuestionIndex].correctIndex }">
                  <div class="explanation-result">
                    <span v-if="selectedAnswer === quizQuestions[currentQuestionIndex].correctIndex" class="result-badge correct">✓ Chính xác!</span>
                    <span v-else class="result-badge incorrect">✕ Chưa chính xác!</span>
                    <span class="correct-answer-is">Đáp án đúng là: <strong>{{ ['A', 'B', 'C', 'D'][quizQuestions[currentQuestionIndex].correctIndex] }}</strong></span>
                  </div>
                  <p class="explanation-desc">💡 {{ quizQuestions[currentQuestionIndex].explanation }}</p>
                  
                  <div class="explanation-actions">
                    <button class="btn-premium-primary" @click="nextQuestion">
                      <span>{{ currentQuestionIndex === quizQuestions.length - 1 ? 'Xem Kết Quả ➔' : 'Câu Tiếp Theo ➔' }}</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Result State -->
          <div v-else-if="quizQuestions.length > 0 && currentQuestionIndex >= quizQuestions.length" class="quiz-result-state">
            <div class="result-trophy-wrap">
              <div v-if="score === 5" class="result-emoji shine-neon">🏆</div>
              <div v-else-if="score >= 3" class="result-emoji">🌟</div>
              <div v-else class="result-emoji">💪</div>
            </div>

            <h2 class="result-score-title">Kết quả ôn tập</h2>
            <div class="result-score-circle">
              <span class="score-num">{{ score }}</span>
              <span class="score-denom">/{{ quizQuestions.length }}</span>
            </div>

            <p class="result-feedback">
              {{ 
                score === 5 ? 'Tuyệt vời! Bạn đã thấu hiểu hoàn toàn nội dung ghi chú này.' :
                score >= 3 ? 'Khá tốt! Bạn đã nắm được phần lớn kiến thức cốt lõi.' :
                'Hãy đọc lại ghi chú và thử sức lại để củng cố thêm kiến thức nhé!'
              }}
            </p>

            <!-- Save as Flashcards area -->
            <div class="save-flashcard-box glass-card" v-if="!quizSavedAsFlashcard">
              <button v-if="!showSaveFlashcardForm" class="btn-premium-secondary save-fc-btn" @click="loadDecksForSaving" style="width: 100%;">
                💾 Lưu câu hỏi vào Bộ Thẻ (Flashcards)
              </button>

              <div v-else class="save-fc-form">
                <h4 class="form-title">Lưu 5 câu hỏi thành Flashcards</h4>
                
                <div class="form-group-wrap">
                  <label class="premium-label">Chọn Bộ Thẻ</label>
                  <select v-model="selectedDeckId" class="premium-select">
                    <option value="new">➕ Tạo bộ thẻ mới...</option>
                    <option v-for="deck in flashcardDecks" :key="deck.id" :value="deck.id">
                      📁 {{ deck.name }} ({{ deck.total_cards }} thẻ)
                    </option>
                  </select>
                </div>

                <div v-if="selectedDeckId === 'new'" class="form-group-wrap" style="margin-top: 12px;">
                  <label class="premium-label">Tên Bộ Thẻ Mới</label>
                  <input type="text" v-model="newDeckName" class="premium-input" placeholder="VD: Lịch sử Hệ điều hành" />
                </div>

                <div class="form-actions-wrap" style="margin-top: 16px; display: flex; gap: 8px; justify-content: flex-end;">
                  <button class="btn-premium-secondary btn-sm" @click="showSaveFlashcardForm = false" :disabled="savingToFlashcard">Hủy</button>
                  <button class="btn-premium-primary btn-sm" @click="saveQuizToFlashcard" :disabled="savingToFlashcard || (selectedDeckId === 'new' && !newDeckName.trim())">
                    <span>{{ savingToFlashcard ? 'Đang lưu...' : 'Lưu Ngay' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="save-flashcard-box success-save glass-card" v-else>
              <span class="save-success-icon">✓</span>
              <h4>Đã lưu thành công vào Flashcards!</h4>
              <p>Bạn có thể vào mục Flashcards để ôn tập lại bằng thuật toán Spaced Repetition.</p>
            </div>

            <div class="result-actions" style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
              <button class="btn btn-secondary" @click="restartQuiz">🔄 Làm lại</button>
              <button class="btn btn-primary" @click="closeQuizModal">Đóng</button>
            </div>
          </div>

          <!-- Setup Mode (Select Note / Drag & Drop File) -->
          <div v-else class="quiz-setup-state" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <div class="setup-intro" style="text-align: center; margin-bottom: 8px;">
              <h4 style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">Chào mừng tới Trung tâm Ôn tập AI Quiz! 🧠</h4>
              <p style="font-size: 0.85rem; color: #a1a1aa;">Tải file lên hoặc chọn nguồn để AI tạo bộ câu hỏi trắc nghiệm ngẫu nhiên giúp bạn thuộc bài nhanh hơn.</p>
            </div>

            <!-- Drag & Drop Zone -->
            <div 
              class="quiz-dropzone"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="isDragging = false; handleQuizFileUpload($event)"
              @click="$refs.fileInput.click()"
              :class="{ 'dragging': isDragging }"
              style="border: 2px dashed rgba(17,124,117, 0.3); border-radius: 12px; padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: rgba(255, 255, 255, 0.01);"
            >
              <input 
                ref="fileInput" 
                type="file" 
                accept=".pdf,.txt,.md" 
                style="display: none;" 
                @change="handleQuizFileUpload"
              />
              <div class="dropzone-icon" style="font-size: 2.5rem; margin-bottom: 12px; filter: drop-shadow(0 0 10px rgba(17,124,117, 0.2));">📁</div>
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #e2e8f0; margin-bottom: 4px;">Kéo & thả tài liệu của bạn vào đây</h5>
              <p style="font-size: 0.8rem; color: #71717a;">Hỗ trợ định dạng PDF, TXT, MD (Tối đa 15MB)</p>
              <button class="btn btn-sm btn-premium-secondary" style="margin-top: 12px; pointer-events: none;">Chọn Tệp Từ Máy</button>
            </div>

            <div class="setup-divider" style="display: flex; align-items: center; text-align: center; color: #4b5563; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 8px 0;">
              <span style="flex: 1; border-bottom: 1px solid rgba(255,255,255,0.06); margin-right: 12px;"></span>
              Hoặc chọn ghi chú học tập
              <span style="flex: 1; border-bottom: 1px solid rgba(255,255,255,0.06); margin-left: 12px;"></span>
            </div>

            <!-- Existing Notes Selector -->
            <div class="setup-options-grid" style="display: grid; grid-template-columns: 1fr; gap: 12px;">
              <div class="form-group-wrap">
                <div style="display: flex; gap: 8px;">
                  <select v-model="selectedNoteId" class="premium-select" style="flex: 1; padding: 10px 12px; font-size: 0.88rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white;">
                    <option value="" disabled>-- Chọn một ghi chú có sẵn --</option>
                    <option v-for="note in notes.filter(n => n.content && n.content.trim())" :key="note.id" :value="note.id">
                      📝 {{ note.title || 'Chưa đặt tiêu đề' }} ({{ note.content.length }} ký tự)
                    </option>
                  </select>
                  <button 
                    class="btn btn-primary" 
                    :disabled="!selectedNoteId"
                    @click="startQuizFromSelectedNote"
                    style="padding: 0 16px; border-radius: 8px; font-weight: 600;"
                  >
                    Bắt Đầu
                  </button>
                </div>
              </div>

              <!-- Quick Random Button -->
              <button 
                class="btn random-quiz-btn" 
                @click="startRandomQuiz" 
                style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border: 1px solid rgba(17,124,117, 0.3); background: rgba(17,124,117, 0.05); color: #117c75; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; width: 100%; margin-top: 4px;"
              >
                🎲 Ôn Tập Ngẫu Nhiên Từ Ghi Chú Bất Kỳ
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import confetti from '@/utils/confettiHelper'
import { aiApi, flashcardApi, noteApi } from '@/api/taskApi'

const taskStore = useTaskStore()
const notes = ref([])
const searchQuery = ref('')

// Colors palette with gorgeous dark glassmorphic accent colors
const colors = [
  { name: 'Tím', value: '#117c75' },
  { name: 'Tím khói', value: '#2dd4bf' },
  { name: 'Xanh ngọc', value: '#14B8A6' },
  { name: 'Hồng san hô', value: '#F43F5E' },
  { name: 'Xanh Indigo', value: '#6366F1' }
]

// Conversion states
const convertingNote = ref(null)
const converting = ref(false)
const convertForm = ref({
  priority: 'medium',
  category: 'Chung',
  due_date: ''
})

// Editing states
const editingNote = ref(null)

// AI Quiz States
const showQuizModal = ref(false)
const quizNote = ref(null)
const quizQuestions = ref([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const answerSubmitted = ref(false)
const score = ref(0)
const loadingQuiz = ref(false)
const quizError = ref(null)
const isRandomQuiz = ref(false)
const selectedNoteId = ref('')
const isDragging = ref(false)
const loadingMessage = ref('AI đang phân tích ghi chú...')

// Flashcard saving states
const savingToFlashcard = ref(false)
const flashcardDecks = ref([])
const selectedDeckId = ref('new')
const newDeckName = ref('')
const showSaveFlashcardForm = ref(false)
const quizSavedAsFlashcard = ref(false)

// Open general Quiz Center modal
const openQuizCenter = () => {
  quizNote.value = null
  isRandomQuiz.value = false
  selectedNoteId.value = ''
  quizQuestions.value = []
  quizError.value = null
  loadingQuiz.value = false
  showQuizModal.value = true
}

// Start quiz generation
const startQuizGeneration = async (note, isRandom = false) => {
  isRandomQuiz.value = isRandom
  quizNote.value = note
  showQuizModal.value = true
  quizQuestions.value = []
  currentQuestionIndex.value = 0
  score.value = 0
  quizError.value = null
  selectedAnswer.value = null
  answerSubmitted.value = false
  quizSavedAsFlashcard.value = false
  showSaveFlashcardForm.value = false

  if (!note.content || !note.content.trim()) {
    quizError.value = 'Nội dung ghi chú trống. Vui lòng nhập thêm thông tin chi tiết vào ghi chú để AI có thể phân tích và tạo câu hỏi trắc nghiệm.'
    return
  }

  loadingMessage.value = 'AI đang phân tích ghi chú...'
  loadingQuiz.value = true
  try {
    const res = await aiApi.quizFromNote(note.title || 'Ghi chú', note.content)
    if (res.data.success && res.data.data) {
      quizQuestions.value = res.data.data
    } else {
      quizError.value = 'Không nhận được dữ liệu câu hỏi từ AI.'
    }
  } catch (err) {
    console.error('Quiz generation error:', err)
    quizError.value = err.response?.data?.message || 'Không thể kết nối hoặc tải bộ câu hỏi từ AI.'
  } finally {
    loadingQuiz.value = false
  }
}

// Start random quiz from existing notes
const startRandomQuiz = () => {
  const validNotes = notes.value.filter(n => n.content && n.content.trim())
  if (validNotes.length === 0) {
    taskStore.showToast('⚠️ Bạn chưa có ghi chú nào chứa nội dung để ôn tập!', 'warning')
    return
  }
  const randomNote = validNotes[Math.floor(Math.random() * validNotes.length)]
  taskStore.showToast(`🎲 Đã chọn ngẫu nhiên chủ đề: "${randomNote.title || 'Ghi chú học tập'}"`, 'info')
  startQuizGeneration(randomNote, true)
}

// Start quiz from selected dropdown note
const startQuizFromSelectedNote = () => {
  const selectedNote = notes.value.find(n => n.id === selectedNoteId.value)
  if (selectedNote) {
    startQuizGeneration(selectedNote, false)
  }
}

// Dynamically load PDF.js CDN library
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(window.pdfjsLib)
    }
    script.onerror = () => {
      reject(new Error('Không thể tải thư viện giải mã PDF. Vui lòng kiểm tra kết nối mạng.'))
    }
    document.head.appendChild(script)
  })
}

// Extract raw text from PDF ArrayBuffer using pdf.js
const extractTextFromPdf = async (arrayBuffer) => {
  const pdfjsLib = await loadPdfJs()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map(item => item.str)
    text += strings.join(' ') + '\n'
  }
  return text
}

// Handle Drag & Drop or Click Upload document file for Quiz Center
const handleQuizFileUpload = async (event) => {
  const file = event.target.files?.[0] || event.dataTransfer?.files?.[0]
  if (!file) return

  loadingQuiz.value = true
  quizQuestions.value = []
  quizError.value = null
  showSaveFlashcardForm.value = false
  quizSavedAsFlashcard.value = false
  
  quizNote.value = {
    title: file.name,
    color: '#117c75'
  }

  try {
    let extractedText = ''
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      loadingMessage.value = 'Đang trích xuất nội dung từ tệp PDF...'
      const arrayBuffer = await file.arrayBuffer()
      extractedText = await extractTextFromPdf(arrayBuffer)
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      loadingMessage.value = 'Đang đọc nội dung tệp văn bản...'
      extractedText = await file.text()
    } else {
      throw new Error('Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp PDF, TXT hoặc MD.')
    }

    if (!extractedText || !extractedText.trim()) {
      throw new Error('Tệp tải lên không chứa dữ liệu chữ hoặc không thể trích xuất chữ.')
    }

    loadingMessage.value = 'AI đang phân tích tài liệu và tạo câu hỏi ôn tập...'
    const res = await aiApi.quizFromNote(file.name, extractedText)
    if (res.data.success && res.data.data) {
      quizQuestions.value = res.data.data
    } else {
      quizError.value = 'Không nhận được dữ liệu câu hỏi từ AI.'
    }
  } catch (err) {
    console.error('File quiz generation error:', err)
    quizError.value = err.message || err.response?.data?.message || 'Không thể kết nối hoặc tải bộ câu hỏi từ AI.'
  } finally {
    loadingQuiz.value = false
  }
}

// Submit answer
const submitAnswer = (idx) => {
  if (answerSubmitted.value) return
  selectedAnswer.value = idx
  answerSubmitted.value = true

  const correctIdx = quizQuestions.value[currentQuestionIndex.value].correctIndex
  if (idx === correctIdx) {
    score.value++
    taskStore.showToast('✨ Chính xác! +1 điểm', 'success')
  } else {
    taskStore.showToast('❌ Sai rồi! Hãy đọc kỹ lời giải.', 'error')
  }
}

// Next question
const nextQuestion = () => {
  selectedAnswer.value = null
  answerSubmitted.value = false
  currentQuestionIndex.value++

  if (currentQuestionIndex.value >= quizQuestions.value.length) {
    if (score.value === quizQuestions.value.length) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#117c75', '#ffffff', '#34d399', '#fcd34d']
      })
    }
  }
}

// Restart quiz
const restartQuiz = () => {
  currentQuestionIndex.value = 0
  score.value = 0
  selectedAnswer.value = null
  answerSubmitted.value = false
  quizSavedAsFlashcard.value = false
  showSaveFlashcardForm.value = false
}

// Close quiz modal
const closeQuizModal = () => {
  showQuizModal.value = false
  quizNote.value = null
  quizQuestions.value = []
}

// Load decks for saving
const loadDecksForSaving = async () => {
  try {
    const res = await flashcardApi.getDecks()
    if (res.data.success) {
      flashcardDecks.value = res.data.data
    }
    selectedDeckId.value = 'new'
    newDeckName.value = 'Quiz: ' + (quizNote.value?.title || 'Ghi chú học tập')
    showSaveFlashcardForm.value = true
  } catch (err) {
    console.error('Error loading decks:', err)
    taskStore.showToast('❌ Không thể tải danh sách bộ thẻ', 'error')
  }
}

// Save quiz to flashcards
const saveQuizToFlashcard = async () => {
  if (selectedDeckId.value === 'new' && !newDeckName.value.trim()) {
    taskStore.showToast('❌ Vui lòng nhập tên bộ thẻ mới', 'error')
    return
  }

  savingToFlashcard.value = true
  try {
    let deckId = selectedDeckId.value

    if (deckId === 'new') {
      const deckRes = await flashcardApi.createDeck({
        name: newDeckName.value.trim(),
        description: 'Tự động tạo từ trắc nghiệm ghi chú: ' + (quizNote.value?.title || 'Chưa đặt tên'),
        color: quizNote.value?.color || '#117c75'
      })
      if (deckRes.data.success && deckRes.data.data) {
        deckId = deckRes.data.data.id
      } else {
        throw new Error('Không thể tạo bộ thẻ mới')
      }
    }

    for (const q of quizQuestions.value) {
      const optionsText = q.options.map((opt, i) => `${['A', 'B', 'C', 'D'][i]}. ${opt}`).join('\n')
      const front = `**[QUIZ]** ${q.question}\n\n${optionsText}`
      const back = `**ĐÁP ÁN ĐÚNG: ${['A', 'B', 'C', 'D'][q.correctIndex]}**\n\n*Giải thích:* ${q.explanation}`

      await flashcardApi.createCard({
        deck_id: deckId,
        front,
        back
      })
    }

    taskStore.showToast('💾 Đã lưu 5 câu hỏi vào Bộ Thẻ thành công!')
    quizSavedAsFlashcard.value = true
  } catch (err) {
    console.error('Error saving quiz to flashcards:', err)
    taskStore.showToast('❌ Gặp lỗi khi lưu bộ thẻ', 'error')
  } finally {
    savingToFlashcard.value = false
  }
}

// Load notes from API
const loadNotes = async () => {
  try {
    const res = await noteApi.getAll()
    if (res.data.success) {
      notes.value = res.data.data
    }
  } catch (err) {
    console.error('Error loading notes:', err)
    taskStore.showToast('❌ Không thể tải ghi chú!', 'error')
  }
}

// Save note changes to API (throttled)
let saveTimeout = null
const saveNotes = (note) => {
  if (!note || !note.id) return
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      await noteApi.update(note.id, {
        title: note.title || '',
        content: note.content || '',
        color: note.color
      })
    } catch (err) {
      console.error('Error saving note:', err)
    }
  }, 300)
}

// Create new note
const createNewNote = async () => {
  try {
    const res = await noteApi.create({
      title: '',
      content: '',
      color: colors[Math.floor(Math.random() * colors.length)].value
    })
    if (res.data.success) {
      notes.value.unshift(res.data.data)
      openEditModal(res.data.data)
    }
  } catch (err) {
    console.error('Error creating note:', err)
    taskStore.showToast('❌ Không thể tạo ghi chú!', 'error')
  }
}

// Change note color
const changeNoteColor = async (id, color) => {
  const note = notes.value.find(n => n.id === id)
  if (note) {
    note.color = color
    try {
      await noteApi.update(id, { color })
    } catch (err) {
      console.error('Error updating note color:', err)
    }
  }
}

// Delete note
const deleteNote = async (id) => {
  try {
    await noteApi.delete(id)
    notes.value = notes.value.filter(n => n.id !== id)
    taskStore.showToast('🗑️ Đã xóa ghi chú thành công!')
  } catch (err) {
    console.error('Error deleting note:', err)
    taskStore.showToast('❌ Không thể xóa ghi chú!', 'error')
  }
}

// Search and filter notes
const filteredNotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return notes.value
  return notes.value.filter(n => 
    (n.title || '').toLowerCase().includes(query) || 
    (n.content || '').toLowerCase().includes(query)
  )
})

// Format dates
const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Open / Close editing modal
const openEditModal = (note) => {
  editingNote.value = { ...note }
}

const closeEditModal = async () => {
  if (editingNote.value) {
    const idx = notes.value.findIndex(n => n.id === editingNote.value.id)
    if (idx !== -1) {
      notes.value[idx] = { ...editingNote.value }
      try {
        await noteApi.update(editingNote.value.id, {
          title: editingNote.value.title || '',
          content: editingNote.value.content || '',
          color: editingNote.value.color
        })
      } catch (err) {
        console.error('Error saving note:', err)
      }
    }
    editingNote.value = null
  }
}

// Start conversion
const startConversion = (note) => {
  convertingNote.value = note
  // Set default due date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  
  // Format for local datetime input: YYYY-MM-DDTHH:MM
  const offset = tomorrow.getTimezoneOffset()
  const localTomorrow = new Date(tomorrow.getTime() - (offset * 60 * 1000))
  convertForm.value = {
    priority: 'medium',
    category: 'Chung',
    due_date: localTomorrow.toISOString().slice(0, 16)
  }
}

const cancelConversion = () => {
  convertingNote.value = null
}

const confirmConversion = async () => {
  const note = convertingNote.value
  if (!note || !note.title.trim()) {
    taskStore.showToast('❌ Vui lòng đặt tiêu đề cho ghi chú trước khi chuyển thành công việc!', 'error')
    return
  }

  converting.value = true
  try {
    // Send task creation request to server
    await taskStore.createTask({
      title: note.title,
      description: note.content || 'Được tạo từ ghi chú nhanh.',
      priority: convertForm.value.priority,
      category: convertForm.value.category,
      due_date: convertForm.value.due_date ? new Date(convertForm.value.due_date).toISOString() : null,
      status: 'todo'
    })

    // Confetti effect!
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#117c75', '#ffffff', '#34d399', '#fcd34d', note.color]
    })

    // Toast success
    taskStore.showToast('🚀 Đã chuyển đổi ghi chú thành công việc trên hệ thống!')

    // Remove note from list and server
    notes.value = notes.value.filter(n => n.id !== note.id)
    try {
      await noteApi.delete(note.id)
    } catch (err) {
      console.error('Error deleting converted note:', err)
    }

    // Increment converted notes count for achievements
    taskStore.incrementConvertedNotes()

    // Reset conversion state
    convertingNote.value = null
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Chuyển đổi công việc thất bại!', 'error')
  } finally {
    converting.value = false
  }
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.notes-page {
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

.add-note-btn {
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(17,124,117, 0.3);
  transition: all 0.3s ease;
}
.add-note-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17,124,117, 0.5);
}

/* Filters & Search */
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  gap: 20px;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  transition: all 0.3s ease;
}
.search-box:focus-within {
  border-color: rgba(17,124,117, 0.5);
  box-shadow: 0 0 10px rgba(17,124,117, 0.15);
  background: rgba(255, 255, 255, 0.05);
}
.search-box svg {
  width: 18px;
  height: 18px;
  color: #a1a1aa;
}
.search-input {
  background: transparent;
  border: none;
  color: #f8fafc;
  width: 100%;
  outline: none;
  font-size: 0.92rem;
  font-family: inherit;
}
.notes-count {
  font-size: 0.88rem;
  color: #a1a1aa;
  flex-shrink: 0;
}
.notes-count strong {
  color: #117c75;
  font-size: 1rem;
}

/* Grid layout */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.note-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 240px;
  padding: 20px;
  border-left: 5px solid var(--note-color) !important;
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(var(--note-color), 0.15);
}

/* Note Card Header */
.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}
.note-card:hover .note-card-header {
  opacity: 1;
}
.color-palette {
  display: flex;
  gap: 6px;
}
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease;
}
.color-dot:hover {
  transform: scale(1.3);
}
.color-dot.active {
  border: 1px solid #fff;
  box-shadow: 0 0 6px currentColor;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #a1a1aa;
  transition: all 0.2s ease;
}
.delete-btn:hover {
  color: #ef4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  transform: scale(1.1);
}

/* Note Card Body */
.note-card-body {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.note-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.4;
  word-break: break-word;
}
.note-card-content {
  font-size: 0.9rem;
  color: #d1d5db;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.note-date {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: auto;
}

/* Convert Button */
.note-card-footer {
  margin-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.btn-convert {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a1a1aa;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}
.note-card:hover .btn-convert {
  background: rgba(17,124,117, 0.1);
  border-color: rgba(17,124,117, 0.4);
  color: #117c75;
  box-shadow: 0 0 10px rgba(17,124,117, 0.15);
}
.btn-convert:hover {
  background: #117c75 !important;
  color: #050508 !important;
  transform: scale(1.02);
}

/* Upgraded Preview Container */
.note-summary-preview {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(17,124,117, 0.02) 100%);
  border-left: 3px solid #117c75;
  border-top: 1px solid rgba(17,124,117, 0.08);
  border-right: 1px solid rgba(17,124,117, 0.08);
  border-bottom: 1px solid rgba(17,124,117, 0.08);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.preview-label {
  font-size: 0.72rem;
  color: #71717a;
  text-transform: uppercase;
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}
.preview-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 6px;
}
.preview-content {
  font-size: 0.88rem;
  color: #a1a1aa;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}

/* Premium Form Custom Styles */
.premium-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 10px;
}
@media (max-width: 600px) {
  .premium-form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.premium-form-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  gap: 8px;
}
.premium-form-group.full-width {
  grid-column: 1 / -1;
}

.premium-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #117c75;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
  text-shadow: 0 0 10px rgba(17,124,117, 0.2);
}

.premium-select, .premium-input {
  width: 100%;
  background: rgba(13, 18, 30, 0.85);
  border: 1px solid rgba(17,124,117, 0.2);
  border-radius: var(--radius-md);
  color: #f8fafc;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  outline: none;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.premium-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  padding-right: 46px;
}

.premium-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(72%) sepia(50%) saturate(450%) hue-rotate(5deg) brightness(95%) contrast(85%);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.premium-input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  transform: scale(1.15);
}

.premium-select:hover, .premium-input:hover {
  border-color: rgba(17,124,117, 0.4);
  background: rgba(255, 255, 255, 0.02);
  box-shadow: 0 0 10px rgba(17,124,117, 0.1);
}
.premium-select:focus, .premium-input:focus {
  border-color: #117c75;
  background: rgba(13, 18, 30, 0.95);
  box-shadow: 0 0 15px rgba(17,124,117, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.8);
}

.premium-select option {
  background-color: #0d1220;
  color: #f8fafc;
  padding: 12px;
}

/* Premium Footer Buttons */
.btn-premium-secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #a1a1aa;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-premium-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}

.btn-premium-primary {
  background: linear-gradient(135deg, #F9D423 0%, #FF4E50 100%);
  border: none;
  color: #000;
  padding: 12px 28px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 78, 80, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-premium-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 78, 80, 0.4), 0 0 15px rgba(249, 212, 35, 0.3);
  filter: brightness(1.1);
}
.btn-premium-primary:active {
  transform: translateY(0);
}
.btn-premium-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Edit Modal */
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
  max-width: 580px;
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
.modal-header h3 { font-size: 1.25rem; font-weight: 700; color: #f8fafc; }
.close-btn {
  background: transparent;
  border: none;
  color: #a1a1aa;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s ease;
}
.close-btn:hover { color: #f8fafc; }

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}
.modal-title-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: #f8fafc;
  padding: 12px 16px;
  font-size: 1.1rem;
  font-weight: 700;
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
}
.modal-title-input:focus {
  border-color: rgba(255, 255, 255, 0.2);
}
.modal-content-textarea {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: #f8fafc;
  padding: 16px;
  font-size: 0.95rem;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
}
.modal-content-textarea:focus {
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  gap: 12px;
}
.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 15px rgba(17,124,117, 0.3));
}
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: #f8fafc; }
.empty-state p { color: #a1a1aa; font-size: 0.9rem; max-width: 420px; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .header-actions { width: 100%; flex-wrap: wrap; }
  .header-actions .btn { flex: 1; justify-content: center; min-width: 0; }
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    gap: 12px;
  }
  .search-box { width: 100%; }
  .notes-count { text-align: center; }
  .notes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .note-card { min-height: 200px; padding: 16px; }
  .note-card-title { font-size: 1rem; }
  .note-card-content { font-size: 0.85rem; -webkit-line-clamp: 3; }
}
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .add-note-btn { width: 100%; }
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
  }
}

/* AI Quiz Modal Custom Styles */
.quiz-btn:hover {
  background: rgba(20, 184, 166, 0.1) !important;
  border-color: rgba(20, 184, 166, 0.4) !important;
  color: #14B8A6 !important;
  box-shadow: 0 0 10px rgba(20, 184, 166, 0.15) !important;
}
.quiz-btn:active {
  transform: scale(0.98);
}
.quiz-modal-content {
  background: rgba(13, 18, 32, 0.98) !important;
}
.quiz-loading-state, .quiz-error-state, .quiz-result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px 10px;
}
.ai-brain-pulse {
  font-size: 3.5rem;
  margin-bottom: 20px;
  animation: pulseBrain 1.5s infinite ease-in-out;
  filter: drop-shadow(0 0 15px rgba(20, 184, 166, 0.6));
}
@keyframes pulseBrain {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 25px rgba(20, 184, 166, 0.9)); }
  100% { transform: scale(1); opacity: 0.8; }
}
.progress-bar-container {
  width: 80%;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}
.progress-bar-fill {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, #14B8A6, #2dd4bf);
  border-radius: 3px;
  animation: progressPulse 2s infinite ease-in-out;
}
@keyframes progressPulse {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}
.quiz-loading-state h4, .quiz-error-state h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
}
.quiz-loading-state p, .quiz-error-state p {
  color: #a1a1aa;
  font-size: 0.9rem;
  max-width: 400px;
}
.error-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
  color: #ef4444;
}

.quiz-progress-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.question-counter {
  font-size: 0.88rem;
  color: #a1a1aa;
  text-align: left;
}
.question-counter strong {
  color: #117c75;
}
.mini-progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}
.mini-progress-fill {
  height: 100%;
  background: #117c75;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.quiz-question-card {
  text-align: left;
}
.question-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.5;
  margin-bottom: 20px;
  padding-left: 6px;
  border-left: 3px solid #117c75;
}

.quiz-options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.option-item-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  color: #e2e8f0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.option-item-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(17,124,117, 0.3);
  transform: translateX(4px);
}
.option-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #a1a1aa;
  flex-shrink: 0;
  transition: all 0.2s;
}
.option-item-btn:hover:not(.disabled) .option-badge {
  background: rgba(17,124,117, 0.15);
  border-color: rgba(17,124,117, 0.4);
  color: #117c75;
}

.option-item-btn.selected {
  background: rgba(17,124,117, 0.1);
  border-color: #117c75;
}
.option-item-btn.selected .option-badge {
  background: #117c75;
  color: #050508;
  border-color: #117c75;
}

.option-item-btn.correct {
  background: rgba(52, 211, 153, 0.08) !important;
  border-color: #34d399 !important;
  color: #34d399 !important;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.1);
}
.option-item-btn.correct .option-badge {
  background: #34d399 !important;
  color: #050508 !important;
  border-color: #34d399 !important;
}

.option-item-btn.incorrect {
  background: rgba(244, 63, 94, 0.08) !important;
  border-color: #f43f5e !important;
  color: #f43f5e !important;
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.1);
}
.option-item-btn.incorrect .option-badge {
  background: #f43f5e !important;
  color: #ffffff !important;
  border-color: #f43f5e !important;
}

.explanation-box {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid #71717a;
  border-radius: var(--radius-md);
  padding: 16px;
  margin-top: 20px;
  animation: slideDown 0.3s ease both;
}
.explanation-box.correct {
  border-left-color: #34d399;
  background: rgba(52, 211, 153, 0.01);
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.explanation-result {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.result-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}
.result-badge.correct { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.result-badge.incorrect { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }
.correct-answer-is {
  font-size: 0.85rem;
  color: #a1a1aa;
}
.correct-answer-is strong {
  color: #34d399;
}
.explanation-desc {
  font-size: 0.88rem;
  color: #d1d5db;
  line-height: 1.5;
  margin-bottom: 16px;
}
.explanation-actions {
  display: flex;
  justify-content: flex-end;
}

.result-trophy-wrap {
  margin-bottom: 16px;
}
.result-emoji {
  font-size: 4rem;
}
.result-emoji.shine-neon {
  filter: drop-shadow(0 0 15px rgba(249, 212, 35, 0.5));
  animation: trophyBounce 1s infinite alternate ease-in-out;
}
@keyframes trophyBounce {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-10px) scale(1.05); }
}
.result-score-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 12px;
}
.result-score-circle {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 24px;
  border-radius: 20px;
  margin-bottom: 16px;
}
.score-num {
  font-size: 2.5rem;
  font-weight: 900;
  color: #117c75;
  text-shadow: 0 0 15px rgba(17,124,117, 0.4);
}
.score-denom {
  font-size: 1.25rem;
  color: #71717a;
  font-weight: 700;
}
.result-feedback {
  font-size: 0.95rem;
  color: #a1a1aa;
  max-width: 440px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.save-flashcard-box {
  width: 100%;
  max-width: 440px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.01);
  margin-bottom: 10px;
}
.save-fc-btn {
  width: 100%;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: var(--radius-md);
}
.save-fc-form {
  text-align: left;
}
.save-fc-form .form-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 6px;
}
.form-group-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.save-flashcard-box.success-save {
  border-color: rgba(52, 211, 153, 0.15);
  background: rgba(52, 211, 153, 0.01);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
}
.save-success-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #34d399;
  color: #050508;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.save-flashcard-box.success-save h4 {
  font-size: 0.95rem;
  color: #34d399;
  font-weight: 700;
}
.save-flashcard-box.success-save p {
  font-size: 0.8rem;
  color: #a1a1aa;
  text-align: center;
}

.random-quiz-btn:hover {
  background: rgba(17,124,117, 0.12) !important;
  box-shadow: 0 0 15px rgba(17,124,117, 0.2);
  transform: translateY(-2px);
}
.random-quiz-btn:active {
  transform: translateY(0);
}

.quiz-dropzone {
  border: 2px dashed rgba(17,124,117, 0.3) !important;
  transition: all 0.3s ease !important;
}
.quiz-dropzone.dragging {
  border-color: #117c75 !important;
  background: rgba(17,124,117, 0.08) !important;
  transform: scale(1.02);
}
.quiz-dropzone:hover {
  border-color: #117c75 !important;
  background: rgba(255, 255, 255, 0.03) !important;
}
</style>
