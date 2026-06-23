<template>
  <div class="timebox-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🕒 Kế Hoạch Ngày (Timeboxing)</h1>
        <p class="page-subtitle">Sắp xếp công việc vào từng khung giờ cụ thể</p>
      </div>
      <div class="date-controls">
        <button class="btn btn-secondary" @click="changeDate(-1)">◀ Hôm qua</button>
        <div class="current-date">{{ formattedDate }}</div>
        <button class="btn btn-secondary" @click="changeDate(1)">Ngày mai ▶</button>
        <button class="btn btn-primary" style="margin-left:8px;" @click="goToToday">Hôm nay</button>
      </div>
    </div>

    <div class="planner-layout">
      <!-- Cột Trái: Backlog (Công việc chưa lên lịch) -->
      <div class="backlog-column glass-card">
        <div class="column-header">
          <h3>📥 Cần Lên Lịch</h3>
          <span class="task-count">{{ unscheduledTasks.length }}</span>
        </div>
        
        <div class="backlog-list" @dragover.prevent @drop="dropToBacklog">
          <div v-if="unscheduledTasks.length === 0" class="empty-backlog">
            Tất cả công việc đã được lên lịch! 🎉
          </div>
          <div 
            v-for="task in unscheduledTasks" 
            :key="task.id"
            class="timebox-task-card"
            :class="'priority-' + task.priority"
            draggable="true"
            @dragstart="dragStart($event, task)"
          >
            <div class="task-drag-handle">⋮⋮</div>
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <span class="category-badge">{{ task.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột Phải: Trục thời gian (Timeline) -->
      <div class="timeline-column glass-card">
        <div class="column-header">
          <h3>Lịch Trình Hôm Nay</h3>
        </div>
        
        <div class="timeline-grid">
          <div class="time-header-col"></div>
          <div class="time-slots-col">
            <div 
              v-for="hour in 24" 
              :key="hour" 
              class="time-slot-row"
              :class="{ 'class-time-blocked': getClassForSlot(hour - 1).length > 0 }"
              @dragover.prevent
              @dragenter.prevent="getClassForSlot(hour - 1).length === 0 && dragEnterSlot($event)"
              @dragleave.prevent="getClassForSlot(hour - 1).length === 0 && dragLeaveSlot($event)"
              @drop="getClassForSlot(hour - 1).length === 0 && dropToSlot($event, hour - 1)"
            >
              <div class="time-label">{{ formatHour(hour - 1) }}</div>
              <div class="slot-content">
                <!-- Hiển thị lịch học cố định trên lớp (nếu có) -->
                <div 
                  v-for="cls in getClassForSlot(hour - 1)" 
                  :key="'class-' + cls.id" 
                  class="class-schedule-block"
                >
                  🏫 Lớp học: {{ cls.subject_name }} 🚫 ({{ cls.start_time.slice(0, 5) }} - {{ cls.end_time.slice(0, 5) }})
                </div>

                <!-- Hiển thị Task đã thả vào khung giờ này -->
                <div 
                  v-for="task in getTasksForSlot(hour - 1)" 
                  :key="task.id"
                  class="scheduled-task-card"
                  :class="['priority-' + task.priority, { 'completed': task.status === 'done' }]"
                  draggable="true"
                  @dragstart="dragStart($event, task)"
                >
                  <div class="task-info">
                    <h4>{{ task.title }}</h4>
                    <span v-if="task.status === 'done'" class="done-icon">✓</span>
                  </div>
                  <button class="remove-time-btn" @click.stop="removeFromSchedule(task)" title="Gỡ khỏi lịch">×</button>
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
import { useTaskStore } from '@/stores/taskStore'
import { classScheduleApi } from '@/api/taskApi'

const store = useTaskStore()
const currentDate = ref(new Date())
const classSchedules = ref([])

onMounted(async () => {
  if (store.tasks.length === 0) {
    await store.fetchTasks()
  }
  try {
    const res = await classScheduleApi.getAll()
    classSchedules.value = res.data.data
  } catch (err) {
    console.error(err)
  }
})

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const changeDate = (days) => {
  const next = new Date(currentDate.value)
  next.setDate(next.getDate() + days)
  currentDate.value = next
}

const goToToday = () => {
  currentDate.value = new Date()
}

// Format 0-23 to "08:00"
const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

// Lọc task: Những task có due_date (hoặc created_at) là ngày đang xem
// Để đơn giản hóa cho người dùng, ta lấy tất cả tasks chưa hoàn thành làm backlog
const unscheduledTasks = computed(() => {
  return store.tasks.filter(t => t.status !== 'done' && !t.start_time)
})

// Lấy task đã lên lịch cho khung giờ cụ thể trong ngày đang chọn
const getTasksForSlot = (hour) => {
  const targetDateStr = currentDate.value.toDateString()
  return store.tasks.filter(t => {
    if (!t.start_time) return false
    const taskDate = new Date(t.start_time)
    return taskDate.toDateString() === targetDateStr && taskDate.getHours() === hour
  })
}

// Lấy ca học trùng vào khung giờ cụ thể trong ngày đang chọn
const getClassForSlot = (hour) => {
  const day = currentDate.value.getDay() // 0 (CN) -> 6 (T7)
  return classSchedules.value.filter(s => {
    if (s.day_of_week !== day) return false
    const startHour = parseInt(s.start_time.split(':')[0])
    const endHour = parseInt(s.end_time.split(':')[0])
    return hour >= startHour && hour < endHour
  })
}

// Kéo thả logic
let draggedTask = null

const dragStart = (e, task) => {
  draggedTask = task
  e.dataTransfer.effectAllowed = 'move'
  // Thêm class để tạo hiệu ứng trong mờ
  setTimeout(() => e.target.classList.add('dragging'), 0)
}

const dragEnterSlot = (e) => {
  e.currentTarget.classList.add('slot-highlight')
}

const dragLeaveSlot = (e) => {
  e.currentTarget.classList.remove('slot-highlight')
}

const dropToSlot = async (e, hour) => {
  e.currentTarget.classList.remove('slot-highlight')
  if (!draggedTask) return
  
  // Set start_time cho task = ngày đang xem + giờ được drop
  const newDate = new Date(currentDate.value)
  newDate.setHours(hour, 0, 0, 0)
  
  const endNewDate = new Date(newDate)
  endNewDate.setHours(hour + 1, 0, 0, 0)

  try {
    // Gọi API update
    await store.updateTask(draggedTask.id, { 
      start_time: newDate.toISOString(),
      end_time: endNewDate.toISOString()
    })
  } catch (err) {
    console.error('Update failed', err)
  }
  
  draggedTask = null
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'))
}

const dropToBacklog = async (e) => {
  if (!draggedTask) return
  if (!draggedTask.start_time) {
    draggedTask = null
    return // Đã ở backlog rồi
  }
  
  try {
    await store.updateTask(draggedTask.id, { 
      start_time: null,
      end_time: null
    })
  } catch (err) {
    console.error(err)
  }
  
  draggedTask = null
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'))
}

const removeFromSchedule = async (task) => {
  try {
    await store.updateTask(task.id, { 
      start_time: null,
      end_time: null
    })
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.timebox-page {
  animation: fadeIn 0.4s ease both;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.current-date {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  min-width: 220px;
  text-align: center;
}

.planner-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  margin-top: 24px;
  flex-grow: 1;
  overflow: hidden;
}

.backlog-column, .timeline-column {
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.column-header h3 {
  font-size: 1.1rem;
  color: #f8fafc;
  font-weight: 600;
}
.task-count {
  background: rgba(17,124,117, 0.2);
  color: #117c75;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.backlog-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}
.backlog-list::-webkit-scrollbar { width: 4px; }

.empty-backlog {
  text-align: center;
  color: #34d399;
  padding: 24px;
  font-style: italic;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 8px;
}

.timebox-task-card, .scheduled-task-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: grab;
  transition: all 0.2s;
}
.timebox-task-card:active, .scheduled-task-card:active {
  cursor: grabbing;
}
.timebox-task-card:hover, .scheduled-task-card:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
}
.timebox-task-card.dragging, .scheduled-task-card.dragging {
  opacity: 0.4;
}

.timebox-task-card.priority-high { border-left: 4px solid #ef4444; }
.timebox-task-card.priority-medium { border-left: 4px solid #117c75; }
.timebox-task-card.priority-low { border-left: 4px solid #34d399; }

.scheduled-task-card {
  padding: 8px 12px;
  background: rgba(17,124,117, 0.1);
  border-left: 4px solid #117c75;
  flex-grow: 1;
  justify-content: space-between;
}
.scheduled-task-card.completed {
  opacity: 0.6;
  border-left-color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}

.task-drag-handle {
  color: #64748b;
  font-size: 1.2rem;
  font-weight: bold;
}
.task-info h4 {
  font-size: 0.95rem;
  color: #f8fafc;
  margin-bottom: 4px;
}
.category-badge {
  font-size: 0.7rem;
  background: rgba(255,255,255,0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: #a1a1aa;
}

/* Timeline Layout */
.timeline-grid {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px;
}
.timeline-grid::-webkit-scrollbar { width: 4px; }

.time-slot-row {
  display: flex;
  min-height: 60px;
  border-bottom: 1px dashed rgba(255,255,255,0.05);
  transition: background-color 0.2s;
}
.time-slot-row:last-child {
  border-bottom: none;
}
.time-slot-row.slot-highlight {
  background: rgba(17,124,117, 0.15);
}

.time-label {
  width: 60px;
  padding-top: 8px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-align: right;
  padding-right: 12px;
  border-right: 2px solid rgba(255,255,255,0.1);
}

.slot-content {
  flex-grow: 1;
  padding: 4px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 50px;
}

.remove-time-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
}
.remove-time-btn:hover {
  color: #ef4444;
}
.done-icon {
  color: #34d399;
  font-weight: bold;
  margin-left: 8px;
}

.class-time-blocked {
  background: rgba(239, 68, 68, 0.03) !important;
  border-bottom-color: rgba(239, 68, 68, 0.08) !important;
  cursor: not-allowed;
}
.class-schedule-block {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .timebox-page { height: auto; min-height: calc(100vh - 100px); }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .date-controls { flex-wrap: wrap; width: 100%; }
  .current-date { min-width: auto; font-size: 0.95rem; width: 100%; text-align: left; }
  .planner-layout {
    grid-template-columns: 1fr;
    gap: 16px;
    overflow: visible;
  }
  .backlog-column { min-height: auto; max-height: 250px; }
  .backlog-list { min-height: 100px; }
  .time-slot-row { min-height: 50px; }
  .time-label { width: 48px; font-size: 0.78rem; padding-right: 8px; }
  .slot-content { padding: 4px 8px; min-height: 40px; }
  .scheduled-task-card { padding: 6px 8px; }
  .scheduled-task-card .task-info h4 { font-size: 0.85rem; }
  .timebox-task-card { padding: 10px; }
  .task-info h4 { font-size: 0.88rem; }
}
</style>
