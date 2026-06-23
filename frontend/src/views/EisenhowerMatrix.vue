<template>
  <div class="eisenhower-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🎯 Ma Trận Eisenhower</h1>
        <p class="page-subtitle">Sắp xếp độ ưu tiên của công việc cá nhân khoa học để nâng cao năng suất làm việc.</p>
      </div>
      <div class="header-actions">
        <label class="toggle-completed-label">
          <input type="checkbox" v-model="showCompleted" />
          Hiển thị việc đã xong
        </label>
        <button class="btn btn-secondary" @click="fetchTasks">
          🔄 Làm mới
        </button>
      </div>
    </div>

    <!-- Matrix 2x2 Grid -->
    <div class="matrix-grid">
      <!-- Q1: Khẩn cấp & Quan trọng (Do First) -->
      <div class="quadrant-card glass-card q1-border">
        <div class="quadrant-header">
          <span class="quadrant-badge badge-q1">Q1</span>
          <div class="quadrant-title-group">
            <h3>Khẩn Cấp & Quan Trọng</h3>
            <p>Giải quyết ngay lập tức (Do First)</p>
          </div>
          <span class="task-count">{{ q1Tasks.length }} việc</span>
        </div>

        <div class="task-list-wrapper">
          <div class="tasks-scroll-area" v-if="q1Tasks.length > 0">
            <div v-for="t in q1Tasks" :key="t.id" class="matrix-task-item" :class="{ 'task-done': t.status === 'done' }">
              <label class="custom-checkbox">
                <input type="checkbox" :checked="t.status === 'done'" @change="toggleTaskDone(t)" />
                <span class="checkmark"></span>
              </label>
              <div class="task-content">
                <router-link :to="'/tasks/' + t.id" class="task-title">{{ t.title }}</router-link>
                <div class="task-meta">
                  <span class="cat-tag">{{ t.category || 'Chung' }}</span>
                  <span v-if="t.due_date" class="due-tag">📅 {{ formatDate(t.due_date) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <select :value="t.eisenhower_quadrant" @change="moveQuadrant(t, $event.target.value)" class="quadrant-select" title="Chuyển ô ưu tiên">
                  <option value="q1">Q1 (Do)</option>
                  <option value="q2">Q2 (Schedule)</option>
                  <option value="q3">Q3 (Delegate)</option>
                  <option value="q4">Q4 (Eliminate)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="quadrant-empty-state" v-else>
            <span class="empty-emoji">🚀</span>
            <p>Tuyệt vời! Không có việc gấp nào cần làm ngay.</p>
          </div>
        </div>

        <div class="quick-add-box">
          <input 
            type="text" 
            v-model="quickInput.q1" 
            @keyup.enter="createQuickTask('q1')"
            placeholder="+ Thêm nhanh việc vào Q1..." 
            class="form-control quick-add-input"
          />
        </div>
      </div>

      <!-- Q2: Không khẩn cấp nhưng Quan trọng (Schedule) -->
      <div class="quadrant-card glass-card q2-border">
        <div class="quadrant-header">
          <span class="quadrant-badge badge-q2">Q2</span>
          <div class="quadrant-title-group">
            <h3>Không Khẩn Cấp nhưng Quan Trọng</h3>
            <p>Lập lịch thực hiện (Schedule)</p>
          </div>
          <span class="task-count">{{ q2Tasks.length }} việc</span>
        </div>

        <div class="task-list-wrapper">
          <div class="tasks-scroll-area" v-if="q2Tasks.length > 0">
            <div v-for="t in q2Tasks" :key="t.id" class="matrix-task-item" :class="{ 'task-done': t.status === 'done' }">
              <label class="custom-checkbox">
                <input type="checkbox" :checked="t.status === 'done'" @change="toggleTaskDone(t)" />
                <span class="checkmark"></span>
              </label>
              <div class="task-content">
                <router-link :to="'/tasks/' + t.id" class="task-title">{{ t.title }}</router-link>
                <div class="task-meta">
                  <span class="cat-tag">{{ t.category || 'Chung' }}</span>
                  <span v-if="t.due_date" class="due-tag">📅 {{ formatDate(t.due_date) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <select :value="t.eisenhower_quadrant" @change="moveQuadrant(t, $event.target.value)" class="quadrant-select" title="Chuyển ô ưu tiên">
                  <option value="q1">Q1 (Do)</option>
                  <option value="q2">Q2 (Schedule)</option>
                  <option value="q3">Q3 (Delegate)</option>
                  <option value="q4">Q4 (Eliminate)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="quadrant-empty-state" v-else>
            <span class="empty-emoji">📅</span>
            <p>Không có việc dài hạn cần lập lịch.</p>
          </div>
        </div>

        <div class="quick-add-box">
          <input 
            type="text" 
            v-model="quickInput.q2" 
            @keyup.enter="createQuickTask('q2')"
            placeholder="+ Thêm nhanh việc vào Q2..." 
            class="form-control quick-add-input"
          />
        </div>
      </div>

      <!-- Q3: Khẩn cấp nhưng Không quan trọng (Delegate) -->
      <div class="quadrant-card glass-card q3-border">
        <div class="quadrant-header">
          <span class="quadrant-badge badge-q3">Q3</span>
          <div class="quadrant-title-group">
            <h3>Khẩn Cấp nhưng Không Quan Trọng</h3>
            <p>Làm nhanh hoặc nhờ hỗ trợ (Delegate)</p>
          </div>
          <span class="task-count">{{ q3Tasks.length }} việc</span>
        </div>

        <div class="task-list-wrapper">
          <div class="tasks-scroll-area" v-if="q3Tasks.length > 0">
            <div v-for="t in q3Tasks" :key="t.id" class="matrix-task-item" :class="{ 'task-done': t.status === 'done' }">
              <label class="custom-checkbox">
                <input type="checkbox" :checked="t.status === 'done'" @change="toggleTaskDone(t)" />
                <span class="checkmark"></span>
              </label>
              <div class="task-content">
                <router-link :to="'/tasks/' + t.id" class="task-title">{{ t.title }}</router-link>
                <div class="task-meta">
                  <span class="cat-tag">{{ t.category || 'Chung' }}</span>
                  <span v-if="t.due_date" class="due-tag">📅 {{ formatDate(t.due_date) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <select :value="t.eisenhower_quadrant" @change="moveQuadrant(t, $event.target.value)" class="quadrant-select" title="Chuyển ô ưu tiên">
                  <option value="q1">Q1 (Do)</option>
                  <option value="q2">Q2 (Schedule)</option>
                  <option value="q3">Q3 (Delegate)</option>
                  <option value="q4">Q4 (Eliminate)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="quadrant-empty-state" v-else>
            <span class="empty-emoji">⚡</span>
            <p>Không có việc lặt vặt khẩn cấp.</p>
          </div>
        </div>

        <div class="quick-add-box">
          <input 
            type="text" 
            v-model="quickInput.q3" 
            @keyup.enter="createQuickTask('q3')"
            placeholder="+ Thêm nhanh việc vào Q3..." 
            class="form-control quick-add-input"
          />
        </div>
      </div>

      <!-- Q4: Không khẩn cấp & Không quan trọng (Eliminate) -->
      <div class="quadrant-card glass-card q4-border">
        <div class="quadrant-header">
          <span class="quadrant-badge badge-q4">Q4</span>
          <div class="quadrant-title-group">
            <h3>Không Khẩn Cấp & Không Quan Trọng</h3>
            <p>Hạn chế tối đa hoặc bỏ qua (Eliminate)</p>
          </div>
          <span class="task-count">{{ q4Tasks.length }} việc</span>
        </div>

        <div class="task-list-wrapper">
          <div class="tasks-scroll-area" v-if="q4Tasks.length > 0">
            <div v-for="t in q4Tasks" :key="t.id" class="matrix-task-item" :class="{ 'task-done': t.status === 'done' }">
              <label class="custom-checkbox">
                <input type="checkbox" :checked="t.status === 'done'" @change="toggleTaskDone(t)" />
                <span class="checkmark"></span>
              </label>
              <div class="task-content">
                <router-link :to="'/tasks/' + t.id" class="task-title">{{ t.title }}</router-link>
                <div class="task-meta">
                  <span class="cat-tag">{{ t.category || 'Chung' }}</span>
                  <span v-if="t.due_date" class="due-tag">📅 {{ formatDate(t.due_date) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <select :value="t.eisenhower_quadrant" @change="moveQuadrant(t, $event.target.value)" class="quadrant-select" title="Chuyển ô ưu tiên">
                  <option value="q1">Q1 (Do)</option>
                  <option value="q2">Q2 (Schedule)</option>
                  <option value="q3">Q3 (Delegate)</option>
                  <option value="q4">Q4 (Eliminate)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="quadrant-empty-state" v-else>
            <span class="empty-emoji">🗑️</span>
            <p>Trực quan sạch sẽ! Không có công việc vô ích.</p>
          </div>
        </div>

        <div class="quick-add-box">
          <input 
            type="text" 
            v-model="quickInput.q4" 
            @keyup.enter="createQuickTask('q4')"
            placeholder="+ Thêm nhanh việc vào Q4..." 
            class="form-control quick-add-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { taskApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

// State
const tasks = ref([])
const showCompleted = ref(false)
const quickInput = ref({
  q1: '',
  q2: '',
  q3: '',
  q4: ''
})

// Lifecycle
onMounted(() => {
  fetchTasks()
})

const fetchTasks = async () => {
  try {
    const res = await taskApi.getAll()
    tasks.value = res.data.data
  } catch (err) {
    taskStore.showToast('Không thể tải danh sách công việc', 'error')
    console.error(err)
  }
}

// Filters by Quadrant
const filteredTasks = computed(() => {
  if (showCompleted.value) {
    return tasks.value
  }
  return tasks.value.filter(t => t.status !== 'done')
})

const q1Tasks = computed(() => {
  return filteredTasks.value.filter(t => t.eisenhower_quadrant === 'q1')
})

const q2Tasks = computed(() => {
  // If quadrant is not defined, default to q2 (Important, Not Urgent)
  return filteredTasks.value.filter(t => t.eisenhower_quadrant === 'q2' || !t.eisenhower_quadrant)
})

const q3Tasks = computed(() => {
  return filteredTasks.value.filter(t => t.eisenhower_quadrant === 'q3')
})

const q4Tasks = computed(() => {
  return filteredTasks.value.filter(t => t.eisenhower_quadrant === 'q4')
})

// Actions
const toggleTaskDone = async (task) => {
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  try {
    await taskApi.update(task.id, { status: newStatus })
    taskStore.showToast(newStatus === 'done' ? 'Chúc mừng! Đã hoàn thành công việc 🎉' : 'Đã mở lại công việc', 'success')
    fetchTasks()
    
    // Trigger audio cue or update counts if exist in store
    if (taskStore.fetchTasks) {
      taskStore.fetchTasks()
    }
  } catch (err) {
    taskStore.showToast('Lỗi khi cập nhật trạng thái', 'error')
    console.error(err)
  }
}

const moveQuadrant = async (task, targetQuadrant) => {
  try {
    await taskApi.update(task.id, { eisenhower_quadrant: targetQuadrant })
    taskStore.showToast('Đã cập nhật phân bổ ưu tiên!', 'success')
    fetchTasks()
  } catch (err) {
    taskStore.showToast('Không thể chuyển ô ưu tiên', 'error')
    console.error(err)
  }
}

const createQuickTask = async (quadrant) => {
  const titleText = quickInput.value[quadrant]
  if (!titleText || !titleText.trim()) return

  try {
    const data = {
      title: titleText.trim(),
      status: 'todo',
      priority: quadrant === 'q1' || quadrant === 'q2' ? 'high' : 'medium', // Align priority to matrix quadrant
      category: 'Chung',
      eisenhower_quadrant: quadrant
    }

    await taskApi.create(data)
    taskStore.showToast('Đã thêm công việc mới vào ma trận!', 'success')
    quickInput.value[quadrant] = '' // clear input
    fetchTasks()
    
    if (taskStore.fetchTasks) {
      taskStore.fetchTasks()
    }
  } catch (err) {
    taskStore.showToast('Lỗi khi thêm công việc', 'error')
    console.error(err)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.eisenhower-page {
  font-family: 'Inter', sans-serif;
  color: #e2e8f0;
  padding-bottom: 40px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fcd34d, #117c75);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}
.page-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: 4px;
  font-weight: 300;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.toggle-completed-label {
  font-size: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

/* Matrix 2x2 Grid Layout */
.matrix-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
}

.quadrant-card {
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 24px;
  position: relative;
  background: rgba(13, 18, 32, 0.65);
  border-width: 1px;
  border-style: solid;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.quadrant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.5);
}

/* Borders and Highlights */
.q1-border { border-color: rgba(239, 68, 68, 0.25); border-left: 6px solid #ef4444 !important; }
.q2-border { border-color: rgba(245, 158, 11, 0.25); border-left: 6px solid #f59e0b !important; }
.q3-border { border-color: rgba(59, 130, 246, 0.25); border-left: 6px solid #3b82f6 !important; }
.q4-border { border-color: rgba(100, 116, 139, 0.25); border-left: 6px solid #64748b !important; }

/* Quadrant Headers */
.quadrant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 14px;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.quadrant-badge {
  font-size: 0.72rem;
  font-weight: 800;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.badge-q1 { background: #ef4444; color: #ffffff; }
.badge-q2 { background: #f59e0b; color: #050508; }
.badge-q3 { background: #3b82f6; color: #ffffff; }
.badge-q4 { background: #64748b; color: #ffffff; }

.quadrant-title-group {
  flex: 1;
  text-align: left;
}
.quadrant-title-group h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.quadrant-title-group p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 2px 0 0 0;
}
.task-count {
  font-size: 0.78rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.04);
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Task List Area */
.task-list-wrapper {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.tasks-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Task Item */
.matrix-task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  transition: background-color 0.2s, border-color 0.2s;
}
.matrix-task-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}
.task-content {
  flex: 1;
  min-width: 0;
  text-align: left;
}
.task-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f8fafc;
  text-decoration: none;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}
.task-title:hover {
  color: #117c75;
}
.task-done .task-title {
  text-decoration: line-through;
  color: #64748b;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.cat-tag {
  font-size: 0.65rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1px 6px;
  border-radius: 6px;
}
.due-tag {
  font-size: 0.65rem;
  color: #f59e0b;
}

.task-actions {
  flex-shrink: 0;
}
.quadrant-select {
  padding: 4px 6px;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  border-radius: 6px;
  outline: none;
}
.quadrant-select option {
  background-color: #0d1220;
  color: #f8fafc;
}

/* Custom Checkbox */
.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}
.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0; width: 0;
}
.checkmark {
  position: absolute;
  top: 0; left: 0;
  height: 18px; width: 18px;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  transition: all 0.2s;
}
.custom-checkbox input:checked ~ .checkmark {
  background-color: #10b981;
  border-color: #10b981;
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}
.custom-checkbox .checkmark:after {
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid #050508;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Empty states */
.quadrant-empty-state {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.8rem;
  padding: 20px;
}
.empty-emoji {
  font-size: 1.8rem;
  margin-bottom: 6px;
  opacity: 0.7;
}

/* Quick Add Box */
.quick-add-box {
  margin-top: 14px;
  flex-shrink: 0;
}
.quick-add-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.82rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: #f8fafc;
}
.quick-add-input::placeholder {
  color: #4b5563;
}

/* Glass Card styling override */
.glass-card {
  backdrop-filter: blur(20px);
}

/* Scrollbar Customization */
.tasks-scroll-area::-webkit-scrollbar {
  width: 4px;
}
.tasks-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
.tasks-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

/* RESPONSIVE DESIGN */
@media (max-width: 900px) {
  .matrix-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .quadrant-card {
    height: 350px;
  }
}
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .header-actions { width: 100%; flex-wrap: wrap; }
  .matrix-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .quadrant-card {
    height: auto;
    min-height: 280px;
    padding: 16px;
    border-radius: 14px;
  }
  .quadrant-header { gap: 8px; padding-bottom: 10px; margin-bottom: 12px; }
  .quadrant-badge { width: 24px; height: 24px; font-size: 0.65rem; }
  .quadrant-title-group h3 { font-size: 0.88rem; }
  .quadrant-title-group p { font-size: 0.7rem; }
  .task-count { font-size: 0.7rem; padding: 2px 6px; }
  .matrix-task-item { padding: 10px; gap: 8px; }
  .task-title { font-size: 0.82rem; }
  .task-meta { gap: 6px; }
  .cat-tag, .due-tag { font-size: 0.6rem; }
  .quadrant-select { font-size: 0.68rem; padding: 3px 5px; }
  .quick-add-input { font-size: 0.78rem; padding: 7px 10px; }
}
</style>
