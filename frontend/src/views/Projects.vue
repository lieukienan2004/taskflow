<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">Dự án cá nhân</h1>
          <p class="page-subtitle">Quản lý các nhóm công việc lớn</p>
        </div>
      </div>
      <button class="btn-create" @click="showCreateModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Dự án mới
      </button>
    </div>

    <div v-if="!store.loadingProjects && store.projects.length > 0" class="stats-bar">
      <div class="stat-pill">
        <span class="stat-pill-value">{{ totalProjects }}</span>
        <span class="stat-pill-label">Dự án</span>
      </div>
      <div class="stat-pill">
        <span class="stat-pill-value">{{ totalTasks }}</span>
        <span class="stat-pill-label">Công việc</span>
      </div>
      <div class="stat-pill">
        <span class="stat-pill-value">{{ completedTasks }}</span>
        <span class="stat-pill-label">Đã xong</span>
      </div>
      <div class="stat-pill accent">
        <span class="stat-pill-value">{{ avgProgress }}%</span>
        <span class="stat-pill-label">Tiến độ TB</span>
      </div>
    </div>

    <div class="projects-grid" v-if="store.loadingProjects">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <div class="skeleton" style="height: 48px; width: 48px; border-radius: 14px; margin-bottom: 16px"></div>
        <div class="skeleton" style="height: 20px; width: 55%; margin-bottom: 10px"></div>
        <div class="skeleton" style="height: 14px; width: 85%; margin-bottom: 8px"></div>
        <div class="skeleton" style="height: 14px; width: 65%"></div>
      </div>
    </div>

    <div class="projects-grid" v-else-if="store.projects.length > 0">
      <div
        v-for="project in store.projects"
        :key="project.id"
        class="project-card"
        :style="{ '--card-color': project.color || '#117c75' }"
        @click="goToProject(project.id)"
      >
        <div class="project-card-top">
          <div class="project-icon" :style="{ backgroundColor: project.color || '#117c75' }">
            {{ project.name.charAt(0).toUpperCase() }}
          </div>
          <div class="card-actions">
            <button class="edit-btn" @click.stop="openEditModal(project)" title="Sửa dự án">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="delete-btn" @click.stop="deleteProject(project.id)" title="Xóa dự án">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="project-body">
          <h3 class="project-title">{{ project.name }}</h3>
          <div v-if="project.subject_name" class="project-subject-badge">
            {{ project.subject_name }}
          </div>
          <p class="project-desc">{{ project.description || 'Chưa có mô tả cho dự án này' }}</p>
        </div>

        <div class="project-footer">
          <div class="footer-stats">
            <div class="footer-stat">
              <span class="footer-stat-value">{{ project.task_done || 0 }}/{{ project.task_count || 0 }}</span>
              <span class="footer-stat-label">Công việc</span>
            </div>
            <div class="footer-stat">
              <span class="footer-stat-value">{{ calculateProgress(project) }}%</span>
              <span class="footer-stat-label">Tiến độ</span>
            </div>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: calculateProgress(project) + '%', backgroundColor: project.color || '#117c75' }"
            ></div>
          </div>
          <div class="card-open-hint">
            <span>Xem chi tiết</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h2>Chưa có dự án nào</h2>
      <p>Tạo dự án để nhóm các công việc liên quan lại với nhau.</p>
      <button class="btn-create" @click="showCreateModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tạo dự án đầu tiên
      </button>
    </div>

    <!-- Modal Tạo Dự án -->
    <div class="modal-overlay form-modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <div class="modal-header-text">
            <h2>Tạo dự án mới</h2>
            <p class="modal-subtitle">Nhóm các công việc liên quan vào một dự án</p>
          </div>
          <button type="button" class="close-btn" @click="showCreateModal = false" aria-label="Đóng">×</button>
        </div>

        <form @submit.prevent="handleCreateProject" class="project-form">
          <div class="form-group">
            <label>Tên dự án <span class="required">*</span></label>
            <input v-model="newProject.name" type="text" required placeholder="VD: Làm khóa luận tốt nghiệp" class="form-input" />
          </div>

          <div class="form-group">
            <label>Mô tả chi tiết</label>
            <textarea v-model="newProject.description" placeholder="Mô tả mục tiêu của dự án này..." rows="3" class="form-input"></textarea>
          </div>

          <div class="form-group">
            <label>Màu sắc nhận diện</label>
            <div class="color-picker">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-swatch"
                :class="{ active: newProject.color === color }"
                :style="{ backgroundColor: color, '--swatch-color': color }"
                @click="newProject.color = color"
              ></div>
            </div>
          </div>

          <div class="form-group">
            <label>Môn học liên kết</label>
            <select v-model="newProject.subject_id" class="form-input">
              <option :value="null">— Không liên kết —</option>
              <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
            <p v-if="subjects.length === 0" class="form-hint">Chưa có môn học. Vào "Mục tiêu & Kế hoạch" để thêm môn học.</p>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="!newProject.name.trim()">Tạo dự án</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Sửa Dự án -->
    <div class="modal-overlay form-modal-overlay" v-if="showEditModal && editingProject" @click.self="showEditModal = false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <div class="modal-header-text">
            <h2>Sửa dự án</h2>
            <p class="modal-subtitle">Cập nhật thông tin dự án của bạn</p>
          </div>
          <button type="button" class="close-btn" @click="showEditModal = false" aria-label="Đóng">×</button>
        </div>

        <form @submit.prevent="handleEditProject" class="project-form">
          <div class="form-group">
            <label>Tên dự án <span class="required">*</span></label>
            <input v-model="editingProject.name" type="text" required placeholder="VD: Làm khóa luận tốt nghiệp" class="form-input" />
          </div>

          <div class="form-group">
            <label>Mô tả chi tiết</label>
            <textarea v-model="editingProject.description" placeholder="Mô tả mục tiêu của dự án này..." rows="3" class="form-input"></textarea>
          </div>

          <div class="form-group">
            <label>Màu sắc nhận diện</label>
            <div class="color-picker">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-swatch"
                :class="{ active: editingProject.color === color }"
                :style="{ backgroundColor: color, '--swatch-color': color }"
                @click="editingProject.color = color"
              ></div>
            </div>
          </div>

          <div class="form-group">
            <label>Môn học liên kết</label>
            <select v-model="editingProject.subject_id" class="form-input">
              <option :value="null">— Không liên kết —</option>
              <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="!editingProject.name.trim()">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { subjectApi } from '@/api/taskApi'

