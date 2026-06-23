<template>
  <div class="timetable-page">
    <div class="page-header flex-col-tablet">
      <div>
        <h1 class="page-title">🏫 Thời Khóa Biểu Lên Lớp</h1>
        <p class="page-subtitle">Quản lý lịch học cố định hàng tuần trên giảng đường để tự động tạo nhiệm vụ học tập</p>
      </div>

      <div class="calendar-controls">
        <button class="btn btn-secondary" @click="testBrowserNotification" style="margin-right: 8px;">
          🔔 Thử Thông Báo Trình Duyệt
        </button>
        <button class="btn btn-primary" @click="openAddScheduleModal">
          ＋ Thêm Lịch Học
        </button>
      </div>
    </div>

    <!-- Timetable Grid -->
    <div class="timetable-grid-container">
      <div class="weekly-timetable-columns">
        <div 
          v-for="dayNum in [1, 2, 3, 4, 5, 6, 0]" 
          :key="dayNum" 
          class="timetable-day-column glass-card"
        >
          <div class="day-column-header">
            <h4>{{ getDayName(dayNum) }}</h4>
            <span class="day-classes-count">{{ groupSchedulesByDay[dayNum].length }} ca</span>
          </div>

          <div class="day-classes-list">
            <div 
              v-for="s in groupSchedulesByDay[dayNum]" 
              :key="s.id" 
              class="class-slot-card"
            >
              <div class="class-slot-actions">
                <button class="action-btn" title="Sửa" @click="openEditScheduleModal(s)">✏️</button>
                <button class="action-btn delete" title="Xóa" @click="deleteSchedule(s.id)">🗑️</button>
              </div>
              <div class="class-subject">📘 {{ s.name || s.subject_name }}</div>
              <div class="class-time">⏰ {{ s.start_time.slice(0, 5) }} - {{ s.end_time.slice(0, 5) }}</div>
              <div v-if="s.room" class="class-room">📍 Phòng: {{ s.room }}</div>
            </div>

            <div v-if="groupSchedulesByDay[dayNum].length === 0" class="empty-day-classes">
              Trống lịch học 🎉
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timetable Add/Edit Modal -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showScheduleModal" class="modal-overlay" @click.self="showScheduleModal = false">
          <div class="modal-content glass-card premium-modal">
            <div class="modal-header">
              <h3 class="modal-title">{{ isEditSchedule ? '✏️ Cập Nhật Lịch Học' : '＋ Thêm Lịch Học Mới' }}</h3>
              <button class="close-btn" @click="showScheduleModal = false">✕</button>
            </div>

            <form @submit.prevent="handleScheduleSubmit" class="modal-form">
              <!-- Subject Name -->
              <div class="form-group">
                <label class="form-label">Tên Môn Học <span class="required">*</span></label>
                
                <!-- Select Mode -->
                <div v-if="subjects.length > 0 && !isCustomSubject" class="select-wrapper">
                  <select v-model="scheduleForm.subject_name" class="form-control premium-select" required>
                    <option value="">-- Chọn môn học --</option>
                    <option v-for="sub in subjects" :key="sub.id" :value="sub.name">
                      {{ sub.name }}
                    </option>
                  </select>
                  <button type="button" class="btn-toggle-input" @click="isCustomSubject = true; scheduleForm.subject_name = ''">
                    💡 Tự nhập môn học khác
                  </button>
                </div>

                <!-- Custom Input Mode -->
                <div v-else class="input-wrapper">
                  <input 
                    v-model="scheduleForm.subject_name" 
                    type="text" 
                    placeholder="Nhập tên môn học..." 
                    class="form-control premium-input" 
                    required 
                  />
                  <button type="button" v-if="subjects.length > 0" class="btn-toggle-input" @click="isCustomSubject = false; scheduleForm.subject_name = ''">
                    📋 Chọn từ danh sách môn học
                  </button>
                </div>
              </div>

              <!-- Day of Week -->
              <div class="form-group">
                <label class="form-label">Thứ Trong Tuần <span class="required">*</span></label>
                <select v-model="scheduleForm.day_of_week" @change="updateDefaultDeadlines" class="form-control premium-select" required>
                  <option :value="1">Thứ Hai</option>
                  <option :value="2">Thứ Ba</option>
                  <option :value="3">Thứ Tư</option>
                  <option :value="4">Thứ Năm</option>
                  <option :value="5">Thứ Sáu</option>
                  <option :value="6">Thứ Bảy</option>
                  <option :value="0">Chủ Nhật</option>
                </select>
              </div>

              <!-- Start Time & End Time -->
              <div class="form-row">
                <div class="form-group half-width">
                  <label class="form-label">Giờ Bắt Đầu <span class="required">*</span></label>
                  <input
                    v-model="scheduleForm.start_time"
                    type="time"
                    class="form-control premium-input"
                    required
                  />
                </div>
                <div class="form-group half-width">
                  <label class="form-label">Giờ Kết Thúc <span class="required">*</span></label>
                  <input
                    v-model="scheduleForm.end_time"
                    type="time"
                    class="form-control premium-input"
                    required
                  />
                </div>
              </div>

              <!-- Room -->
              <div class="form-group">
                <label class="form-label">Phòng Học / Link học trực tuyến</label>
                <input
                  v-model="scheduleForm.room"
                  type="text"
                  class="form-control premium-input"
                  placeholder="Ví dụ: B102, Zoom..."
                />
              </div>

              <!-- Auto Tasks (Only on Create Mode) -->
              <div v-if="!isEditSchedule" class="auto-tasks-container">
                <label class="form-label auto-task-header-label">🤖 Tự Động Tạo Nhiệm Vụ Học Tập</label>
                <div class="checkbox-list">
                  <!-- Prep Task -->
                  <div class="checkbox-group-wrapper">
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="scheduleForm.auto_prep" class="premium-checkbox" />
                      <span class="checkbox-text">Tự động nhắc chuẩn bị bài trước lớp</span>
                    </label>
                    <transition name="slide-fade">
                      <div v-if="scheduleForm.auto_prep" class="sub-settings-panel">
                        <div class="sub-settings-row">
                          <div class="sub-setting-item">
                            <span class="sub-label">Hạn chót cụ thể:</span>
                            <input type="datetime-local" v-model="scheduleForm.auto_prep_deadline" class="sub-datetime-input" />
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>

                  <!-- Review Task -->
                  <div class="checkbox-group-wrapper">
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="scheduleForm.auto_review" class="premium-checkbox" />
                      <span class="checkbox-text">Tự động nhắc làm bài tập và ôn tập</span>
                    </label>
                    <transition name="slide-fade">
                      <div v-if="scheduleForm.auto_review" class="sub-settings-panel">
                        <div class="sub-settings-row">
                          <div class="sub-setting-item">
                            <span class="sub-label">Hạn chót cụ thể:</span>
                            <input type="datetime-local" v-model="scheduleForm.auto_review_deadline" class="sub-datetime-input" />
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>

              <!-- Submit -->
              <div class="modal-actions-premium">
                <button type="button" class="btn-cancel" @click="showScheduleModal = false">Hủy</button>
                <button type="submit" class="btn-submit">
                  {{ isEditSchedule ? 'Cập Nhật' : 'Thêm Mới' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { classScheduleApi, subjectApi } from '@/api/taskApi'

const store = useTaskStore()

const schedules = ref([])
const subjects = ref([])
const showScheduleModal = ref(false)
const isEditSchedule = ref(false)
const editingScheduleId = ref(null)
const isCustomSubject = ref(false)

const scheduleForm = ref({
  subject_name: '',
  day_of_week: 1,
  start_time: '08:00',
  end_time: '11:00',
  room: '',
  auto_prep: true,
  auto_review: true,
  auto_prep_deadline: '',
  auto_review_deadline: ''
})

onMounted(async () => {
  if (store.tasks.length === 0) {
    await store.fetchTasks()
  }
  await fetchSchedules()
  await fetchSubjects()
})

const fetchSchedules = async () => {
  try {
    const res = await classScheduleApi.getAll()
    schedules.value = res.data.data
  } catch (err) {
    console.error(err)
    store.showToast('Không thể tải thời khóa biểu', 'error')
  }
}

const fetchSubjects = async () => {
  try {
    const res = await subjectApi.getAll()
    subjects.value = res.data.data
  } catch (err) {
    console.error(err)
  }
}

const openAddScheduleModal = () => {
  isEditSchedule.value = false
  editingScheduleId.value = null
  isCustomSubject.value = false
  scheduleForm.value = {
    subject_name: '',
    day_of_week: 1,
    start_time: '08:00',
    end_time: '11:30',
    room: '',
    auto_prep: true,
    auto_review: true,
    auto_prep_deadline: '',
    auto_review_deadline: ''
  }
  updateDefaultDeadlines()
  showScheduleModal.value = true
}

const openEditScheduleModal = (s) => {
  isEditSchedule.value = true
  editingScheduleId.value = s.id
  
  const isKnown = subjects.value.some(sub => sub.name === s.subject_name)
  isCustomSubject.value = !isKnown && subjects.value.length > 0

  scheduleForm.value = {
    subject_name: s.subject_name,
    day_of_week: s.day_of_week,
    start_time: s.start_time.slice(0, 5),
    end_time: s.end_time.slice(0, 5),
    room: s.room || '',
    auto_prep: false,
    auto_review: false
  }
  showScheduleModal.value = true
}

const handleScheduleSubmit = async () => {
  if (!scheduleForm.value.subject_name || scheduleForm.value.day_of_week === undefined || !scheduleForm.value.start_time || !scheduleForm.value.end_time) {
    store.showToast('Vui lòng nhập đầy đủ thông tin học tập!', 'warning')
    return
  }

  try {
    if (isEditSchedule.value) {
      await classScheduleApi.update(editingScheduleId.value, scheduleForm.value)
      store.showToast('Cập nhật lịch học thành công!', 'success')
    } else {
      const payload = { ...scheduleForm.value }
      if (payload.auto_prep && payload.auto_prep_deadline) {
        payload.auto_prep_deadline = new Date(payload.auto_prep_deadline).toISOString()
      }
      if (payload.auto_review && payload.auto_review_deadline) {
        payload.auto_review_deadline = new Date(payload.auto_review_deadline).toISOString()
      }
      await classScheduleApi.create(payload)
      store.showToast('Thêm lịch học thành công!', 'success')
      await store.fetchTasks()
    }
    showScheduleModal.value = false
    await fetchSchedules()
  } catch (err) {
    console.error(err)
    store.showToast('Lỗi khi lưu lịch học', 'error')
  }
}

const testBrowserNotification = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    store.showToast('⚠️ Trình duyệt của bạn không hỗ trợ thông báo đẩy!', 'error')
    return
  }

  if (Notification.permission === 'denied') {
    store.showToast('❌ Quyền thông báo đã bị chặn! Hãy nhấp vào biểu tượng 🔒 ở thanh địa chỉ để cấp lại quyền.', 'error')
    return
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      try {
        const notif = new Notification("🔔 TaskFlow - Kết nối thành công!", {
          body: "Tính năng thông báo đẩy trên máy tính đã hoạt động hoàn hảo!",
          icon: '/favicon.ico'
        })
        notif.onclick = () => {
          window.focus()
        }
        store.showToast('✅ Đã gửi thông báo thử nghiệm thành công!')
      } catch (err) {
        console.error('Lỗi thông báo đẩy:', err)
        store.showToast('❌ Lỗi hiển thị thông báo: ' + err.message, 'error')
      }
    } else {
      store.showToast('⚠️ Bạn đã từ chối cấp quyền thông báo!', 'warning')
    }
  })
}

