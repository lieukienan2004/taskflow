<template>
  <div class="tasks-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M9 11l3-3 3 3"/><path d="M9 17l3-3 3 3"/><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h3"/><path d="M14 12h-4" stroke="#117c75" stroke-width="1.5"/></svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">Nhiệm Vụ</h1>
          <p class="page-subtitle">Quản lý và theo dõi tiến độ công việc</p>
        </div>
      </div>
      <button class="btn-create-header" @click="showForm = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Tạo Nhiệm Vụ
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter-left">
        <div class="seg-group">
          <button v-for="s in statusOptions" :key="s.value" :class="['seg-btn', 'status-btn', { active: store.filters.status === s.value }]" :data-status="s.value" @click="store.filters.status = s.value">
            {{ s.label }}
            <span class="seg-count">{{ s.value === '' ? store.taskCounts.all : store.taskCounts[s.value] || 0 }}</span>
          </button>
        </div>
      </div>
      <div class="filter-right">
        <select v-model="store.filters.priority" class="mini-select">
          <option value="">Ưu tiên</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
        <select v-model="store.filters.category" class="mini-select">
          <option value="">Danh mục</option>
          <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="sortBy" class="mini-select">
          <option value="">Sắp xếp</option>
          <option value="due_asc">Hạn gần</option>
          <option value="due_desc">Hạn xa</option>
        </select>
        <button v-if="hasActiveFilters || sortBy" class="btn-clear" @click="clearFilters">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Bỏ lọc
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="task-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <div class="skeleton" style="height:20px;width:60%;margin-bottom:10px"></div>
        <div class="skeleton" style="height:14px;width:90%;margin-bottom:8px"></div>
        <div class="skeleton" style="height:14px;width:70%"></div>
      </div>
    </div>

    <div v-else-if="sortedTasks.length > 0" class="task-grid">
      <TaskCard v-for="task in sortedTasks" :key="task.id" :task="task" @edit="openEdit" @change-status="store.changeStatus" />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>{{ hasActiveFilters ? 'Không tìm thấy kết quả' : 'Chưa có nhiệm vụ nào' }}</h3>
      <p>{{ hasActiveFilters ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Tạo nhiệm vụ đầu tiên để bắt đầu!' }}</p>
      <button v-if="!hasActiveFilters" class="btn-create" @click="showForm = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Tạo Nhiệm Vụ
      </button>
    </div>

    <TaskForm v-if="showForm" :task="editingTask" @close="closeForm" @saved="store.fetchTasks" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'

const store = useTaskStore()
const showForm = ref(false)
const editingTask = ref(null)
const sortBy = ref('')

const sortedTasks = computed(() => {
  let list = [...store.filteredTasks]
  if (sortBy.value === 'due_asc') list.sort((a, b) => { if (!a.due_date) return 1; if (!b.due_date) return -1; return new Date(a.due_date) - new Date(b.due_date) })
  else if (sortBy.value === 'due_desc') list.sort((a, b) => { if (!a.due_date) return 1; if (!b.due_date) return -1; return new Date(b.due_date) - new Date(a.due_date) })
  return list
})

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'todo', label: 'Chưa làm' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'overdue', label: 'Quá hạn' },
]

const uniqueCategories = computed(() => [...new Set(store.tasks.map(t => t.category).filter(Boolean))])
const hasActiveFilters = computed(() => store.filters.status || store.filters.priority || store.filters.category || store.filters.search)
const openEdit = (task) => { editingTask.value = task; showForm.value = true }
const closeForm = () => { showForm.value = false; editingTask.value = null }
const clearFilters = () => { store.filters.status = ''; store.filters.priority = ''; store.filters.category = ''; store.filters.search = ''; sortBy.value = '' }
</script>