const router = useRouter()
const store = useTaskStore()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const presetColors = ['#117c75', '#34d399', '#60a5fa', '#f472b6', '#2dd4bf', '#fb923c']
const subjects = ref([])
const editingProject = ref(null)
const newProject = ref({ name: '', description: '', color: '#117c75', subject_id: null })

onMounted(async () => {
  await store.fetchProjects()
  try {
    const res = await subjectApi.getAll()
    if (res.data.success) subjects.value = res.data.data
  } catch (e) {
    console.error('Không thể tải danh sách môn học:', e)
  }
})

const calculateProgress = (project) => {
  if (!project.task_count || project.task_count === 0) return 0
  return Math.round((project.task_done / project.task_count) * 100)
}

const totalProjects = computed(() => store.projects.length)
const totalTasks = computed(() => store.projects.reduce((sum, p) => sum + (p.task_count || 0), 0))
const completedTasks = computed(() => store.projects.reduce((sum, p) => sum + (p.task_done || 0), 0))
const avgProgress = computed(() => {
  if (store.projects.length === 0) return 0
  const total = store.projects.reduce((sum, p) => sum + calculateProgress(p), 0)
  return Math.round(total / store.projects.length)
})

const goToProject = (id) => router.push({ name: 'ProjectDetail', params: { id } })

const deleteProject = async (id) => {
  if (confirm('Bạn có chắc muốn xóa dự án này không? Các công việc sẽ KHÔNG bị xóa nhưng mất liên kết với dự án.')) {
    await store.deleteProject(id)
  }
}

const handleCreateProject = async () => {
  if (!newProject.value.name.trim()) return
  try {
    await store.createProject(newProject.value)
    showCreateModal.value = false
    newProject.value = { name: '', description: '', color: '#117c75', subject_id: null }
  } catch (e) {
    console.error(e)
  }
}

const openEditModal = (project) => {
  editingProject.value = { ...project }
  showEditModal.value = true
}