const deleteSchedule = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa ca học này khỏi thời khóa biểu?')) return
  try {
    await classScheduleApi.delete(id)
    store.showToast('Đã xóa ca học và các nhiệm vụ tự động liên kết thành công!', 'success')
    await store.fetchTasks()
    await fetchSchedules()
  } catch (err) {
    console.error(err)
    store.showToast('Không thể xóa ca học', 'error')
  }
}

const groupSchedulesByDay = computed(() => {
  const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] }
  schedules.value.forEach(s => {
    if (grouped[s.day_of_week] !== undefined) {
      grouped[s.day_of_week].push(s)
    }
  })
  
  Object.keys(grouped).forEach(day => {
    grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })
  
  return grouped
})

const getDayName = (dayNum) => {
  const names = {
    1: 'Thứ Hai',
    2: 'Thứ Ba',
    3: 'Thứ Tư',
    4: 'Thứ Năm',
    5: 'Thứ Sáu',
    6: 'Thứ Bảy',
    0: 'Chủ Nhật'
  }
  return names[dayNum]
}

const getNextDateForDayFrontend = (dayOfWeek) => {
  const targetDay = parseInt(dayOfWeek)
  const resultDate = new Date()
  const currentJsDay = resultDate.getDay()

  let daysToAdd = targetDay - currentJsDay
  if (daysToAdd < 0) {
    daysToAdd += 7
  }
  resultDate.setDate(resultDate.getDate() + daysToAdd)
  return resultDate
}

