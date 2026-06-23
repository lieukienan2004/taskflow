<template>
  <div class="templates-page">
    <div class="page-header">
      <div>
        <h1>📋 Mẫu Công Việc</h1>
        <p class="subtitle">Tạo task nhanh từ các mẫu có sẵn hoặc tùy chỉnh mẫu của riêng bạn</p>
      </div>
      <button class="btn-primary" @click="openCreateTemplateModal">+ Tạo Mẫu Mới</button>
    </div>

    <!-- Quick Templates Grid -->
    <div class="section">
      <h2 class="section-title">🚀 Mẫu Nhanh</h2>
      <div class="templates-grid">
        <div v-for="template in quickTemplates" :key="template.id" class="template-card quick">
          <div class="template-icon">{{ template.icon }}</div>
          <h3>{{ template.name }}</h3>
          <p class="template-desc">{{ template.description }}</p>
          <div class="template-stats">
            <span>📝 {{ template.tasks?.length || 0 }} công việc</span>
            <span>⏱️ {{ template.estimatedDays }} ngày</span>
          </div>
          <button @click="useTemplate(template)" class="btn-use">Sử Dụng Mẫu</button>
        </div>
      </div>
    </div>

    <!-- Custom Templates -->
    <div class="section">
      <h2 class="section-title">✨ Mẫu Của Tôi</h2>
      <div v-if="customTemplates.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>Chưa có mẫu tùy chỉnh nào</p>
        <button class="btn-secondary" @click="openCreateTemplateModal">Tạo Mẫu Đầu Tiên</button>
      </div>
      <div v-else class="templates-grid">
        <div v-for="template in customTemplates" :key="template.id" class="template-card custom">
          <div class="template-icon">{{ template.icon || '📋' }}</div>
          <h3>{{ template.name }}</h3>
          <p class="template-desc">{{ template.description }}</p>
          <div class="template-stats">
            <span>📝 {{ template.tasks?.length || 0 }} công việc</span>
          </div>
          <div class="template-actions">
            <button @click="useTemplate(template)" class="btn-use">Sử Dụng</button>
            <button @click="editTemplate(template)" class="btn-icon">✏️</button>
            <button @click="deleteTemplate(template.id)" class="btn-icon delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Sửa Mẫu' : 'Tạo Mẫu Mới' }}</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Tên mẫu</label>
            <input v-model="form.name" placeholder="Ví dụ: Đồ án môn học" required>
          </div>
          <div class="form-group">
            <label>Mô tả</label>
            <textarea v-model="form.description" placeholder="Mô tả ngắn về mẫu này" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Icon</label>
              <input v-model="form.icon" placeholder="📚" maxlength="2">
            </div>
            <div class="form-group">
              <label>Thời gian ước tính (ngày)</label>
              <input v-model.number="form.estimatedDays" type="number" min="1">
            </div>
          </div>

          <div class="form-group">
            <label>Danh sách công việc</label>
            <div class="tasks-list">
              <div v-for="(task, index) in form.tasks" :key="index" class="task-item">
                <input v-model="task.title" placeholder="Tên công việc" class="task-input">
                <select v-model="task.priority" class="priority-select">
                  <option value="low">Thấp</option>
                  <option value="medium">Vừa</option>
                  <option value="high">Cao</option>
                </select>
                <button @click="removeTask(index)" class="btn-remove">✕</button>
              </div>
            </div>
            <button @click="addTask" class="btn-add-task">+ Thêm Công Việc</button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Hủy</button>
          <button @click="saveTemplate" class="btn-save">{{ isEdit ? 'Cập Nhật' : 'Tạo Mẫu' }}</button>
        </div>
      </div>
    </div>

    <!-- Use Template Modal -->
    <div v-if="showUseModal" class="modal" @click.self="closeUseModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedTemplate?.icon }} {{ selectedTemplate?.name }}</h2>
          <button @click="closeUseModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <p class="use-template-desc">{{ selectedTemplate?.description }}</p>
          
          <div class="form-group">
            <label>Tiêu đề dự án/nhiệm vụ chính</label>
            <input v-model="projectTitle" placeholder="Ví dụ: Đồ án Lập trình Web" required>
          </div>

          <div class="form-group">
            <label>Ngày bắt đầu</label>
            <input v-model="startDate" type="date" required>
          </div>

          <div class="preview-tasks">
            <h4>Các công việc sẽ được tạo:</h4>
            <div v-for="(task, i) in selectedTemplate?.tasks" :key="i" class="preview-task">
              <span class="preview-priority" :class="task.priority">●</span>
              <span>{{ task.title }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeUseModal" class="btn-cancel">Hủy</button>
          <button @click="createFromTemplate" class="btn-save">Tạo {{ selectedTemplate?.tasks?.length }} Công Việc</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useRouter } from 'vue-router'

const taskStore = useTaskStore()
const router = useRouter()

const showModal = ref(false)
const showUseModal = ref(false)
const isEdit = ref(false)
const selectedTemplate = ref(null)
const projectTitle = ref('')
const startDate = ref('')