<style scoped>
.tasks-page { padding: 0; display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.75rem; background: linear-gradient(135deg, #f0fdf8 0%, #ecfdf5 50%, #f8fafc 100%); border-radius: 20px; box-shadow: 0 4px 20px rgba(15,23,42,0.05); border: 1px solid rgba(16,185,129,0.12); }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 14px; box-shadow: 0 2px 8px rgba(16,185,129,0.15); }
.page-title { font-size: 1.5rem; font-weight: 800; color: #064e3b; margin: 0; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.82rem; color: #6b7280; margin: 0; font-weight: 500; }

.filter-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding: 8px 12px; background: #fff; border-radius: 14px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.04); border: 1px solid rgba(148,163,184,0.12);
}
.filter-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.seg-group { display: flex; gap: 3px; padding: 3px; background: #f1f5f9; border-radius: 10px; }
.seg-btn {
  padding: 6px 12px; border-radius: 8px; border: none; background: transparent;
  color: #64748b; font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; display: inline-flex; align-items: center; gap: 5px;
  font-family: inherit; white-space: nowrap;
}
.seg-btn:hover { color: #334155; background: rgba(255,255,255,0.6); }
.seg-btn.active { color: #059669; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.seg-icon { font-size: 0.82rem; }
.seg-count { font-size: 0.65rem; background: #d1fae5; color: #065f46; padding: 1px 6px; border-radius: 999px; font-weight: 700; }
.seg-btn.active .seg-count { background: #059669; color: #fff; }

.status-btn.active[data-status="overdue"] { color: #991b1b; background: #fef2f2; }
.status-btn.active[data-status="done"] { color: #1e40af; background: #eff6ff; }

.mini-select {
  appearance: none; padding: 6px 28px 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 8px; color: #475569; font-size: 0.78rem; font-family: inherit; font-weight: 600;
  outline: none; cursor: pointer; transition: all 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
}
.mini-select:hover { border-color: #cbd5e1; background-color: #fff; }
.mini-select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }
.mini-select option { background: #fff; color: #0f172a; }

.btn-clear {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px;
  background: #fff; border: 1px solid #e2e8f0; color: #64748b; font-size: 0.78rem;
  font-weight: 600; cursor: pointer; border-radius: 8px; font-family: inherit; white-space: nowrap;
  transition: all 0.2s;
}
.btn-clear:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

.task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; padding-top: 0.25rem; }
.skeleton-card { background: #fff; border: 1px solid rgba(148,163,184,0.2); border-radius: 22px; padding: 22px; box-shadow: 0 8px 24px rgba(15,23,42,0.05); }
.skeleton { background: linear-gradient(90deg, #f1f5f9 20%, #e2e8f0 50%, #f1f5f9 80%); background-size: 200% 100%; animation: shimmer 1.6s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-state { text-align: center; padding: 3.5rem 1.5rem; background: #fff; border: 1px dashed rgba(148,163,184,0.4); border-radius: 22px; box-shadow: 0 4px 20px rgba(15,23,42,0.05); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.8; }
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; }
.empty-state p { color: #64748b; font-size: 0.92rem; margin-bottom: 1.5rem; }
.btn-create { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; border-radius: 14px; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; font-family: inherit; white-space: nowrap; box-shadow: 0 10px 24px rgba(16,185,129,0.2); }
.btn-create:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(16,185,129,0.3); }

.btn-create-header { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; border-radius: 14px; color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.25s ease; font-family: inherit; white-space: nowrap; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
.btn-create-header:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.4); }

@media (max-width: 900px) {
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-left, .filter-right { width: 100%; overflow-x: auto; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; }
  .page-title { font-size: 1.2rem; }
  .page-subtitle { font-size: 0.8rem; }
  .btn-create { width: 100%; min-height: 44px; }
  .filter-bar { flex-direction: column; gap: 10px; padding: 12px; }
  .seg-group { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
  .seg-btn { min-height: 40px; font-size: 0.82rem; white-space: nowrap; }
  .seg-count { font-size: 0.72rem; }
  .filter-right { flex-direction: column; gap: 8px; }
  .mini-select { width: 100%; min-height: 40px; font-size: 0.85rem; }
  .btn-clear-filter { width: 100%; min-height: 40px; }
  .task-grid { grid-template-columns: 1fr; gap: 12px; }
  .empty-state { padding: 2rem 1rem; }
  .empty-state .btn { width: 100%; }
}
</style>
