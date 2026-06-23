<template>
  <div class="calendar-page">
    <div class="page-header flex-col-tablet">
      <div>
        <h1 class="page-title">Lịch Tự Học & Lịch Thi</h1>
        <p class="page-subtitle">Theo dõi thời hạn các nhiệm vụ tự học (To-do) và ngày thi học kỳ của bạn</p>
      </div>

      <div class="calendar-controls">
        <button class="btn btn-premium" @click="exportToiCal">
          Xuất File Lịch (.ics)
        </button>
        <button class="btn btn-secondary" @click="prevMonth">◀</button>
        <div class="current-month">{{ monthName }} {{ currentYear }}</div>
        <button class="btn btn-secondary" @click="nextMonth">▶</button>
        <button class="btn btn-primary" @click="goToToday">Hôm nay</button>
      </div>
    </div>

    <!-- Legend -->
    <div class="cal-legend">
      <div class="legend-item legend-item-todo"><span class="legend-dot"></span> Chờ làm</div>
      <div class="legend-item legend-item-progress"><span class="legend-dot"></span> Đang làm</div>
      <div class="legend-item legend-item-done"><span class="legend-dot"></span> Hoàn thành</div>
      <div class="legend-item legend-item-overdue"><span class="legend-dot"></span> Trễ hạn</div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-card glass-card">
      <div class="calendar-weekdays">
        <div v-for="(day, i) in weekdays" :key="day" class="weekday-name" :class="{ 'weekend-head': i === 0 || i === 6 }">{{ day }}</div>
      </div>
      
      <div class="calendar-days">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index" 
          class="calendar-day"
          :class="{ 
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'weekend': index % 7 === 0 || index % 7 === 6,
            'has-note': getNoteForDay(day.date)
          }"
          @click="openDayDetail(day.date)"
        >
          <div class="day-number">
            <span class="day-num-text">{{ day.date.getDate() }}</span>
            <span v-if="day.isToday" class="today-badge">Hôm nay</span>
          </div>
          
          <div class="day-tasks">
            <div 
              v-for="task in getTasksForDay(day.date).slice(0, 3)" 
              :key="task.id"
              class="cal-event"
              :class="'evt-' + getEventCategory(task)"
              @click.stop="viewTask(task)"
            >
              <span class="evt-time" v-if="task.start_time || task.end_time">{{ formatEventTime(task) }}</span>
              <span class="evt-title">{{ task.title }}</span>
            </div>
            <div v-if="getTasksForDay(day.date).length > 3" class="more-events" @click.stop="openDayDetail(day.date)">
              +{{ getTasksForDay(day.date).length - 3 }} nữa
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <div v-if="showDayModal" class="modal-overlay" @click.self="showDayModal = false">
      <div class="modal-content day-modal">
        <div class="modal-header">
          <h2>{{ selectedDayFormatted }}</h2>
          <button class="close-btn" @click="showDayModal = false">×</button>
        </div>

        <div class="modal-body">
          <!-- Day Notes Section -->
          <div class="day-notes-section">
            <div class="notes-header">
              <h3>📝 Ghi chú ngày</h3>
              <div class="notes-actions" v-if="!editingNote && getNoteForDay(selectedDate)">
                <button class="btn-icon" @click="startEditNote" title="Sửa ghi chú">✏️</button>
                <button class="btn-icon btn-danger" @click="deleteDayNote" title="Xóa ghi chú">🗑️</button>
              </div>
            </div>
            <div v-if="editingNote" class="note-editor">
              <textarea 
                v-model="noteText" 
                class="note-textarea" 
                placeholder="Viết ghi chú cho ngày này... (VD: Ôn tập chương 3, mang theo máy tính, ...)"
                rows="4"
              ></textarea>
              <div class="note-editor-actions">
                <button class="btn btn-secondary btn-sm" @click="cancelEditNote">Hủy</button>
                <button class="btn btn-primary btn-sm" @click="saveDayNote">💾 Lưu ghi chú</button>
              </div>
            </div>
            <div v-else-if="getNoteForDay(selectedDate)" class="note-display">
              {{ getNoteForDay(selectedDate) }}
            </div>
            <div v-else class="note-empty" @click="startEditNote">
              <span class="note-empty-icon">📝</span>
              <span>Thêm ghi chú cho ngày này</span>
            </div>
          </div>

          <!-- Ecosystem Links for this day -->
          <RelatedLinks module="calendar" :date="selectedDate" />

          <!-- Create Task Form -->
          <div v-if="showCreateForm" class="create-task-form">
            <h3>➕ Thêm công việc mới</h3>
            <form @submit.prevent="handleCreateTask">
              <div class="form-group">
                <label>Tên công việc <span class="required">*</span></label>
                <input 
                  v-model="newTask.title" 
                  type="text" 
                  class="form-input"
                  placeholder="VD: Nộp bài tập Toán, Họp nhóm đề tài..."
                  required
                />
              </div>

              <div class="form-group">
                <label>Mô tả</label>
                <textarea 
                  v-model="newTask.description" 
                  class="form-input"
                  placeholder="Mô tả chi tiết công việc..."
                  rows="3"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Thời gian</label>
                  <input 
                    v-model="newTask.time" 
                    type="time" 
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Độ ưu tiên</label>
                  <select v-model="newTask.priority" class="form-input">
                    <option value="low">🟢 Thấp</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="high">🔴 Cao</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="showCreateForm = false">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="!newTask.title.trim() || creating">
                  {{ creating ? 'Đang tạo...' : 'Tạo công việc' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Tasks List -->
          <div v-else class="day-tasks-list">
            <div class="list-header">
              <h3>Công việc trong ngày ({{ dayTasks.length }})</h3>
              <button class="btn btn-primary btn-sm" @click="showCreateForm = true">
                ➕ Thêm mới
              </button>
            </div>
            
            <div v-if="dayTasks.length === 0" class="empty-state">
              <p>Không có công việc nào trong ngày này</p>
            </div>

            <div v-else class="task-list">
              <div 
                v-for="task in dayTasks" 
                :key="task.id"
                class="task-item"
                :class="['status-' + task.status, { 'overdue': isOverdue(task) }]"
                @click="viewTask(task)"
              >
                <div class="task-left">
                  <div class="task-status-indicator"></div>
                  <div>
                    <div class="task-title-text">{{ task.title }}</div>
                    <div class="task-meta">
                      <span class="task-time">⏰ {{ task.start_time && task.end_time ? formatTime(task.start_time) + ' - ' + formatTime(task.end_time) : formatTime(task.start_time || task.due_date) }}</span>
                      <span class="task-priority" :class="task.priority">{{ formatPriority(task.priority) }}</span>
                      <span v-if="isOverdue(task)" class="overdue-label">⚠️ Trễ hạn</span>
                    </div>
                  </div>
                </div>
                <div class="task-status-badge" :class="task.status">
                  {{ formatStatus(task.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import RelatedLinks from '@/components/RelatedLinks.vue'

const store = useTaskStore()
const router = useRouter()

onMounted(async () => {
  loadDayNotes()
  if (store.tasks.length === 0) {
    await store.fetchTasks()
  }
})

// Day Notes (localStorage-based)
const dayNotes = ref({})
const editingNote = ref(false)
const noteText = ref('')

const dateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const loadDayNotes = () => {
  try {
    const stored = localStorage.getItem('taskflow_calendar_notes')
    if (stored) dayNotes.value = JSON.parse(stored)
  } catch (e) {
    dayNotes.value = {}
  }
}

const saveNotesToStorage = () => {
  localStorage.setItem('taskflow_calendar_notes', JSON.stringify(dayNotes.value))
}

const getNoteForDay = (date) => {
  if (!date) return ''
  return dayNotes.value[dateKey(date)] || ''
}

const startEditNote = () => {
  noteText.value = getNoteForDay(selectedDate.value) || ''
  editingNote.value = true
}

const cancelEditNote = () => {
  editingNote.value = false
  noteText.value = ''
}

const saveDayNote = () => {
  if (!selectedDate.value) return
  const key = dateKey(selectedDate.value)
  if (noteText.value.trim()) {
    dayNotes.value[key] = noteText.value.trim()
  } else {
    delete dayNotes.value[key]
  }
  saveNotesToStorage()
  editingNote.value = false
  noteText.value = ''
  store.showToast('💾 Đã lưu ghi chú!', 'success')
}

const deleteDayNote = () => {
  if (!selectedDate.value) return
  const key = dateKey(selectedDate.value)
  delete dayNotes.value[key]
  saveNotesToStorage()
  store.showToast('🗑️ Đã xóa ghi chú', 'success')
}

// Event helpers for calendar grid
const getEventCategory = (task) => {
  if (isOverdue(task)) return 'overdue'
  return task.status || 'todo'
}

const formatEventTime = (task) => {
  if (task.start_time) return formatTime(task.start_time)
  if (task.end_time) return '~' + formatTime(task.end_time)
  return ''
}

// Calendar Logic
const currentDate = ref(new Date())
const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Day detail modal
const showDayModal = ref(false)
const selectedDate = ref(null)
const showCreateForm = ref(false)
const creating = ref(false)

const newTask = ref({
  title: '',
  description: '',
  time: '09:00',
  priority: 'medium'
})

const resetNewTask = () => {
  newTask.value = {
    title: '',
    description: '',
    time: '09:00',
    priority: 'medium'
  }
}

const selectedDayFormatted = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const dayTasks = computed(() => {
  if (!selectedDate.value) return []
  return getTasksForDay(selectedDate.value)
})

const isOverdue = (task) => {
  if (task.status === 'done' || task.status === 'cancelled') return false
  if (task.status === 'overdue') return true
  const now = new Date()
  if (task.end_time && new Date(task.end_time) < now) return true
  if (task.due_date && new Date(task.due_date) < now) return true
  return false
}

const openDayDetail = (date) => {
  selectedDate.value = date
  showDayModal.value = true
  showCreateForm.value = false
  editingNote.value = false
  resetNewTask()
}

const viewTask = (task) => {
  router.push(`/tasks/${task.id}`)
}

const handleCreateTask = async () => {
  if (!newTask.value.title.trim()) return
  
  creating.value = true
  try {
    // Combine selected date with time
    const [hours, minutes] = newTask.value.time.split(':')
    const dueDate = new Date(selectedDate.value)
    dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    const taskData = {
      title: newTask.value.title,
      description: newTask.value.description,
      due_date: dueDate.toISOString(),
      priority: newTask.value.priority,
      status: 'todo',
      category: 'personal'
    }
    
    await store.createTask(taskData)
    
    // Reset form and hide it
    resetNewTask()
    showCreateForm.value = false
    
    store.showToast('✅ Tạo công việc thành công!', 'success')
  } catch (error) {
    console.error('Error creating task:', error)
    store.showToast('❌ Lỗi tạo công việc', 'error')
  } finally {
    creating.value = false
  }
}

const createTaskForDay = () => {
  // Format date for datetime-local input
  const d = selectedDate.value
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}T09:00`
  
  // Navigate to tasks page with pre-filled date
  router.push({
    path: '/tasks',
    query: { create: 'true', dueDate: dateStr }
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatPriority = (priority) => {
  const map = {
    'high': '🔴 Cao',
    'medium': '🟡 Trung bình',
    'low': '🟢 Thấp'
  }
  return map[priority] || priority
}

const formatStatus = (status) => {
  const map = {
    'todo': 'Chờ làm',
    'in_progress': 'Đang làm',
    'done': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  }
  return map[status] || status
}

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('vi-VN', { month: 'long' })
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

// Format Date object to iCal standard (YYYYMMDDTHHMMSSZ)
const formatICSDate = (dateObj) => {
  const d = new Date(dateObj)
  if (isNaN(d.getTime())) return ''
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`
}

// Export tasks to standard .ics file for Google Calendar syncing
const exportToiCal = () => {
  try {
    const tasks = store.tasks
    const tasksWithDueDate = tasks.filter(t => t.due_date && t.status !== 'cancelled')
    
    if (tasksWithDueDate.length === 0) {
      store.showToast('⚠️ Không có công việc nào có hạn chót để đồng bộ!', 'warning')
      return
    }
    
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TaskFlow//Thesis Sync v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:TaskFlow Calendar',
      'X-WR-TIMEZONE:Asia/Ho_Chi_Minh'
    ]
    
    tasksWithDueDate.forEach(task => {
      const startDate = new Date(task.due_date)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour duration
      
      const dtStamp = formatICSDate(task.created_at ? new Date(task.created_at) : new Date())
      const dtStart = formatICSDate(startDate)
      const dtEnd = formatICSDate(endDate)
      
      const cleanString = (str) => {
        if (!str) return ''
        return str
          .replace(/\\/g, '\\\\')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '')
      }
      
      const summary = cleanString(task.title)
      const desc = cleanString(
        (task.description || '') + 
        `\\n\\n---\\nĐộ ưu tiên: ${task.priority.toUpperCase()}\\nDanh mục: ${task.category}\\nTrạng thái: ${task.status}`
      )
      const category = cleanString(task.category || 'Chung')
      
      let status = 'CONFIRMED'
      if (task.status === 'todo') status = 'TENTATIVE'
      
      icsLines.push('BEGIN:VEVENT')
      icsLines.push(`UID:task-${task.id}-${startDate.getTime()}@taskflow.com`)
      icsLines.push(`DTSTAMP:${dtStamp}`)
      icsLines.push(`DTSTART:${dtStart}`)
      icsLines.push(`DTEND:${dtEnd}`)
      icsLines.push(`SUMMARY:${summary}`)
      icsLines.push(`DESCRIPTION:${desc}`)
      icsLines.push(`STATUS:${status}`)
      icsLines.push(`CATEGORIES:${category}`)
      icsLines.push('END:VEVENT')
    })
    
    icsLines.push('END:VCALENDAR')
    
    const icsContent = icsLines.join('\r\n')
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'TaskFlow_Calendar.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    store.showToast('📅 Tải xuống file .ics thành công! Hãy import vào Google Calendar để hoàn tất đồng bộ.')
  } catch (err) {
    console.error('Failed to export iCal:', err)
    store.showToast('❌ Lỗi xuất file lịch biểu', 'error')
  }
}

// Generate calendar display grid (including previous/next month days)
const calendarDays = computed(() => {
  const days = []
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  const startDayOfWeek = firstDayOfMonth.getDay()
  const lastDate = lastDayOfMonth.getDate()

  const today = new Date()

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(currentYear.value, currentMonth.value, -i)
    days.push({ date: d, isCurrentMonth: false, isToday: false })
  }

  for (let i = 1; i <= lastDate; i++) {
    const d = new Date(currentYear.value, currentMonth.value, i)
    const isToday = d.toDateString() === today.toDateString()
    days.push({ date: d, isCurrentMonth: true, isToday })
  }

  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({ date: d, isCurrentMonth: false, isToday: false })
  }

  return days
})