const handleEditProject = async () => {
  if (!editingProject.value) return
  try {
    const { projectApi } = await import('@/api/taskApi')
    await projectApi.update(editingProject.value.id, {
      name: editingProject.value.name,
      description: editingProject.value.description,
      color: editingProject.value.color,
      subject_id: editingProject.value.subject_id
    })
    await store.fetchProjects()
    showEditModal.value = false
    editingProject.value = null
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.projects-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.3rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(17,124,117, 0.12), rgba(17,124,117, 0.08));
  border: 1px solid rgba(17,124,117, 0.12);
  border-radius: 14px;
  color: #117c75;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0;
  font-weight: 500;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.72rem 1.25rem;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-family: inherit;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(17,124,117, 0.28);
}

.btn-create svg {
  width: 16px;
  height: 16px;
}

.btn-create:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(17,124,117, 0.35);
}

.stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0.25rem 0.15rem;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.55rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.stat-pill.accent {
  background: linear-gradient(135deg, rgba(17,124,117, 0.08), rgba(17,124,117, 0.06));
  border-color: rgba(17,124,117, 0.15);
}

.stat-pill-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-pill.accent .stat-pill-value {
  color: #117c75;
}

.stat-pill-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.skeleton-card {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 22px;
  padding: 1.35rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.skeleton {
  background: linear-gradient(90deg, #f1f5f9 20%, #e2e8f0 50%, #f1f5f9 80%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  padding: 0;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color, #117c75), color-mix(in srgb, var(--card-color, #117c75) 60%, white));
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  border-color: rgba(17,124,117, 0.2);
}

.project-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.35rem 1.35rem 0;
}

.project-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--card-color, #117c75) 35%, transparent);
}

.card-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s, transform 0.2s;
}

.project-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}

.edit-btn,
.delete-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #e6f7f5;
  border-color: #a5b4fc;
  color: #0e6b64;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.project-body {
  flex: 1;
  padding: 1rem 1.35rem 0.5rem;
}

.project-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-subject-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #117c75;
  background: rgba(17,124,117, 0.08);
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 0.65rem;
  border: 1px solid rgba(17,124,117, 0.12);
}

.project-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.75rem;
}

.project-footer {
  padding: 1rem 1.35rem 1.25rem;
  margin-top: auto;
  border-top: 1px solid #f1f5f9;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.footer-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.footer-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-stat-value {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.footer-stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.progress-track {
  height: 7px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.85rem;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-open-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 700;
  color: #94a3b8;
  transition: color 0.2s;
}

.project-card:hover .card-open-hint {
  color: #117c75;
}

.empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  background: #fff;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: 22px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(17,124,117, 0.1), rgba(17,124,117, 0.06));
  border-radius: 20px;
  border: 1px solid rgba(17,124,117, 0.1);
}

.empty-icon {
  width: 36px;
  height: 36px;
  color: #117c75;
}

.empty-state h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .projects-page {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    gap: 0.75rem;
  }

  .header-left {
    width: 100%;
  }

  .btn-create {
    justify-content: center;
    width: 100%;
    padding: 0.65rem 1rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .page-title {
    font-size: 1.35rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .card-actions {
    opacity: 1;
    transform: none;
  }

  .stats-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0;
  }

  .stat-pill {
    padding: 0.45rem 0.75rem;
    border-radius: 12px;
    justify-content: center;
    gap: 6px;
  }

  .stat-pill-value {
    font-size: 0.85rem;
  }

  .stat-pill-label {
    font-size: 0.78rem;
  }

  .project-card {
    min-height: 0;
    border-radius: 16px;
  }

  .project-card-top {
    padding: 1rem 1rem 0;
  }

  .project-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    font-size: 1.1rem;
  }

  .project-body {
    padding: 0.75rem 1rem 0.25rem;
  }

  .project-title {
    font-size: 1rem;
  }

  .project-footer {
    padding: 0.75rem 1rem 1rem;
  }

  .footer-stat-value {
    font-size: 0.9rem;
  }

  .footer-stat-label {
    font-size: 0.78rem;
  }

  .progress-track {
    height: 5px;
    margin-bottom: 0.6rem;
  }

  .empty-state {
    padding: 2rem 1rem;
    border-radius: 16px;
  }

  .empty-state h2 {
    font-size: 1.1rem;
  }

  .empty-state p {
    font-size: 0.85rem;
  }

  .modal-content.form-modal {
    width: 95%;
    max-width: none;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-header h2 {
    font-size: 1.15rem;
  }

  .project-form {
    padding: 1.25rem;
  }

  .form-input {
    font-size: 0.9rem;
    padding: 0.7rem 0.9rem;
  }

  .color-picker {
    gap: 8px;
  }

  .color-swatch {
    width: 36px;
    height: 36px;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
