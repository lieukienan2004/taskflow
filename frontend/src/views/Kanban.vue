<template>
  <div class="kanban-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🗃️ Kanban Board</h1>
        <p class="page-subtitle">Kéo thả công việc để thay đổi trạng thái</p>
      </div>
      <button class="btn btn-primary" @click="showForm = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Tạo Công Việc
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="kanban-board">
      <div v-for="col in columns" :key="col.id" class="kanban-col">
        <div class="col-header">
          <span class="col-icon">{{ col.icon }}</span>
          <span class="col-title">{{ col.label }}</span>
          <div class="skeleton" style="width:28px;height:22px;border-radius:10px;"></div>
        </div>
        <div class="col-body">
          <div v-for="i in 3" :key="i" class="skeleton-kanban-card"></div>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div v-else class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.id"
        class="kanban-col"
        :class="{ 'drag-over': dragOverCol === col.id }"
        @dragover.prevent="onDragOver(col.id)"
        @dragleave="onDragLeave"
        @drop="onDrop(col.id)"
      >
        <!-- Column Header -->
        <div class="col-header" :style="{ borderColor: col.color }">
          <span class="col-icon">{{ col.icon }}</span>
          <span class="col-title">{{ col.label }}</span>
          <span class="col-count" :style="{ background: col.color + '30', color: col.color }">
            {{ tasksByStatus[col.id]?.length || 0 }}
          </span>
        </div>

        <!-- Drop Zone indicator -->
        <div class="drop-hint" v-if="dragOverCol === col.id && draggedTask?.status !== col.id">
          <span>Thả vào đây</span>
        </div>

        <!-- Task Cards -->
        <div class="col-body">
          <div
            v-for="task in tasksByStatus[col.id]"
            :key="task.id"
            class="kanban-card"
            :class="{ dragging: draggedTask?.id === task.id }"
            draggable="true"
            @dragstart="onDragStart(task)"
            @dragend="onDragEnd"
          >
            <!-- Priority Bar -->
            <div class="priority-bar" :class="`pbar-${task.priority}`"></div>

            <!-- Card Content -->
            <div class="card-content">
              <div class="card-top">
                <h4 class="card-title">{{ task.title }}</h4>
                <button class="card-menu-btn" @click.stop="openEdit(task)" title="Chỉnh sửa">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>

              <p v-if="task.description" class="card-desc">{{ task.description }}</p>

              <!-- Meta -->
              <div class="card-meta">
                <span v-if="task.category" class="card-tag">{{ getCategoryIcon(task.category) }} {{ task.category }}</span>
                <span v-if="task.due_date" :class="['card-due', isOverdue(task) ? 'due-overdue' : isNearDue(task) ? 'due-near' : 'due-ok']">
                  📅 {{ formatDate(task.due_date) }}
                </span>
              </div>

              <!-- Priority Badge -->
              <div class="card-footer">
                <span :class="`priority-badge priority-${task.priority}`">
                  {{ task.priority === 'high' ? '🔴 Cao' : task.priority === 'medium' ? '🟡 TB' : '🟢 Thấp' }}
                </span>
                <span class="drag-hint">⠿ kéo thả</span>
              </div>
            </div>
          </div>

          <!-- Empty col -->
          <div v-if="!tasksByStatus[col.id]?.length" class="col-empty">
            <span>{{ col.emptyText }}</span>
          </div>
        </div>

        <!-- Add Task shortcut -->
        <button class="add-task-btn" @click="showFormWithStatus(col.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Thêm công việc
        </button>
      </div>
    </div>

    <!-- Task Form Modal -->
    <TaskForm
      v-if="showForm"
      :task="editingTask"
      :defaultStatus="defaultStatus"
      @close="closeForm"
      @saved="store.fetchTasks"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'
import confetti from '@/utils/confettiHelper'

const store = useTaskStore()
const showForm = ref(false)
const editingTask = ref(null)
const defaultStatus = ref('todo')
const draggedTask = ref(null)
const dragOverCol = ref(null)

const columns = [
  { id: 'todo',        label: 'Chưa Làm',    icon: '⏸',  color: '#64748b', emptyText: 'Chưa có công việc nào' },
  { id: 'in_progress', label: 'Đang Làm',    icon: '▶',  color: '#f59e0b', emptyText: 'Chưa có công việc đang làm' },
  { id: 'done',        label: 'Hoàn Thành',  icon: '✅',  color: '#10b981', emptyText: 'Chưa hoàn thành công việc nào' },
  { id: 'overdue',     label: 'Quá Hạn',     icon: '⚠️', color: '#ef4444', emptyText: 'Không có công việc quá hạn 🎉' },
]

const tasksByStatus = computed(() => {
  const groups = {}
  columns.forEach(c => { groups[c.id] = [] })
  store.tasks.forEach(task => {
    if (groups[task.status]) groups[task.status].push(task)
  })
  return groups
})

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

const isOverdue = (task) => task.status === 'overdue'
const isNearDue = (task) => {
  if (!task.due_date) return false
  const diff = new Date(task.due_date) - new Date()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

// Drag & Drop
const onDragStart = (task) => {
  draggedTask.value = task
}
const onDragEnd = () => {
  dragOverCol.value = null
}
const onDragOver = (colId) => {
  dragOverCol.value = colId
}
const onDragLeave = () => {
  dragOverCol.value = null
}
const onDrop = async (newStatus) => {
  if (!draggedTask.value || draggedTask.value.status === newStatus) {
    draggedTask.value = null
    dragOverCol.value = null
    return
  }
  // Optimistic update
  const task = draggedTask.value
  const oldStatus = task.status
  task.status = newStatus
  draggedTask.value = null
  dragOverCol.value = null

  // Gamification: Bắn pháo hoa khi hoàn thành
  if (newStatus === 'done' && oldStatus !== 'done') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#117c75', '#34d399', '#ffffff']
    })
  }

  try {
    await store.changeStatus(task.id, newStatus)
  } catch {
    task.status = oldStatus
  }
}

