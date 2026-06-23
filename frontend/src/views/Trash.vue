<template>
  <div class="trash-page-container">
    <!-- Header Area -->
    <div class="trash-header">
      <div class="header-left">
        <h1>🗑️ Thùng Rác</h1>
        <p class="subtitle">Khôi phục các công việc đã xóa hoặc xóa chúng vĩnh viễn khỏi hệ thống.</p>
      </div>
      <button 
        v-if="trashTasks.length > 0" 
        @click="handleEmptyTrash" 
        class="empty-trash-btn"
        title="Dọn sạch tất cả công việc trong thùng rác"
      >
        Dọn sạch thùng rác
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải danh sách công việc đã xóa...</p>
    </div>

    <!-- Trash Cards Grid -->
    <div v-else-if="trashTasks.length > 0" class="trash-grid">
      <div 
        v-for="task in trashTasks" 
        :key="task.id" 
        class="trash-card glass-card"
      >
        <!-- Card content -->
        <div class="card-body">
          <div class="card-header-row">
            <span class="badge" :class="'priority-' + task.priority">{{ formatPriority(task.priority) }}</span>
            <span class="category-tag">📂 {{ task.category || 'Chung' }}</span>
          </div>

          <h3 class="card-title">{{ task.title }}</h3>
          
          <p class="card-desc" v-if="task.description">
            {{ formatSnippet(task.description) }}
          </p>
          <p class="card-desc empty-desc" v-else>Không có mô tả chi tiết.</p>

          <div class="deleted-date-row">
            <span>🗑️ Đã xóa ngày: {{ formatDateTime(task.deleted_at) }}</span>
          </div>
        </div>

        <!-- Action Row -->
        <div class="card-actions-row">
          <button @click="handleRestore(task.id)" class="restore-btn">
            Khôi phục
          </button>
          <button @click="handlePermanentDelete(task.id)" class="delete-btn">
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state glass-card">
      <div class="empty-icon">🗑️</div>
      <h2>Thùng rác trống</h2>
      <p>Không có công việc nào bị xóa tạm thời.</p>
      <router-link to="/tasks" class="back-btn">Quay lại Danh sách công việc</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { trashApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

const trashTasks = ref([])
const loading = ref(true)

const fetchTrash = async () => {
  loading.value = true
  try {
    const res = await trashApi.getAll()
    trashTasks.value = res.data.data
  } catch (err) {
    console.error('Lỗi khi tải thùng rác:', err)
    taskStore.showToast('❌ Không thể tải danh sách thùng rác', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrash()
})

const handleRestore = async (id) => {
  try {
    await trashApi.restore(id)
    taskStore.showToast('✅ Khôi phục công việc thành công!')
    trashTasks.value = trashTasks.value.filter(t => t.id !== id)
    // Refresh main task store list so the restored task is available
    await taskStore.fetchTasks()
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Khôi phục công việc thất bại', 'error')
  }
}

const handlePermanentDelete = async (id) => {
  if (!confirm('HÀNH ĐỘNG NÀY KHÔNG THỂ HOÀN TÁC!\nBạn có chắc muốn XÓA VĨNH VIỄN công việc này cùng toàn bộ bình luận, tài liệu đính kèm liên quan?')) return
  try {
    await trashApi.permanentDelete(id)
    taskStore.showToast('🗑️ Đã xóa vĩnh viễn công việc thành công')
    trashTasks.value = trashTasks.value.filter(t => t.id !== id)
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Xóa vĩnh viễn thất bại', 'error')
  }
}

const handleEmptyTrash = async () => {
  if (!confirm('CẢNH BÁO ĐẶC BIỆT CỦA HỆ THỐNG!\nBạn có chắc chắn muốn DỌN SẠCH TOÀN BỘ thùng rác? Tất cả công việc đã xóa sẽ biến mất vĩnh viễn và không thể phục hồi!')) return
  try {
    await trashApi.emptyTrash()
    taskStore.showToast('🗑️ Đã dọn sạch thùng rác thành công')
    trashTasks.value = []
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Dọn sạch thùng rác thất bại', 'error')
  }
}

// Helpers
const formatPriority = (p) => {
  if (p === 'high') return 'Cao'
  if (p === 'low') return 'Thấp'
  return 'Trung bình'
}

const formatSnippet = (desc) => {
  if (desc.length <= 95) return desc
  return desc.substring(0, 95) + '...'
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.trash-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.trash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 20px;
}

.trash-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary, #94a3b8);
  margin: 0;
}

.empty-trash-btn {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #f43f5e;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.empty-trash-btn:hover {
  background: #f43f5e;
  color: #ffffff;
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  transform: translateY(-2px);
}

.empty-trash-btn:active {
  transform: translateY(0);
}

/* Glass Card styling */
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

/* Trash Grid */
.trash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.trash-card {
  display: flex;
  flex-direction: column;
  height: 250px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.trash-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
}

.card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-high { background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); }
.priority-medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.priority-low { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }

.category-tag {
  font-size: 12px;
  color: var(--text-secondary, #94a3b8);
  font-weight: 500;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-desc {
  color: #64748b;
  font-style: italic;
}

.deleted-date-row {
  font-size: 12px;
  color: #f43f5e;
  font-weight: 500;
}

/* Actions */
.card-actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.3);
}

.restore-btn, .delete-btn {
  border: none;
  background: none;
  font-weight: 600;
  font-size: 13px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  outline: none;
}

.restore-btn {
  color: #10b981;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.restore-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 50px 30px;
  max-width: 500px;
  margin: 40px auto 0 auto;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 22px;
  color: #ffffff;
  margin: 0 0 10px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 30px;
}

.back-btn {
  display: inline-block;
  background: var(--accent, #2dd4bf);
  color: #1a1a2e;
  border: none;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 20px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(251, 191, 36, 0.25);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}

.loading-state p {
  color: #94a3b8;
  margin-top: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--accent, #2dd4bf);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Light theme general override inside trash component specifically */
:global(.light-theme) .empty-trash-btn {
  background: rgba(239, 68, 68, 0.08);
}
:global(.light-theme) .empty-trash-btn:hover {
  background: #ef4444;
}
:global(.light-theme) .trash-card {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
:global(.light-theme) .card-title {
  color: #1a1a2e;
}
:global(.light-theme) .card-actions-row {
  background: rgba(0, 0, 0, 0.02);
}
</style>