const formatDatetimeLocal = (date) => {
  const pad = (num) => String(num).padStart(2, '0')
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const updateDefaultDeadlines = () => {
  const nextClass = getNextDateForDayFrontend(scheduleForm.value.day_of_week)
  
  const prep = new Date(nextClass)
  prep.setDate(prep.getDate() - 1)
  prep.setHours(18, 0, 0, 0)
  scheduleForm.value.auto_prep_deadline = formatDatetimeLocal(prep)

  const review = new Date(nextClass)
  review.setDate(review.getDate() + 2)
  review.setHours(21, 0, 0, 0)
  scheduleForm.value.auto_review_deadline = formatDatetimeLocal(review)
}
</script>

<style scoped>
.timetable-page {
  animation: fadeIn 0.4s ease both;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timetable-grid-container {
  margin-top: 24px;
}

.weekly-timetable-columns {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  align-items: start;
}

@media (max-width: 1200px) {
  .weekly-timetable-columns {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .weekly-timetable-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .weekly-timetable-columns {
    grid-template-columns: 1fr;
  }
}

.timetable-day-column {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: 16px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.day-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
}

.day-column-header h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #117c75;
  margin: 0;
}

.day-classes-count {
  font-size: 0.72rem;
  background: rgba(17,124,117, 0.1);
  color: #117c75;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.day-classes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.class-slot-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: 10px;
  position: relative;
  transition: var(--transition);
  text-align: left;
}

.class-slot-card:hover {
  background: rgba(17,124,117, 0.05);
  border-color: rgba(17,124,117, 0.2);
}

.class-slot-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.class-slot-card:hover .class-slot-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px;
  transition: transform 0.15s;
}

.action-btn:hover {
  transform: scale(1.2);
}

.class-subject {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  padding-right: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.class-time {
  font-size: 0.75rem;
  color: #fbbf24;
  font-weight: 600;
  margin-bottom: 2px;
}

.class-room {
  font-size: 0.72rem;
  color: #94a3b8;
}

.empty-day-classes {
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
  padding: 16px 0;
  border: 1px dashed rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.flex-col-tablet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .flex-col-tablet {
    flex-direction: column;
    align-items: stretch;
  }
  .calendar-controls {
    flex-wrap: wrap;
    width: 100%;
  }
  .calendar-controls .btn { flex: 1; min-width: 0; justify-content: center; }
  .timetable-grid-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-left: -16px;
    margin-right: -16px;
    padding: 0 16px 12px;
  }
  .weekly-timetable-columns {
    display: flex;
    min-width: max-content;
    gap: 12px;
  }
  .timetable-day-column {
    min-width: 220px;
    max-width: 220px;
    flex-shrink: 0;
    min-height: 280px;
    padding: 12px;
  }
  .day-column-header h4 { font-size: 0.88rem; }
  .class-slot-card { padding: 8px; }
  .class-subject { font-size: 0.8rem; }
  .class-time { font-size: 0.7rem; }
  .class-room { font-size: 0.68rem; }
  .class-slot-actions { opacity: 1; }
}

/* Modal overlays and styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 8, 0.85) !important;
  backdrop-filter: blur(10px) !important;
  z-index: 2000 !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 40px 16px !important;
  overflow-y: auto !important;
}

.premium-modal {
  max-width: 520px;
  background: rgba(13, 18, 30, 0.95) !important;
  border: 1px solid rgba(17,124,117, 0.2) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(17,124,117, 0.05) !important;
  border-radius: 20px !important;
  overflow: hidden;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.01em;
  text-shadow: 0 0 15px rgba(17,124,117, 0.2);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  color: #117c75 !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-shadow: 0 0 8px rgba(17,124,117, 0.2);
}

.required {
  color: #f43f5e;
}

.premium-input, .premium-select {
  width: 100% !important;
  background: rgba(5, 7, 12, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  color: #f8fafc !important;
  padding: 12px 14px !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  outline: none;
  font-family: inherit;
  transition: all 0.25s ease !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6) !important;
}

.premium-input:hover, .premium-select:hover {
  border-color: rgba(17,124,117, 0.3) !important;
  background: rgba(255, 255, 255, 0.01) !important;
}

.premium-input:focus, .premium-select:focus {
  border-color: #117c75 !important;
  background: rgba(5, 7, 12, 0.95) !important;
  box-shadow: 0 0 12px rgba(17,124,117, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.8) !important;
}

.premium-select option {
  background-color: #0d1220;
  color: #f8fafc;
}

.btn-toggle-input {
  background: transparent;
  border: none;
  color: #fbbf24;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
  transition: color 0.2s;
  display: inline-block;
  margin-top: 4px;
}

.btn-toggle-input:hover {
  color: #fff;
  text-decoration: underline;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half-width {
  flex: 1;
}

.premium-input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(72%) sepia(50%) saturate(450%) hue-rotate(5deg) brightness(95%) contrast(85%);
  cursor: pointer;
}

.auto-tasks-container {
  background: rgba(17,124,117, 0.03);
  border: 1px dashed rgba(17,124,117, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 5px;
}

.auto-task-header-label {
  margin-bottom: 12px !important;
  display: block;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.premium-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(17,124,117, 0.4);
  border-radius: 4px;
  background: rgba(5, 7, 12, 0.8);
  cursor: pointer;
  display: grid;
  place-content: center;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.premium-checkbox::before {
  content: "✓";
  font-size: 0.72rem;
  font-weight: 900;
  color: #000;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.premium-checkbox:checked {
  background: #117c75;
  border-color: #117c75;
  box-shadow: 0 0 8px rgba(17,124,117, 0.5);
}

.premium-checkbox:checked::before {
  transform: scale(1);
}

.checkbox-text {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-weight: 500;
  transition: color 0.2s;
}

.checkbox-item:hover .checkbox-text {
  color: #fff;
}

.modal-actions-premium {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #a1a1aa;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.btn-submit {
  background: linear-gradient(135deg, #2dd4bf 0%, #0e6b64 100%);
  border: none;
  color: #050508;
  padding: 10px 24px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(17,124,117, 0.2);
  transition: all 0.2s;
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(17,124,117, 0.4);
  filter: brightness(1.1);
}

.btn-submit:active {
  transform: translateY(0);
}

.checkbox-group-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  margin-top: 4px;
}

.sub-settings-panel {
  padding-left: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-settings-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.sub-setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.sub-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
}

.sub-datetime-input {
  background: rgba(5, 7, 12, 0.9) !important;
  border: 1px solid rgba(17,124,117, 0.25) !important;
  border-radius: 6px !important;
  color: #f8fafc !important;
  padding: 6px 10px !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  width: 100%;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5) !important;
}

.sub-datetime-input:focus {
  border-color: #117c75 !important;
  box-shadow: 0 0 8px rgba(17,124,117, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.6) !important;
}

.sub-datetime-input::-webkit-calendar-picker-indicator {
  filter: invert(72%) sepia(50%) saturate(450%) hue-rotate(5deg) brightness(95%) contrast(85%);
  cursor: pointer;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
