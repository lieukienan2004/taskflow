<template>
  <div class="task-card" :class="[`card-${task.priority}`, { 'card-overdue': isOverdue, 'card-done': task.status === 'done' }]">
    <div class="card-head">
      <div class="card-left">
        <span :class="['status-dot', task.status, { 'dot-overdue': isOverdue }]"></span>
        <h4 class="card-title" :class="{ 'done-text': task.status === 'done' }" @click="goToDetail">{{ task.title }}</h4>
        <span v-if="isOverdue" class="overdue-badge">⚠️ Trễ hạn</span>
      </div>
      <div class="card-actions">
        <button class="btn-act" title="Sửa" @click="$emit('edit', task)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536M9 11l-3 3V7h3l3-3H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-7"/></svg>
        </button>
        <button class="btn-act btn-del" title="Xóa" @click="confirmDelete">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
        </button>
      </div>
    </div>

    <p v-if="task.description" class="card-desc">{{ task.description }}</p>

    <div class="card-tail">
      <div class="card-tags">
        <span class="tag" :class="`tag-${task.status}`">{{ statusLabel }}</span>
        <span class="tag tag-priority" :class="`tag-${task.priority}`">{{ priorityLabel }}</span>
        <span v-if="task.category" class="tag tag-cat">{{ task.category }}</span>
        <span v-if="task.project_id" class="tag tag-source tag-project">📁 Dự án</span>
        <span v-else-if="task.is_objective" class="tag tag-source tag-objective">🎯 Mục tiêu</span>
        <span v-else class="tag tag-source tag-personal">👤 Cá nhân</span>
      </div>
      <div class="card-right">
        <span v-if="task.due_date" class="card-date" :class="{ 'date-overdue': isOverdue, 'date-soon': isDueSoon }" @click="goToDetail">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ formatShortDate(task.due_date) }}
        </span>
        <button
          v-if="task.status === 'todo' && !isOverdue"
          class="btn-action btn-start"
          @click="quickStatus"
        >
          Bắt đầu
        </button>
        <button
          v-else-if="task.status === 'in_progress'"
          class="btn-action btn-finish"
          @click="quickStatus"
        >
          Xong
        </button>
        <span v-else-if="task.status === 'done'" class="tag tag-done">✓ Hoàn thành</span>
        <span v-else-if="isOverdue" class="tag tag-overdue">⚠️ Trễ hạn</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

const router = useRouter()
const goToDetail = () => router.push(`/tasks/${props.task.id}`)

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['edit', 'deleted', 'change-status'])

const store = useTaskStore()

const statusLabel = computed(() => ({
  todo: 'Chưa làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
  overdue: 'Quá hạn',
}[props.task.status] || props.task.status))

const priorityLabel = computed(() => ({
  low: 'Thấp',
  medium: 'TB',
  high: 'Cao',
}[props.task.priority]))

// Check if task is overdue: has due_date, not done/cancelled, and past due
const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  if (props.task.status === 'done' || props.task.status === 'cancelled') return false
  
  const now = new Date()
  const dueDate = new Date(props.task.due_date)
  return dueDate < now
})

const isDueSoon = computed(() => {
  if (!props.task.due_date || props.task.status === 'done' || isOverdue.value) return false
  const diff = new Date(props.task.due_date) - new Date()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
})

const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

const quickStatus = () => {
  const nextStatus = props.task.status === 'todo' ? 'in_progress' : 'done'
  emit('change-status', props.task.id, nextStatus)
}

const confirmDelete = async () => {
  if (confirm(`Xóa công việc "${props.task.title}"?`)) {
    await store.deleteTask(props.task.id)
    emit('deleted')
  }
}
</script>

<style scoped>
.task-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #d5ebe9;
  border-radius: 14px;
  transition: all 0.2s ease;
}
.task-card:hover {
  border-color: #99d6cf;
  box-shadow: 0 6px 20px rgba(17,124,117,0.1);
}

.card-high { border-left: 4px solid #ef4444; }
.card-medium { border-left: 4px solid #f59e0b; }
.card-low { border-left: 4px solid #10b981; }

.card-overdue {
  background: rgba(239, 68, 68, 0.04);
  border-color: #fca5a5 !important;
  border-left-width: 4px !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);
}
.card-overdue:hover {
  background: rgba(239, 68, 68, 0.06);
  border-color: #f87171 !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.12);
}
.card-done { opacity: 0.65; background: #f0fdfa; border-color: #99f6e4; }
.card-done:hover { opacity: 0.85; }

/* Head */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.todo { background: #94a3b8; }
.status-dot.in_progress { background: #f59e0b; }
.status-dot.done { background: #10b981; }
.status-dot.overdue { background: #ef4444; }
.status-dot.dot-overdue {
  background: #ef4444 !important;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.overdue-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  cursor: pointer;
  line-height: 1.4;
}
.card-title:hover { color: #117c75; }
.done-text { text-decoration: line-through; color: #94a3b8; }

.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.btn-act {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}
.btn-act:hover { background: #f1f5f9; color: #64748b; }
.btn-del:hover { background: #fef2f2; color: #dc2626; }

/* Description */
.card-desc {
  font-size: 0.88rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Tail */
.card-tail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid #e6f2f0;
}
.card-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
}
.tag-todo { color: #6b7280; background: #e6f7f5; }
.tag-in_progress { color: #92400e; background: #fffbeb; }
.tag-done { color: #065f46; background: #ccfbf1; }
.tag-overdue { color: #b91c1c; background: #fef2f2; }
.tag-priority { background: #f8fafc; border: 1px solid #d1d5db; }
.tag-high { color: #b91c1c; }
.tag-medium { color: #92400e; }
.tag-low { color: #065f46; }
.tag-cat { color: #334155; background: #f1f5f9; }
.tag-source { font-size: 0.68rem; padding: 3px 8px; }
.tag-personal { color: #059669; background: #ecfdf5; }
.tag-project { color: #7c3aed; background: #f5f3ff; }
.tag-objective { color: #d97706; background: #fffbeb; }

.card-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.card-date {
  font-size: 0.82rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
}
.card-date:hover { color: #64748b; }
.date-overdue { color: #b91c1c !important; font-weight: 600; }
.date-soon { color: #b45309 !important; font-weight: 600; }

.btn-action {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}
.btn-start { background: #e6f7f5; color: #117c75; }
.btn-start:hover { background: #ccfbf1; }
.btn-finish { background: #e6f7f5; color: #117c75; }
.btn-finish:hover { background: #ccfbf1; }
.btn-re { background: #e6f7f5; color: #0e6b64; }
.btn-re:hover { background: #ccfbf1; }

@media (max-width: 768px) {
  .task-card { padding: 14px 16px; border-radius: 12px; }
  .card-head { gap: 8px; }
  .card-title { font-size: 0.88rem; }
  .card-sub { font-size: 0.75rem; }
  .tag-source { font-size: 0.7rem; }
  .tag { font-size: 0.72rem; padding: 3px 8px; }
  .overdue-badge { font-size: 0.72rem; }
  .btn-act { width: 34px; height: 34px; }
  .btn-action { min-height: 44px; padding: 8px 16px; font-size: 0.82rem; }
  .card-tail { gap: 8px; }
  .due-text { font-size: 0.75rem; }
}
</style>