const form = ref({
  name: '',
  description: '',
  icon: '📋',
  estimatedDays: 7,
  tasks: []
})

// Quick Templates (built-in)
const quickTemplates = ref([
  {
    id: 'doan',
    name: 'Đồ Án Môn Học',
    icon: '🎓',
    description: 'Quy trình hoàn thành đồ án từ nghiên cứu đến báo cáo',
    estimatedDays: 21,
    tasks: [
      { title: 'Nghiên cứu đề tài và tìm tài liệu', priority: 'high' },
      { title: 'Viết đề cương và xác nhận với giảng viên', priority: 'high' },
      { title: 'Thiết kế kiến trúc hệ thống', priority: 'high' },
      { title: 'Phát triển chức năng chính', priority: 'high' },
      { title: 'Viết báo cáo phần lý thuyết', priority: 'medium' },
      { title: 'Hoàn thiện giao diện', priority: 'medium' },
      { title: 'Test và fix bug', priority: 'high' },
      { title: 'Viết báo cáo hoàn chỉnh', priority: 'high' },
      { title: 'Chuẩn bị slide thuyết trình', priority: 'high' },
      { title: 'Thực hành thuyết trình', priority: 'medium' }
    ]
  },
  {
    id: 'baitap',
    name: 'Bài Tập Lớn',
    icon: '📝',
    description: 'Hoàn thành bài tập nhóm hoặc cá nhân',
    estimatedDays: 10,
    tasks: [
      { title: 'Đọc và hiểu yêu cầu đề bài', priority: 'high' },
      { title: 'Phân tích và lên kế hoạch', priority: 'high' },
      { title: 'Chia nhỏ công việc và phân công (nếu nhóm)', priority: 'medium' },
      { title: 'Thực hiện phần 1', priority: 'high' },
      { title: 'Thực hiện phần 2', priority: 'high' },
      { title: 'Review và chỉnh sửa', priority: 'medium' },
      { title: 'Viết báo cáo/trình bày kết quả', priority: 'high' },
      { title: 'Kiểm tra lần cuối và nộp bài', priority: 'high' }
    ]
  },
  {
    id: 'onthi',
    name: 'Ôn Thi Cuối Kỳ',
    icon: '📚',
    description: 'Kế hoạch ôn tập hiệu quả cho kỳ thi',
    estimatedDays: 14,
    tasks: [
      { title: 'Tổng hợp tài liệu và đề cương', priority: 'high' },
      { title: 'Ôn chương 1-2', priority: 'high' },
      { title: 'Ôn chương 3-4', priority: 'high' },
      { title: 'Ôn chương 5-6', priority: 'high' },
      { title: 'Làm đề thi thử lần 1', priority: 'high' },
      { title: 'Ôn lại kiến thức yếu', priority: 'medium' },
      { title: 'Làm đề thi thử lần 2', priority: 'high' },
      { title: 'Ôn tổng hợp và nghỉ ngơi', priority: 'medium' }
    ]
  },
  {
    id: 'research',
    name: 'Nghiên Cứu Khoa Học',
    icon: '🔬',
    description: 'Quy trình thực hiện nghiên cứu khoa học',
    estimatedDays: 30,
    tasks: [
      { title: 'Xác định vấn đề nghiên cứu', priority: 'high' },
      { title: 'Tìm kiếm và đọc tài liệu liên quan', priority: 'high' },
      { title: 'Thiết kế phương pháp nghiên cứu', priority: 'high' },
      { title: 'Thu thập dữ liệu', priority: 'high' },
      { title: 'Phân tích dữ liệu', priority: 'high' },
      { title: 'Viết bản thảo báo cáo', priority: 'high' },
      { title: 'Review và chỉnh sửa', priority: 'medium' },
      { title: 'Hoàn thiện báo cáo cuối cùng', priority: 'high' }
    ]
  }
])

const customTemplates = ref([])

onMounted(() => {
  loadCustomTemplates()
  // Set default start date to today
  const today = new Date().toISOString().split('T')[0]
  startDate.value = today
})

const loadCustomTemplates = () => {
  const saved = localStorage.getItem('taskflow_custom_templates')
  if (saved) {
    try {
      customTemplates.value = JSON.parse(saved)
    } catch (e) {
      console.error('Error loading templates:', e)
    }
  }
}

const saveCustomTemplates = () => {
  localStorage.setItem('taskflow_custom_templates', JSON.stringify(customTemplates.value))
}

const openCreateTemplateModal = () => {
  isEdit.value = false
  form.value = {
    name: '',
    description: '',
    icon: '📋',
    estimatedDays: 7,
    tasks: []
  }
  showModal.value = true
}