const getTasksForDay = (dateStr) => {
  const targetDateStr = dateStr.toDateString()
  return store.tasks.filter(t => {
    if (t.due_date) {
      const taskDate = new Date(t.due_date)
      if (taskDate.toDateString() === targetDateStr) return true
    }
    if (t.start_time) {
      const startDate = new Date(t.start_time)
      if (startDate.toDateString() === targetDateStr) return true
    }
    if (t.end_time) {
      const endDate = new Date(t.end_time)
      if (endDate.toDateString() === targetDateStr) return true
    }
    return false
  }).sort((a, b) => {
    const aOverdue = isOverdue(a)
    const bOverdue = isOverdue(b)
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    const aTime = a.start_time || a.end_time || a.due_date
    const bTime = b.start_time || b.end_time || b.due_date
    return new Date(aTime) - new Date(bTime)
  })
}
</script>

<style scoped>
.calendar-page {
  animation: fadeIn 0.4s ease both;
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f7f5 50%, #e6f7f5 100%);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.5px;
  filter: drop-shadow(0 2px 8px rgba(17,124,117, 0.15));
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.current-month {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e1b4b;
  min-width: 130px;
  text-align: center;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

/* Legend */
.cal-legend {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.28rem 0.7rem;
  border-radius: 20px;
  background: #f8fafc;
  color: #475569;
  transition: all 0.2s ease;
}

.legend-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-item-todo { background: #f1f5f9; color: #475569; }
.legend-item-todo .legend-dot { background: #94a3b8; }
.legend-item-progress { background: #fffbeb; color: #92400e; }
.legend-item-progress .legend-dot { background: #f59e0b; }
.legend-item-done { background: #f0fdf4; color: #065f46; }
.legend-item-done .legend-dot { background: #10b981; }
.legend-item-overdue { background: #fef2f2; color: #991b1b; }
.legend-item-overdue .legend-dot { background: #ef4444; }

/* Calendar Card */
.calendar-card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 620px;
  margin-top: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 8px 30px rgba(17,124,117, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

/* Weekday Header */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 700;
  font-size: 0.8rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e6f7f5;
  margin-bottom: 0.25rem;
}

.weekday-name {
  color: #117c75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.weekday-name.weekend-head {
  color: #ec4899;
}

/* Day Grid */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(105px, 1fr);
  gap: 6px;
}

.calendar-day {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.45rem 0.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.calendar-day:hover {
  border-color: #117c75;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.12);
  transform: translateY(-1px);
}

.calendar-day.weekend {
  background: #f8fafc;
}

.calendar-day.other-month {
  opacity: 0.4;
  background: #f1f5f9;
}

.calendar-day.today {
  border: 2px solid #117c75;
  background: linear-gradient(135deg, rgba(17,124,117, 0.04) 0%, rgba(17,124,117, 0.04) 100%);
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.1), 0 4px 14px rgba(17,124,117, 0.08);
}

.calendar-day.has-note {
  border-color: #fbbf24;
}

/* Day Number */
.day-number {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.3rem;
  min-height: 22px;
}

.day-num-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}

.calendar-day.today .day-num-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #117c75, #117c75);
  color: white;
  font-size: 0.75rem;
}

.today-badge {
  font-size: 0.58rem;
  font-weight: 700;
  color: #117c75;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Event Badges in Grid */
.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
  flex: 1;
}

.cal-event {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.18rem 0.4rem;
  border-radius: 5px;
  font-size: 0.68rem;
  font-weight: 600;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
  border-left: 3px solid;
  line-height: 1.3;
}

.cal-event:hover {
  transform: translateX(2px);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.evt-time {
  font-size: 0.6rem;
  font-weight: 700;
  opacity: 0.75;
  flex-shrink: 0;
}

.evt-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.evt-todo {
  background: #f1f5f9;
  border-left-color: #94a3b8;
  color: #475569;
}

.evt-in_progress {
  background: #fffbeb;
  border-left-color: #f59e0b;
  color: #92400e;
}

.evt-done {
  background: #f0fdf4;
  border-left-color: #10b981;
  color: #065f46;
  text-decoration: line-through;
  opacity: 0.75;
}

.evt-overdue {
  background: #fef2f2;
  border-left-color: #ef4444;
  color: #991b1b;
}

.more-events {
  font-size: 0.62rem;
  font-weight: 700;
  color: #117c75;
  padding: 0.12rem 0.4rem;
  cursor: pointer;
  margin-top: 2px;
}

.more-events:hover {
  text-decoration: underline;
}

/* Day Detail Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeInOverlay 0.3s ease-out;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.day-modal {
  max-width: 650px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e6f7f5;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f7f5 100%);
}

.modal-header h2 {
  margin: 0;
  color: #1e1b4b;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  text-transform: capitalize;
}

.close-btn {
  background: rgba(17,124,117, 0.1);
  border: none;
  font-size: 1.35rem;
  cursor: pointer;
  color: #117c75;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 400;
}

.close-btn:hover {
  background: rgba(17,124,117, 0.2);
  color: #0e6b64;
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.75rem 2rem;
  background: white;
}

/* Day Notes Section */
.day-notes-section {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.notes-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.notes-actions {
  display: flex;
  gap: 0.4rem;
}

.btn-icon {
  background: rgba(146, 64, 14, 0.1);
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(146, 64, 14, 0.2);
  transform: scale(1.05);
}

.btn-icon.btn-danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.note-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.note-textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1.5px solid #fde68a;
  background: white;
  font-size: 0.9rem;
  color: #1f2937;
  transition: all 0.2s ease;
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.note-textarea:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
}

.note-editor-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.note-display {
  font-size: 0.9rem;
  color: #78350f;
  line-height: 1.6;
  white-space: pre-wrap;
  padding: 0.5rem 0;
}

.note-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b45309;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.note-empty:hover {
  color: #92400e;
}

.note-empty-icon {
  font-size: 1rem;
}

/* Create Task Form */
.create-task-form {
  animation: fadeIn 0.3s ease;
  background: white;
}

.create-task-form h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: #f1f5f9;
  font-size: 0.9rem;
  color: #1f2937;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  outline: none;
}

.form-input:hover {
  background: #e2e8f0;
}

.form-input:focus {
  background: white;
  border-color: #117c75;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.12);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e6f7f5;
}

/* Day Tasks List */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.list-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.day-tasks-list h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 1.25rem;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  background: #f8fafc;
  border-radius: 14px;
  border: 2px dashed #cbd5e1;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: white;
  border-color: #117c75;
  border-left-color: #117c75;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.08);
}

.task-item.overdue {
  background: #fef2f2;
  border-color: #fecaca;
  border-left-color: #ef4444;
}

.task-item.overdue:hover {
  background: #fee2e2;
}

.task-item.status-done {
  border-left-color: #10b981;
}

.task-item.status-in_progress {
  border-left-color: #f59e0b;
}

.task-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.task-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-todo .task-status-indicator { background: #94a3b8; }
.status-in_progress .task-status-indicator { background: #f59e0b; }
.status-done .task-status-indicator { background: #10b981; }

.task-title-text {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.2rem;
  font-size: 0.92rem;
}

.status-done .task-title-text {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: #64748b;
  flex-wrap: wrap;
}

.overdue-label {
  color: #ef4444;
  font-weight: 700;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  font-size: 0.72rem;
}

.task-priority { font-weight: 600; }
.task-priority.high { color: #ef4444; }
.task-priority.medium { color: #f59e0b; }
.task-priority.low { color: #10b981; }

.task-status-badge {
  font-size: 0.72rem;
  padding: 0.3rem 0.65rem;
  border-radius: 7px;
  font-weight: 600;
}

.task-status-badge.todo {
  background: #f1f5f9;
  color: #64748b;
}

.task-status-badge.in_progress {
  background: #fffbeb;
  color: #b45309;
}

.task-status-badge.done {
  background: #f0fdf4;
  color: #065f46;
}

.btn-sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.82rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
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

  .page-title {
    font-size: 1.4rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .calendar-controls {
    flex-direction: column;
    gap: 8px;
  }

  .current-month {
    min-width: auto;
    font-size: 0.95rem;
  }

  .calendar-weekdays {
    font-size: 0.65rem;
    padding-bottom: 0.5rem;
  }

  .calendar-days {
    grid-auto-rows: minmax(60px, auto);
    gap: 3px;
  }

  .calendar-day {
    min-height: 60px;
    padding: 0.25rem;
    border-radius: 6px;
  }

  .day-num-text {
    font-size: 0.75rem;
  }

  .today-badge {
    display: none;
  }

  .cal-event {
    font-size: 0.55rem;
    padding: 0.1rem 0.25rem;
    border-left-width: 2px;
  }

  .evt-time {
    display: none;
  }

  .evt-title {
    font-size: 0.55rem;
  }

  .more-events {
    font-size: 0.55rem;
    padding: 0.08rem 0.25rem;
  }

  .calendar-card {
    padding: 0.5rem;
    min-height: auto;
    border-radius: 12px;
  }

  .cal-legend {
    gap: 0.25rem;
    padding: 0.35rem 0.4rem;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .legend-item {
    font-size: 0.62rem;
    padding: 0.15rem 0.45rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .day-modal {
    max-width: 95%;
    width: 95%;
  }

  .modal-header {
    padding: 1rem 1.25rem;
  }

  .modal-header h2 {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 1rem 1.25rem;
  }

  .day-notes-section {
    padding: 0.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .list-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .task-item {
    padding: 0.65rem 0.75rem;
  }

  .task-meta {
    gap: 0.4rem;
    font-size: 0.7rem;
  }

  .task-status-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }
}
</style>
