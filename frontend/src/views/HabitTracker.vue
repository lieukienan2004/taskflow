<template>
  <div class="habit-tracker">
    <!-- HERO HEADER -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Quản Lý Thói Quen</h1>
          <p>Theo dõi và phát triển thói quen hàng ngày</p>
        </div>
      </div>
      <button class="btn-add" @click="showAddModal = true">
        + Thêm Thói Quen
      </button>
    </div>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Tổng số thói quen</div>
        <div class="stat-value">{{ habits.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Chuỗi dài nhất</div>
        <div class="stat-value">{{ longestStreak }} <span class="stat-unit">ngày</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Hoàn thành hôm nay</div>
        <div class="stat-value">{{ todayCompleted }}<span class="stat-divider">/</span>{{ habits.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tỷ lệ hoàn thành</div>
        <div class="stat-value">{{ completionRate }}<span class="stat-unit">%</span></div>
      </div>
    </div>

    <!-- HABITS LIST -->
    <div class="habits-container">
      <div v-if="habits.length === 0" class="empty-state">
        <div class="empty-content">
          <h3>Chưa có thói quen</h3>
          <p>Bắt đầu xây dựng thói quen tích cực ngay hôm nay</p>
          <button class="btn-empty" @click="showAddModal = true">Tạo thói quen đầu tiên</button>
        </div>
      </div>

      <div v-for="habit in habits" :key="habit.id" class="habit-card">
        <div class="habit-header">
          <div class="habit-info">
            <div class="habit-icon-large">{{ habit.icon }}</div>
            <div class="habit-text">
              <h3>{{ habit.name }}</h3>
              <p class="habit-description" v-if="habit.description">{{ habit.description }}</p>
            </div>
          </div>
          <div class="habit-actions">
            <button @click="editHabit(habit)" class="btn-icon" title="Chỉnh sửa">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.686 11.9447 1.59135C12.1735 1.49669 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49669 13.3879 1.59135C13.6167 1.686 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.503 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.503 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.6667L3.33301 11.3334L11.333 2.00004Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button @click="deleteHabit(habit.id)" class="btn-icon btn-delete" title="Xóa">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H3.33333H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="habit-calendar">
          <div class="weekday-row">
            <div class="weekday-cell" v-for="day in weekdays" :key="day">{{ day }}</div>
          </div>
          <div class="day-row">
            <div
              v-for="(day, index) in getLast30Days()"
              :key="index"
              class="day-cell"
              :class="getDayClass(habit, day)"
              :title="formatDate(day)"
              @click="toggleDay(habit, day)"
            >
              <span class="day-number">{{ formatDayNumber(day) }}</span>
              <span v-if="isToday(day)" class="today-marker"></span>
              <span v-if="getDayClass(habit, day).completed" class="check-mark">✓</span>
            </div>
          </div>
        </div>

        <div class="habit-footer">
          <div class="habit-badges">
            <span class="badge badge-streak">Chuỗi: {{ habit.current_streak }} ngày</span>
            <span class="badge badge-best">Tốt nhất: {{ habit.best_streak }} ngày</span>
          </div>
          <div class="habit-progress-section">
            <div class="progress-header">
              <span class="progress-label">TIẾN TRÌNH THÁNG</span>
              <span class="progress-value">{{ getCompletedDays(habit) }}/30 ngày</span>
            </div>
            <div class="progress-bar-wrapper">
              <div class="progress-bar">
                <div class="progress-bar-fill" :style="{ width: getHabitCompletionRate(habit) + '%' }"></div>
              </div>
              <span class="progress-percentage">{{ getHabitCompletionRate(habit) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingHabit ? 'Chỉnh Sửa Thói Quen' : 'Tạo Thói Quen Mới' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Tên thói quen</label>
            <input v-model="formData.name" type="text" placeholder="Nhập tên thói quen..." class="input" maxlength="50" />
          </div>
          <div class="form-group">
            <label class="form-label">Mô tả</label>
            <textarea v-model="formData.description" placeholder="Mô tả chi tiết về thói quen (không bắt buộc)" class="textarea" rows="3" maxlength="200"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Biểu tượng</label>
            <div class="icon-picker">
              <div v-for="icon in iconOptions" :key="icon" class="icon-option-wrapper" @click="formData.icon = icon">
                <div class="icon-option" :class="{ selected: formData.icon === icon }">
                  <span class="icon-emoji">{{ icon }}</span>
                </div>
                <span class="icon-label">{{ getIconTitle(icon) }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tần suất</label>
            <div class="goal-options">
              <label class="goal-card" :class="{ active: formData.goal === 'daily' }">
                <input type="radio" v-model="formData.goal" value="daily" class="hidden-radio" />
                <div class="goal-title">Hàng ngày</div>
              </label>
              <label class="goal-card" :class="{ active: formData.goal === 'weekly' }">
                <input type="radio" v-model="formData.goal" value="weekly" class="hidden-radio" />
                <div class="goal-title">Hàng tuần</div>
              </label>
              <label class="goal-card" :class="{ active: formData.goal === 'custom' }">
                <input type="radio" v-model="formData.goal" value="custom" class="hidden-radio" />
                <div class="goal-title">Tùy chỉnh</div>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-cancel">Hủy</button>
          <button @click="saveHabit" class="btn btn-save" :disabled="!formData.name">
            {{ editingHabit ? 'Lưu Thay Đổi' : 'Tạo Thói Quen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { habitApi } from '@/api/taskApi'

const habits = ref([])
const showAddModal = ref(false)
const editingHabit = ref(null)
const loading = ref(false)

const formData = ref({
  icon: '📚',
  name: '',
  description: '',
  goal: 'daily'
})

const iconOptions = ['📚', '💪', '🏃', '💻', '✍️', '🎯', '😴', '🎓']
const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

const longestStreak = computed(() => {
  if (habits.value.length === 0) return 0
  return Math.max(...habits.value.map(h => h.best_streak || 0))
})

const todayCompleted = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return habits.value.filter(h => h.completedDates?.includes(today)).length
})

const completionRate = computed(() => {
  if (habits.value.length === 0) return 0
  const last30Days = getLast30Days()
  const totalPossible = habits.value.length * 30
  const totalCompleted = habits.value.reduce((sum, habit) => {
    return sum + last30Days.filter(day =>
      habit.completedDates?.includes(day.toISOString().split('T')[0])
    ).length
  }, 0)
  return Math.round((totalCompleted / totalPossible) * 100)
})

function getIconTitle(icon) {
  const titles = {
    '📚': 'Đọc sách', '💪': 'Tập gym', '🏃': 'Chạy bộ', '💻': 'Học lập trình',
    '✍️': 'Viết lách', '🎯': 'Mục tiêu', '😴': 'Ngủ đủ', '🎓': 'Học tập'
  }
  return titles[icon] || 'Khác'
}

function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const day = new Date()
    day.setDate(day.getDate() - i)
    days.push(day)
  }
  return days
}

function getDayClass(habit, day) {
  const dateStr = day.toISOString().split('T')[0]
  const isCompleted = habit.completedDates?.includes(dateStr)
  const isFuture = day > new Date()
  return {
    completed: isCompleted,
    future: isFuture,
    today: isToday(day)
  }
}

function isToday(day) {
  const today = new Date()
  return day.toDateString() === today.toDateString()
}

function formatDate(day) {
  return day.toLocaleDateString('vi-VN')
}

function formatDayNumber(day) {
  return day.getDate()
}

async function toggleDay(habit, day) {
  const dateStr = day.toISOString().split('T')[0]
  if (day > new Date()) return
  try {
    const res = await habitApi.toggleDay(habit.id, dateStr)
    const idx = habits.value.findIndex(h => h.id === habit.id)
    if (idx !== -1) habits.value[idx] = res.data.data
  } catch (err) {
    console.error('Toggle habit error:', err)
  }
}

function getCompletedDays(habit) {
  const last30Days = getLast30Days()
  return last30Days.filter(day =>
    habit.completedDates?.includes(day.toISOString().split('T')[0])
  ).length
}

function getHabitCompletionRate(habit) {
  const completed = getCompletedDays(habit)
  return Math.round((completed / 30) * 100)
}

function getProgressGradient(habit) {
  const rate = getHabitCompletionRate(habit)
  if (rate >= 80) return 'linear-gradient(90deg, #10b981, #059669)'
  if (rate >= 50) return 'linear-gradient(90deg, #117c75, #117c75)'
  if (rate >= 20) return 'linear-gradient(90deg, #f59e0b, #d97706)'
  return 'linear-gradient(90deg, #e5e7eb, #cbd5e1)'
}

function editHabit(habit) {
  editingHabit.value = habit
  formData.value = { icon: habit.icon, name: habit.name, description: habit.description, goal: habit.goal }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingHabit.value = null
  formData.value = { icon: '📚', name: '', description: '', goal: 'daily' }
}

async function saveHabit() {
  if (!formData.value.name) return
  try {
    if (editingHabit.value) {
      const res = await habitApi.update(editingHabit.value.id, formData.value)
      const idx = habits.value.findIndex(h => h.id === editingHabit.value.id)
      if (idx !== -1) habits.value[idx] = res.data.data
    } else {
      const res = await habitApi.create(formData.value)
      habits.value.unshift(res.data.data)
    }
    closeModal()
  } catch (err) {
    console.error('Save habit error:', err)
  }
}

async function deleteHabit(id) {
  if (confirm('Bạn có chắc muốn xóa thói quen này?')) {
    try {
      await habitApi.delete(id)
      habits.value = habits.value.filter(h => h.id !== id)
    } catch (err) {
      console.error('Delete habit error:', err)
    }
  }
}

async function fetchHabits() {
  loading.value = true
  try {
    const res = await habitApi.getAll()
    habits.value = res.data.data || []
  } catch (err) {
    console.error('Fetch habits error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHabits)
</script>

<style scoped>
.habit-tracker {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* HERO */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.hero-content {
  display: flex;
  align-items: center;
}

.hero-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #5b21b6;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.hero-text p {
  color: #6b7280;
  margin: 0;
  font-weight: 400;
  font-size: 0.875rem;
}

.btn-add {
  background: linear-gradient(135deg, #117c75, #14b8a6);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.3);
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.4);
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-label {
  display: block;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #5b21b6;
  line-height: 1;
}

.stat-unit,
.stat-divider {
  font-size: 1rem;
  font-weight: 400;
  color: #9ca3af;
  margin-left: 0.25rem;
}

/* HABIT CARDS */
.habits-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.empty-state {
  grid-column: 1 / -1;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
  padding: 4rem 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.empty-state h3 {
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.btn-empty {
  background: #111827;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-empty:hover {
  background: #1f2937;
}

.habit-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.habit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.habit-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.habit-icon-large {
  width: 56px;
  height: 56px;
  background: #f0f4ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.habit-text {
  flex: 1;
  min-width: 0;
}

.habit-text h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
  line-height: 1.4;
}

.habit-description {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

.habit-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
}

.btn-delete:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* CALENDAR - Match Image Exactly */
.habit-calendar {
  margin-bottom: 1.5rem;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.weekday-cell {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b92ff;
  padding: 4px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.day-row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
}

.day-cell {
  aspect-ratio: 1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
}

.day-cell:hover:not(.future) {
  transform: scale(1.05);
  border-color: #10b981;
}

.day-cell.completed {
  background: #10b981;
  border-color: #10b981;
}

.day-cell.today {
  border: 2px solid #117c75;
}

.day-cell.future {
  opacity: 0.3;
  cursor: not-allowed;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  line-height: 1;
}

.day-cell.completed .day-number {
  color: white;
  font-weight: 700;
}

.today-marker {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

.check-mark {
  font-size: 0.75rem;
  color: white;
  font-weight: 900;
  margin-top: 2px;
}

/* FOOTER - Match Image Style */
.habit-footer {
  border-top: 1px solid #f3f4f6;
  padding-top: 1.25rem;
}

.habit-badges {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-streak {
  background: #ff9a3c;
  color: white;
}

.badge-best {
  background: #e6f7f5;
  color: #117c75;
}

.habit-progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #117c75;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #117c75, #14b8a6);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
  min-width: 42px;
  text-align: right;
}

/* MODAL - Modern & Clean */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f9fafb;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1.5rem;
  line-height: 1;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  background: white;
  font-family: inherit;
  color: #111827;
}

.input:hover,
.textarea:hover {
  border-color: #9ca3af;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #117c75;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.icon-option-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.icon-option {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.icon-option-wrapper:hover .icon-option {
  transform: scale(1.05);
  border-color: #c4b5fd;
  background: #e6f7f5;
}

.icon-option.selected {
  background: linear-gradient(135deg, #117c75, #14b8a6);
  border-color: #117c75;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(17,124,117, 0.3);
}

.icon-option.selected::after {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #10b981;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.icon-emoji {
  font-size: 2rem;
}

.icon-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.icon-option-wrapper:hover .icon-label {
  color: #5b21b6;
  font-weight: 600;
}

.icon-option.selected ~ .icon-label {
  color: #5b21b6;
  font-weight: 700;
}

.goal-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.goal-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  position: relative;
}

.goal-card:hover {
  border-color: #c4b5fd;
  background: #e6f7f5;
}

.goal-card.active {
  background: #e6f7f5;
  border-color: #117c75;
}

.goal-card.active::before {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #10b981;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.hidden-radio {
  display: none;
}

.goal-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.goal-card.active .goal-title {
  color: #5b21b6;
  font-weight: 700;
}

.modal-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn-cancel {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.btn-save {
  background: linear-gradient(135deg, #117c75, #14b8a6);
  color: white;
  box-shadow: 0 4px 12px rgba(17,124,117, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(17,124,117, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 1200px) {
  .habits-container { grid-template-columns: 1fr; }
  .day-row { grid-template-columns: repeat(10, 1fr); }
}

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .habits-container { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero-section { flex-direction: column; align-items: flex-start; }
  .btn-add { width: 100%; justify-content: center; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .stat-card { padding: 0.85rem; }
  .stat-value { font-size: 1.3rem; }
  .day-row { grid-template-columns: repeat(7, 1fr); }
  .day-number { font-size: 0.65rem; }
  .icon-picker { grid-template-columns: repeat(4, 1fr); }
  .goal-options { grid-template-columns: 1fr; }
  .habits-container { grid-template-columns: 1fr; }
}
</style>