const editTemplate = (template) => {
  isEdit.value = true
  form.value = JSON.parse(JSON.stringify(template))
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const addTask = () => {
  form.value.tasks.push({
    title: '',
    priority: 'medium'
  })
}

const removeTask = (index) => {
  form.value.tasks.splice(index, 1)
}

const saveTemplate = () => {
  if (!form.value.name || form.value.tasks.length === 0) {
    taskStore.showToast('Vui lòng nhập tên mẫu và ít nhất 1 công việc', 'error')
    return
  }

  if (isEdit.value) {
    const index = customTemplates.value.findIndex(t => t.id === form.value.id)
    if (index !== -1) {
      customTemplates.value[index] = { ...form.value }
    }
    taskStore.showToast('Đã cập nhật mẫu!', 'success')
  } else {
    const newTemplate = {
      ...form.value,
      id: 'custom_' + Date.now()
    }
    customTemplates.value.push(newTemplate)
    taskStore.showToast('Đã tạo mẫu mới!', 'success')
  }

  saveCustomTemplates()
  closeModal()
}

const deleteTemplate = (id) => {
  if (confirm('Xóa mẫu này?')) {
    customTemplates.value = customTemplates.value.filter(t => t.id !== id)
    saveCustomTemplates()
    taskStore.showToast('Đã xóa mẫu!', 'success')
  }
}

const useTemplate = (template) => {
  selectedTemplate.value = template
  projectTitle.value = ''
  showUseModal.value = true
}

const closeUseModal = () => {
  showUseModal.value = false
  selectedTemplate.value = null
}

const createFromTemplate = async () => {
  if (!projectTitle.value || !startDate.value) {
    taskStore.showToast('Vui lòng nhập đầy đủ thông tin', 'error')
    return
  }

  try {
    const template = selectedTemplate.value
    const baseDate = new Date(startDate.value)
    const daysPerTask = template.estimatedDays / template.tasks.length

    // Create tasks
    for (let i = 0; i < template.tasks.length; i++) {
      const task = template.tasks[i]
      const dueDate = new Date(baseDate)
      dueDate.setDate(dueDate.getDate() + Math.floor(daysPerTask * (i + 1)))

      const taskData = {
        title: `${projectTitle.value} - ${task.title}`,
        description: `Từ mẫu: ${template.name}`,
        priority: task.priority,
        status: 'todo',
        due_date: dueDate.toISOString().split('T')[0]
      }

      await taskStore.createTask(taskData)
    }

    taskStore.showToast(`✅ Đã tạo ${template.tasks.length} công việc thành công!`, 'success')
    closeUseModal()
    router.push('/tasks')
  } catch (err) {
    taskStore.showToast('Lỗi khi tạo công việc', 'error')
    console.error(err)
  }
}
</script>

<style scoped>
.templates-page {
  padding: 0;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.375rem;
}

.btn-primary {
  background: #117c75;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #0e6b64;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.25);
}

.section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.template-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  border-color: #117c75;
  box-shadow: 0 4px 12px rgba(17,124,117, 0.15);
  transform: translateY(-2px);
}

.template-card.quick {
  border-left: 4px solid #10b981;
}

.template-card.custom {
  border-left: 4px solid #f59e0b;
}

.template-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.template-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.template-desc {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  flex: 1;
  line-height: 1.5;
}

.template-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.btn-use {
  background: #117c75;
  color: white;
  border: none;
  padding: 0.625rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-use:hover {
  background: #0e6b64;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.template-actions .btn-use {
  flex: 1;
}

.btn-icon {
  background: white;
  border: 2px solid #e2e8f0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #117c75;
  color: #117c75;
}

.btn-icon.delete:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  color: #475569;
}

/* Modal Styles */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white !important;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  color: #1e293b !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b !important;
  margin: 0;
}

.close-btn {
  background: white !important;
  border: 2px solid #e2e8f0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b !important;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #fee2e2 !important;
  border-color: #fca5a5;
  color: #dc2626 !important;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #334155 !important;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white !important;
  color: #1e293b !important;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #117c75;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.task-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.task-input {
  flex: 1;
  padding: 0.625rem 0.875rem !important;
}

.priority-select {
  padding: 0.625rem 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white !important;
  color: #1e293b !important;
  font-size: 0.875rem;
  cursor: pointer;
}

.priority-select:focus {
  outline: none;
  border-color: #117c75;
}

.btn-remove {
  background: white;
  border: 2px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.btn-add-task {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  color: #64748b;
  padding: 0.625rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-add-task:hover {
  border-color: #117c75;
  color: #117c75;
  background: #f0fdfa;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: white !important;
}

.btn-cancel {
  background: white !important;
  color: #64748b !important;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1;
}

.btn-save {
  background: #117c75 !important;
  color: white !important;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #0e6b64 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.3);
}

/* Use Template Modal */
.use-template-desc {
  color: #64748b;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.preview-tasks {
  margin-top: 1.5rem;
}

.preview-tasks h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #475569 !important;
  margin: 0 0 0.75rem 0;
}

.preview-task {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #334155 !important;
}

.preview-priority {
  font-size: 0.625rem;
}

.preview-priority.high {
  color: #ef4444;
}

.preview-priority.medium {
  color: #f59e0b;
}

.preview-priority.low {
  color: #10b981;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .task-item {
    flex-direction: column;
  }
  
  .task-input,
  .priority-select {
    width: 100%;
  }
}
</style>