const openEdit = (task) => {
  editingTask.value = task
  showForm.value = true
}
const showFormWithStatus = (status) => {
  defaultStatus.value = status
  editingTask.value = null
  showForm.value = true
}
const closeForm = () => {
  showForm.value = false
  editingTask.value = null
  defaultStatus.value = 'todo'
}

onMounted(() => {
  if (!store.tasks.length) store.fetchTasks()
})

const getCategoryIcon = (cat) => {
  const icons = {
    'Học tập': '📚',
    'Đồ án & Luận văn': '🎓',
    'Thi cử & Kiểm tra': '📝',
    'Hoạt động Đoàn - Hội': '🚩',
    'Phát triển kỹ năng': '💡',
    'Việc làm thêm': '💼',
    'Cá nhân': '🏠'
  }
  return icons[cat] || '📁'
}
</script>

<style scoped>
.kanban-page {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.page-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
.page-subtitle { color: var(--text-secondary); font-size: 0.9rem; }

/* Board */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: start;
}

/* Column */
.kanban-col {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  min-height: 500px;
  transition: var(--transition);
  position: relative;
}
.kanban-col.drag-over {
  border-color: var(--accent);
  background: rgba(17,124,117,0.05);
  box-shadow: 0 0 0 2px rgba(17,124,117,0.2);
}

/* Column Header */
.col-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
  border-bottom: 2px solid;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.col-icon { font-size: 1rem; }
.col-title { font-size: 0.9rem; font-weight: 700; flex: 1; color: var(--text-primary); }
.col-count {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 12px;
}

/* Drop hint */
.drop-hint {
  margin: 8px 12px 0;
  padding: 8px;
  border: 2px dashed var(--accent);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.8rem;
  color: var(--accent-light);
  animation: pulse-hint 1s ease infinite;
}
@keyframes pulse-hint {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Col Body */
.col-body {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 65vh;
}

/* Kanban Card */
.kanban-card {
  background: linear-gradient(145deg, rgba(20, 20, 22, 0.8), rgba(10, 10, 12, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  overflow: hidden;
  position: relative;
  user-select: none;
  backdrop-filter: blur(20px);
}
.kanban-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(17,124,117, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.kanban-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(17,124,117, 0.1);
  border-color: rgba(17,124,117, 0.3);
}
.kanban-card:hover::before { opacity: 1; }

.kanban-card.dragging {
  opacity: 0.5;
  transform: scale(0.96) rotate(2deg);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  border-color: rgba(17,124,117, 0.6);
}
.kanban-card:active { cursor: grabbing; }

/* Priority Bar */
.priority-bar {
  width: 4px;
  flex-shrink: 0;
  box-shadow: inset 4px 0 10px rgba(0,0,0,0.5);
}
.pbar-high { background: linear-gradient(to bottom, #ef4444, #b91c1c); }
.pbar-medium { background: linear-gradient(to bottom, #f59e0b, #b45309); }
.pbar-low { background: linear-gradient(to bottom, #10b981, #047857); }

/* Card Content */
.card-content { flex: 1; padding: 14px; }

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
  flex: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  letter-spacing: 0.02em;
}
.card-menu-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a1a1aa;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kanban-card:hover .card-menu-btn { opacity: 1; }
.card-menu-btn:hover { 
  color: #117c75; 
  background: rgba(17,124,117, 0.15); 
  border-color: rgba(17,124,117, 0.4);
}

.card-desc {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Meta */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.card-tag, .card-due {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: 0.03em;
}
.card-tag {
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.due-ok { background: rgba(255, 255, 255, 0.03); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.08); }
.due-near { background: rgba(245, 158, 11, 0.1); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
.due-overdue { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }

/* Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.priority-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.priority-high { color: #fca5a5; }
.priority-medium { color: #fcd34d; }
.priority-low { color: #6ee7b7; }
.drag-hint {
  font-size: 0.65rem;
  color: #52525b;
  opacity: 0;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.kanban-card:hover .drag-hint { opacity: 1; }

/* Empty state */
.col-empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 0.82rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  margin-top: 4px;
}

/* Add Task Button */
.add-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: calc(100% - 24px);
  margin: 8px 12px 12px;
  padding: 8px;
  background: transparent;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition);
}
.add-task-btn:hover {
  border-color: var(--accent);
  color: var(--accent-light);
  background: rgba(17,124,117,0.05);
}

/* Skeleton */
.skeleton-kanban-card {
  height: 110px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

@media (max-width: 1100px) {
  .kanban-board { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .page-header .btn { width: 100%; justify-content: center; }
  .kanban-board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
    padding-bottom: 12px;
  }
  .kanban-col {
    min-width: 280px;
    max-width: 280px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
  .kanban-col .kanban-card { width: 100%; }
  .col-body { max-height: 55vh; }
}
@media (max-width: 640px) {
  .kanban-board { grid-template-columns: 1fr; }
}
</style>
