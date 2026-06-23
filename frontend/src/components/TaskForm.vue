<template>
  <div class="task-form-overlay" @click.self="$emit('close')">
    <div class="task-form-box">
      <div class="form-header">
        <h3>{{ isEdit ? 'Chỉnh Sửa Nhiệm Vụ' : 'Tạo Nhiệm Vụ Mới' }}</h3>
        <button class="btn btn-icon btn-secondary" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form-body">
        <!-- Title -->
        <div class="form-group">
          <label class="form-label">Tiêu đề <span class="required">*</span></label>
          <input
            v-model="form.title"
            class="form-input"
            placeholder="Nhập tiêu đề nhiệm vụ..."
            required
            autofocus
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Mô tả</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="Mô tả chi tiết nhiệm vụ..."
          />
        </div>

        <!-- Category -->
        <div class="form-group">
          <label class="form-label">Danh mục</label>
          <select v-model="selectedCategory" class="form-select" @change="handleCategoryChange">
            <option v-for="cat in categoriesList" :key="cat" :value="cat">
              {{ cat }}
            </option>
            <option value="custom">Khác (Tự nhập)...</option>
          </select>
          <input
            v-if="selectedCategory === 'custom'"
            v-model="customCategory"
            class="form-input"
            placeholder="Nhập danh mục tự chọn..."
            @input="form.category = customCategory"
            style="margin-top: 8px;"
          />
        </div>

        <!-- Subject / Project link -->
        <div class="form-group">
          <label class="form-label">Dự án liên kết</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <select v-model="form.subject_id" class="form-select" style="flex: 1;">
              <option value="">-- Không liên kết --</option>
              <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
            <button type="button" class="btn-link-small" @click="loadSubjects" title="Làm mới danh sách">⟳</button>
          </div>
          <p v-if="subjects.length === 0" class="hint-text">👉 Vào <strong>Mục tiêu & Kế hoạch</strong> (⚙️) để tạo dự án trước.</p>
          <p v-else class="hint-text-muted">💡 Chưa có dự án phù hợp? Vào <strong>Mục tiêu & Kế hoạch</strong> (⚙️) để thêm mới.</p>
        </div>

        <!-- Row: Priority + Status -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ưu tiên</label>
            <select v-model="form.priority" class="form-select">
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Trạng thái</label>
            <select v-model="form.status" class="form-select">
              <option value="todo">Chưa làm</option>
              <option value="in_progress">Đang làm</option>
              <option value="done">Hoàn thành</option>
            </select>
          </div>
        </div>

        <!-- Due Date -->
        <div class="form-group">
          <label class="form-label">Hạn chót</label>
          <input
            v-model="form.due_date"
            class="form-input"
            type="datetime-local"
          />
          <div v-if="scheduleWarning" class="schedule-warning-text">{{ scheduleWarning }}</div>
        </div>

        <!-- Row: Start Time + End Time -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Thời gian bắt đầu</label>
            <input
              v-model="form.start_time"
              class="form-input"
              type="datetime-local"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Thời gian kết thúc</label>
            <input
              v-model="form.end_time"
              class="form-input"
              type="datetime-local"
            />
            <div v-if="endTimeWarning" class="schedule-warning-text">{{ endTimeWarning }}</div>
          </div>
        </div>

        <!-- Recurrence -->
        <div class="form-group">
          <label class="form-label">Lặp lại</label>
          <select v-model="form.recurrence" class="form-select">
            <option value="none">Không lặp lại</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
            <option value="yearly">Hàng năm</option>
          </select>
        </div>

        <!-- Assigned To (Collaborative) -->
        <div class="form-group" v-if="currentProjectId" style="margin-top: 12px; text-align: left;">
          <label class="form-label">Người được giao việc (Thành viên nhóm)</label>
          <select v-model="form.assigned_to" class="form-select">
            <option :value="null">-- Chưa phân công --</option>
            <option v-for="m in store.projectMembers" :key="m.user_id" :value="m.user_id">
              {{ m.role === 'owner' ? '👑' : '👤' }} {{ m.name }} ({{ m.email }})
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting">⏳ Đang lưu...</span>
            <span v-else>{{ isEdit ? '💾 Cập nhật' : '✅ Tạo nhiệm vụ' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { taskApi, subjectApi, classScheduleApi } from '@/api/taskApi'

const props = defineProps({
  task: { type: Object, default: null },
  defaultStatus: { type: String, default: 'todo' },
  projectId: { type: [Number, String], default: null },
  milestoneId: { type: [Number, String], default: null },
  initialTitle: { type: String, default: '' },
  initialDescription: { type: String, default: '' },
  initialDueDate: { type: String, default: '' },
})
const emit = defineEmits(['close', 'saved'])

const store = useTaskStore()
const submitting = ref(false)
const selectedCategory = ref('Học tập')
const customCategory = ref('')
const categoriesList = ref([
  'Học tập',
  'Công việc',
  'Dự án',
  'Cá nhân',
  'Sức khỏe',
  'Khác'
])

const subjects = ref([])
const classSchedules = ref([])
const scheduleWarning = ref('')
const endTimeWarning = ref('')

const form = ref({
  title: '',
  description: '',
  status: props.defaultStatus || 'todo',
  priority: 'medium',
  category: 'Học tập',
  due_date: '',
  start_time: '',
  end_time: '',
  recurrence: 'none',
  subject_id: '',
  assigned_to: null
})

const checkOverlap = () => {
  if (!form.value.due_date) {
    scheduleWarning.value = ''
    return
  }
  
  const targetDate = new Date(form.value.due_date)
  const day = targetDate.getDay() // 0 (CN) -> 6 (T7)
  const taskTime = targetDate.toTimeString().slice(0, 5) // "HH:MM"

  const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

  for (const s of classSchedules.value) {
    if (s.day_of_week === day) {
      const classStart = s.start_time.slice(0, 5)
      const classEnd = s.end_time.slice(0, 5)
      
      if (taskTime >= classStart && taskTime <= classEnd) {
        scheduleWarning.value = `⚠️ Trùng lịch học môn "${s.subject_name}" trên lớp (${classStart} - ${classEnd}) vào ${weekdays[day]}!`
        return
      }
    }
  }
  scheduleWarning.value = ''
}

watch(() => form.value.end_time, (val) => {
  if (val && form.value.start_time && new Date(val) < new Date(form.value.start_time)) {
    endTimeWarning.value = '⚠️ Thời gian hoàn thành phải sau thời gian bắt đầu!'
  } else {
    endTimeWarning.value = ''
  }
})
watch(() => form.value.due_date, checkOverlap)

const handleCategoryChange = () => {
  if (selectedCategory.value !== 'custom') {
    form.value.category = selectedCategory.value
  } else {
    form.value.category = customCategory.value
  }
}

const isEdit = computed(() => !!props.task)

const formatDateTimeLocal = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadSubjects = async () => {
  try {
    const res = await subjectApi.getAll()
    subjects.value = res.data.data || []
  } catch (err) {
    console.error('[TaskForm] subjects error:', err)
  }
}

onMounted(async () => {
  await loadSubjects()

  // Load schedules
  try {
    const res = await classScheduleApi.getAll()
    classSchedules.value = res.data.data
  } catch (err) {
    console.error(err)
  }

  const currentProjectId = computed(() => {
    return props.projectId || (props.task ? props.task.project_id : null)
  })

  if (currentProjectId.value) {
    await store.fetchProjectMembers(currentProjectId.value)
  }

  if (props.task) {
    form.value = {
      title: props.task.title,
      description: props.task.description || '',
      status: props.task.status,
      priority: props.task.priority,
      category: props.task.category || 'Học tập',
      due_date: formatDateTimeLocal(props.task.due_date),
      start_time: formatDateTimeLocal(props.task.start_time),
      end_time: formatDateTimeLocal(props.task.end_time),
      recurrence: props.task.recurrence || 'none',
      subject_id: props.task.subject_id || '',
      assigned_to: props.task.assigned_to || null
    }
    
    // Check overlap initially if editing
    checkOverlap()
    const taskCat = props.task.category || 'Học tập'
    if (categoriesList.value.includes(taskCat)) {
      selectedCategory.value = taskCat
    } else {
      selectedCategory.value = 'custom'
      customCategory.value = taskCat
    }
  } else {
    selectedCategory.value = 'Học tập'
    form.value.category = 'Học tập'
    if (props.initialTitle) form.value.title = props.initialTitle
    if (props.initialDescription) form.value.description = props.initialDescription
    if (props.initialDueDate) form.value.due_date = props.initialDueDate
  }
  // Load categories
  try {
    const res = await taskApi.getCategories()
    if (res.data.data.length > 0) {
      const dbCats = res.data.data.filter(c => c && !categoriesList.value.includes(c))
      categoriesList.value = [...categoriesList.value, ...dbCats]
    }
  } catch {}
})

const handleSubmit = async () => {
  if (!form.value.title.trim()) return
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      subject_id: form.value.subject_id || null,
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
      start_time: form.value.start_time ? new Date(form.value.start_time).toISOString() : null,
      end_time: form.value.end_time ? new Date(form.value.end_time).toISOString() : null,
      project_id: props.projectId || (props.task ? props.task.project_id : null),
      milestone_id: props.milestoneId || (props.task ? props.task.milestone_id : null),
    }
    if (isEdit.value) {
      await store.updateTask(props.task.id, payload)
    } else {
      await store.createTask(payload)
    }
    emit('saved')
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.task-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

.task-form-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
}
.form-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.form-body {
  padding: 20px 24px 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.required { color: #ef4444; }
.schedule-warning-text {
  color: #ef4444;
  font-size: 0.78rem;
  margin-top: 4px;
  font-weight: 500;
  line-height: 1.4;
}
.hint-text {
  font-size: 0.78rem;
  color: #f59e0b;
  margin-top: 6px;
  line-height: 1.4;
}
.hint-text-muted {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 6px;
  line-height: 1.4;
}

.btn-link-small {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #117c75;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-link-small:hover {
  background: #0e6b64;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .task-form-overlay { padding: 8px; }

  .task-form-box {
    max-width: 100%;
    width: 95%;
    max-height: 92vh;
    border-radius: 16px;
  }

  .form-header { padding: 20px 20px 0; }
  .form-header h3 { font-size: 1rem; }

  .form-body { padding: 16px 20px 20px; }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-group { margin-bottom: 4px; }
  .form-label { font-size: 0.78rem; }
  .form-input,
  .form-select,
  .form-textarea {
    min-height: 44px;
    font-size: 0.88rem;
    padding: 10px 14px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
    margin-top: 16px;
    padding-top: 14px;
  }

  .form-actions .btn {
    width: 100%;
    min-height: 44px;
    justify-content: center;
  }

  .btn-link-small { min-height: 44px; padding: 8px 14px; }
}

@media (max-width: 480px) {
  .task-form-box { width: 98%; border-radius: 14px; }
  .form-header { padding: 16px 16px 0; }
  .form-body { padding: 14px 16px 18px; }
  .form-header h3 { font-size: 0.95rem; }
}
</style>
