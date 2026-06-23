<template>
  <div class="okr-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-badge">OKRs</span>
        <h1 class="page-title">Mục tiêu & Kế hoạch</h1>
        <p class="page-subtitle">Đặt mục tiêu, đo lường tiến độ bằng các chỉ số và liên kết với nhiệm vụ</p>
      </div>
      <button class="btn btn-primary" @click="showCreatePlan = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Kế hoạch mới
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Đang tải...</span>
    </div>

    <template v-else-if="plans.length === 0">
      <div class="empty-state-wrap">
        <div class="empty-illustration">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6 6"/>
            <circle cx="50" cy="50" r="30" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="18" fill="#e6f7f5" stroke="#99f6e4" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="6" fill="#117c75"/>
            <path d="M50 26v10M50 64v10M26 50h10M64 50h10" stroke="#99f6e4" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="empty-title">Chưa có kế hoạch nào</h2>
        <p class="empty-desc">Tạo kế hoạch đầu tiên để đặt mục tiêu,<br>theo dõi chỉ số và liên kết với nhiệm vụ!</p>
        <button class="btn btn-primary btn-empty" @click="showCreatePlan = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tạo kế hoạch đầu tiên
        </button>
      </div>
    </template>

    <!-- Plans List -->
    <div v-else class="plans-list">
      <div v-for="plan in plans" :key="plan.id" class="plan-card">
        <div class="plan-header">
          <div class="plan-info">
            <h2 class="plan-name">{{ plan.name }}</h2>
            <div class="plan-meta">
              <span class="plan-date" v-if="plan.start_date">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatDate(plan.start_date) }} {{ plan.end_date ? '→ ' + formatDate(plan.end_date) : '' }}
              </span>
              <span class="plan-badge" :class="'badge-' + plan.status">
                <span class="badge-dot"></span>
                {{ plan.status === 'active' ? 'Đang thực hiện' : plan.status === 'completed' ? 'Hoàn thành' : 'Nháp' }}
              </span>
            </div>
          </div>
          <div class="plan-actions">
            <button class="icon-btn" @click="viewPlan(plan)" title="Xem chi tiết">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="icon-btn icon-btn-danger" @click="deletePlan(plan.id)" title="Xóa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Plan Stats Summary -->
        <div class="plan-stats" v-if="plan.objectives && plan.objectives.length">
          <div class="plan-stat">
            <span class="plan-stat-val">{{ plan.objectives.length }}</span>
            <span class="plan-stat-lbl">Mục tiêu</span>
          </div>
          <div class="plan-stat">
            <span class="plan-stat-val text-green">{{ (plan.objectives || []).filter(o => o.status === 'achieved').length }}</span>
            <span class="plan-stat-lbl">Đạt được</span>
          </div>
          <div class="plan-stat">
            <span class="plan-stat-val">{{ plan.objectives.reduce((sum, o) => sum + (o.key_results || []).length, 0) }}</span>
            <span class="plan-stat-lbl">Chỉ số KRs</span>
          </div>
        </div>

        <!-- Objectives Grid -->
        <div class="okr-grid">
          <div v-for="obj in plan.objectives || []" :key="obj.id" class="objective-card" :class="'priority-' + (obj.priority || 'medium')">
            <div class="obj-header">
              <h4>{{ obj.title }}</h4>
              <span class="obj-status-badge" :class="'obj-' + obj.status">
                {{ obj.status === 'achieved' ? 'Đạt' : obj.status === 'in_progress' ? 'Đang làm' : 'Chờ' }}
              </span>
            </div>
            <div v-if="obj.subject_id" class="subject-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              {{ subjectName(obj.subject_id) }}
            </div>

            <div v-for="kr in obj.key_results || []" :key="kr.id" class="kr-item">
              <div class="kr-header">
                <span class="kr-title">{{ kr.title }}</span>
                <span class="kr-value">{{ kr.current_value }}/{{ kr.target_value }} {{ kr.unit }}</span>
              </div>
              <div class="kr-track">
                <div class="kr-fill" :style="{ width: Math.min(100, (kr.current_value / kr.target_value) * 100) + '%' }"></div>
              </div>
              <span class="kr-percent">{{ Math.min(100, Math.round((kr.current_value / kr.target_value) * 100)) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Plan Modal -->
    <div v-if="showCreatePlan" class="modal-overlay" @click.self="showCreatePlan = false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h2>Tạo kế hoạch mới</h2>
          <button class="close-btn" @click="showCreatePlan = false">✕</button>
        </div>
        <form @submit.prevent="handleCreatePlan">
          <div class="form-group">
            <label>Tên kế hoạch <span class="required">*</span></label>
            <input v-model="newPlan.name" type="text" required placeholder="VD: Kế hoạch tháng 7" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Ngày bắt đầu</label>
              <input v-model="newPlan.start_date" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label>Ngày kết thúc</label>
              <input v-model="newPlan.end_date" type="date" class="form-input" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreatePlan = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Tạo kế hoạch</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Plan Detail Modal -->
    <div v-if="selectedPlan" class="modal-overlay" @click.self="selectedPlan = null">
      <div class="modal-content detail-modal">
        <div class="detail-header">
          <div>
            <h2>{{ selectedPlan.name }}</h2>
            <div class="plan-meta" v-if="selectedPlan.academic_year || selectedPlan.semester">
              {{ selectedPlan.academic_year }} {{ selectedPlan.semester }}
            </div>
          </div>
          <button class="close-btn" @click="selectedPlan = null">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Add Objective -->
          <button class="btn btn-outline" @click="showAddObjective = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm mục tiêu
          </button>

          <div v-for="obj in selectedPlan.objectives || []" :key="obj.id" class="objective-detail">
            <div class="obj-detail-header">
              <div>
                <h3>{{ obj.title }}</h3>
                <div v-if="obj.description" class="obj-desc">{{ obj.description }}</div>
              </div>
              <div class="obj-detail-actions">
                <button class="icon-btn" @click="addKeyResult(obj)" title="Thêm chỉ số">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button class="icon-btn" @click="editObjective(obj)" title="Sửa">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn-danger" @click="deleteObj(obj.id)" title="Xóa">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>

            <div v-if="obj.subject_id" class="gpa-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              {{ subjectName(obj.subject_id) }}
            </div>

            <!-- Key Results -->
            <div v-for="kr in obj.key_results || []" :key="kr.id" class="kr-detail">
              <div class="kr-detail-header">
                <span class="kr-title">{{ kr.title }}</span>
                <div class="kr-detail-actions">
                  <button class="icon-btn icon-btn-sm" @click="editKR(kr)" title="Sửa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="icon-btn icon-btn-sm icon-btn-danger" @click="deleteKR(obj.id, kr.id)" title="Xóa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
              <div class="kr-stats">
                <span>{{ kr.current_value }} / {{ kr.target_value }} {{ kr.unit }}</span>
                <span class="kr-status-text" :class="kr.status === 'achieved' ? 'text-green' : kr.status === 'in_progress' ? 'text-amber' : ''">{{ kr.status === 'achieved' ? 'Đạt' : kr.status === 'in_progress' ? 'Đang làm' : 'Chưa bắt đầu' }}</span>
              </div>
              <div class="kr-track">
                <div class="kr-fill" :style="{ width: Math.min(100, (kr.current_value / kr.target_value) * 100) + '%' }"></div>
              </div>
              <div class="kr-update">
                <input v-model.number="krUpdateValues[kr.id]" type="number" :placeholder="'Cập nhật ' + kr.unit" class="kr-input" />
                <button class="btn btn-sm" @click="updateKRValue(kr)">Cập nhật</button>
              </div>
            </div>

            <!-- Tasks -->
            <div v-if="obj.tasks && obj.tasks.length > 0" class="obj-tasks">
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Nhiệm vụ liên quan ({{ obj.tasks.length }})
              </h4>
              <div v-for="t in obj.tasks" :key="t.id" class="task-chip">
                <span class="task-dot" :class="t.status"></span>
                <router-link :to="'/tasks/' + t.id" class="task-link">{{ t.title }}</router-link>
                <button class="icon-btn icon-btn-sm" @click="unlinkTask(obj.id, t.id)" title="Hủy liên kết">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <!-- Link Task -->
            <div class="link-task-row">
              <select v-model="linkTaskIds[obj.id]" class="form-input task-select">
                <option value="">-- Chọn task để liên kết --</option>
                <option v-for="t in availableTasks" :key="t.id" :value="t.id">{{ t.title }}</option>
              </select>
              <button class="btn btn-sm" @click="linkTask(obj.id)" :disabled="!linkTaskIds[obj.id]">Liên kết</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Objective Modal -->
    <div v-if="showAddObjective" class="modal-overlay" @click.self="showAddObjective = false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h2>Thêm mục tiêu</h2>
          <button class="close-btn" @click="showAddObjective = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="handleAddObjective">
          <div class="form-group">
            <label>Mục tiêu <span class="required">*</span></label>
            <input v-model="newObjective.title" required placeholder="VD: Hoàn thành đồ án tốt nghiệp" class="form-input" />
          </div>
          <div class="form-group">
            <label>Mô tả</label>
            <textarea v-model="newObjective.description" placeholder="Mô tả chi tiết..." rows="2" class="form-input"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Môn học</label>
              <div style="display:flex;gap:6px;align-items:center;">
                <select v-model="newObjective.subject_id" class="form-input" style="flex:1;">
                  <option :value="null">-- Không chọn --</option>
                  <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
                <button type="button" class="icon-btn" @click="showSubjectManager = true" title="Quản lý môn học">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Ưu tiên</label>
              <select v-model="newObjective.priority" class="form-input">
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showAddObjective = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Thêm</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add KR Modal -->
    <div v-if="showAddKR" class="modal-overlay" @click.self="showAddKR = false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h2>Thêm chỉ số đo lường</h2>
          <button class="close-btn" @click="showAddKR = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="handleAddKR">
          <div class="form-group">
            <label>Chỉ số <span class="required">*</span></label>
            <input v-model="newKR.title" required placeholder="VD: Hoàn thành 80% công việc" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Giá trị mục tiêu</label>
              <input v-model="newKR.target_value" type="number" placeholder="100" class="form-input" />
            </div>
            <div class="form-group">
              <label>Đơn vị</label>
              <select v-model="newKR.unit" class="form-input">
                <option value="%">%</option>
                <option value="điểm">điểm</option>
                <option value="bài">bài</option>
                <option value="giờ">giờ</option>
                <option value="lần">lần</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showAddKR = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Thêm</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subject Manager Modal -->
    <div v-if="showSubjectManager" class="modal-overlay" @click.self="showSubjectManager = false">
      <div class="modal-content form-modal" style="max-width:420px;">
        <div class="modal-header">
          <h2>Quản lý môn học</h2>
          <button class="close-btn" @click="showSubjectManager = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="subject-mgr-body">
          <div class="subject-mgr-input-row">
            <input v-model="newSubjectName" @keyup.enter="handleAddSubject" placeholder="Tên môn học mới..." class="form-input" />
            <button class="btn btn-primary btn-sm" @click="handleAddSubject" :disabled="!newSubjectName.trim()">+ Thêm</button>
          </div>
          <div class="subject-mgr-list" v-if="subjects.length > 0">
            <div v-for="s in subjects" :key="s.id" class="subject-mgr-item">
              <span>{{ s.name }}</span>
              <button class="icon-btn icon-btn-sm icon-btn-danger" @click="handleDeleteSubject(s.id)" title="Xóa">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </div>
          <p v-else class="subject-mgr-empty">Chưa có môn học nào. Thêm môn học mới ở trên.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { semesterPlanApi, subjectApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const formatDate = (d) => d ? d.slice(0, 10) : ''
const taskStore = useTaskStore()
const plans = ref([])
const loading = ref(true)
const subjects = ref([])
const showCreatePlan = ref(false)
const selectedPlan = ref(null)
const showAddObjective = ref(false)
const showAddKR = ref(false)
const krUpdateValues = reactive({})
const linkTaskIds = reactive({})
const addingKRForObj = ref(null)

const availableTasks = computed(() => {
  const linkedIds = new Set()
  if (selectedPlan.value) {
    for (const obj of selectedPlan.value.objectives || []) {
      for (const t of obj.tasks || []) linkedIds.add(t.id)
    }
  }
  return taskStore.tasks.filter(t => t.status !== 'done' && !linkedIds.has(t.id))
})

const newPlan = ref({ name: '', academic_year: '', semester: '', start_date: '', end_date: '' })
const newObjective = ref({ title: '', description: '', target_gpa: '', priority: 'medium', subject_id: null })
const newKR = ref({ title: '', target_value: 100, unit: '%' })
const showSubjectManager = ref(false)
const newSubjectName = ref('')

const fetchPlans = async () => {
  try {
    const [planRes, gradeRes] = await Promise.all([
      semesterPlanApi.getAll(),
      subjectApi.getAll().catch(() => ({ data: { data: [] } }))
    ])
    plans.value = planRes.data.data
    subjects.value = gradeRes.data.data || []
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể tải kế hoạch', 'error')
  } finally {
    loading.value = false
  }
}

const handleCreatePlan = async () => {
  try {
    await semesterPlanApi.create(newPlan.value)
    showCreatePlan.value = false
    newPlan.value = { name: '', academic_year: '', semester: '', start_date: '', end_date: '' }
    await fetchPlans()
    taskStore.showToast('✅ Đã tạo kế hoạch')
  } catch (err) {
    taskStore.showToast('❌ Lỗi: ' + (err.response?.data?.message || err.message || 'Không thể tạo'), 'error')
  }
}

const deletePlan = async (id) => {
  if (!confirm('Xóa kế hoạch này?')) return
  try {
    await semesterPlanApi.delete(id)
    await fetchPlans()
    taskStore.showToast('🗑️ Đã xóa')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const viewPlan = async (plan) => {
  try {
    if (taskStore.tasks.length === 0) await taskStore.fetchTasks()
    const res = await semesterPlanApi.getById(plan.id)
    selectedPlan.value = res.data.data
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const handleAddObjective = async () => {
  try {
    await semesterPlanApi.createObjective(selectedPlan.value.id, newObjective.value)
    showAddObjective.value = false
    newObjective.value = { title: '', description: '', target_gpa: '', priority: 'medium', subject_id: null }
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
    taskStore.showToast('✅ Đã thêm mục tiêu')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const deleteObj = async (id) => {
  if (!confirm('Xóa mục tiêu này?')) return
  try {
    await semesterPlanApi.deleteObjective(selectedPlan.value.id, id)
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const addKeyResult = (obj) => {
  addingKRForObj.value = obj
  showAddKR.value = true
}

const handleAddKR = async () => {
  try {
    await semesterPlanApi.createKeyResult(selectedPlan.value.id, addingKRForObj.value.id, newKR.value)
    showAddKR.value = false
    newKR.value = { title: '', target_value: 100, unit: '%' }
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
    taskStore.showToast('✅ Đã thêm key result')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const deleteKR = async (objId, krId) => {
  if (!confirm('Xóa key result?')) return
  try {
    await semesterPlanApi.deleteKeyResult(selectedPlan.value.id, objId, krId)
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const updateKRValue = async (kr) => {
  const val = krUpdateValues[kr.id]
  if (val === undefined || val === null) return
  try {
    await semesterPlanApi.updateKeyResult(selectedPlan.value.id, kr.objective_id, kr.id, { current_value: val })
    delete krUpdateValues[kr.id]
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
    taskStore.showToast('✅ Đã cập nhật')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const linkTask = async (objId) => {
  const taskId = linkTaskIds[objId]
  if (!taskId) return
  try {
    await semesterPlanApi.linkTask(selectedPlan.value.id, objId, taskId)
    delete linkTaskIds[objId]
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
    taskStore.showToast('✅ Đã liên kết task')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const unlinkTask = async (objId, taskId) => {
  try {
    await semesterPlanApi.unlinkTask(selectedPlan.value.id, objId, taskId)
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const subjectName = (id) => {
  const s = subjects.value.find(s => s.id === id)
  return s ? s.name : 'Môn #' + id
}

const handleAddSubject = async () => {
  const name = newSubjectName.value.trim()
  if (!name) return
  try {
    const res = await subjectApi.create({ name })
    if (res.data.success) subjects.value.push(res.data.data)
    newSubjectName.value = ''
    taskStore.showToast('✅ Đã thêm môn học')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const handleDeleteSubject = async (id) => {
  if (!confirm('Xóa môn học này?')) return
  try {
    await subjectApi.delete(id)
    subjects.value = subjects.value.filter(s => s.id !== id)
    taskStore.showToast('✅ Đã xóa môn học')
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const editObjective = async (obj) => {
  const title = prompt('Sửa mục tiêu:', obj.title)
  if (!title) return
  const subjectNames = subjects.value.map(s => `${s.id}:${s.name}`).join(', ')
  const subjectInput = prompt('Môn học ID (0 để bỏ):\n' + subjectNames, obj.subject_id || '0')
  const subject_id = subjectInput ? parseInt(subjectInput) || null : null
  try {
    await semesterPlanApi.updateObjective(selectedPlan.value.id, obj.id, { title, subject_id })
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

const editKR = async (kr) => {
  const title = prompt('Sửa key result:', kr.title)
  if (!title) return
  try {
    await semesterPlanApi.updateKeyResult(selectedPlan.value.id, kr.objective_id, kr.id, { title })
    const res = await semesterPlanApi.getById(selectedPlan.value.id)
    selectedPlan.value = res.data.data
  } catch (err) {
    taskStore.showToast('❌ ' + (err.response?.data?.message || 'Lỗi'), 'error')
  }
}

onMounted(fetchPlans)
</script>

<style scoped>
/* Page Layout - Modern Clean Background */
.okr-page { 
  animation: fadeIn 0.4s ease both;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 2rem;
}

/* Header - More Prominent */
.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(17,124,117, 0.1);
}

.header-left { 
  display: flex; 
  flex-direction: column; 
  gap: 0.5rem; 
}

.header-badge { 
  font-size: 0.6875rem; 
  font-weight: 700; 
  text-transform: uppercase; 
  letter-spacing: 0.1em; 
  color: white;
  background: linear-gradient(135deg, #117c75, #14b8a6);
  padding: 0.375rem 1rem; 
  border-radius: 20px; 
  width: fit-content;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.3);
}

.page-title { 
  font-size: 2rem; 
  font-weight: 800; 
  color: #1f2937;
  letter-spacing: -0.03em; 
  margin: 0;
}

.page-subtitle { 
  color: #6b7280; 
  font-size: 0.9375rem; 
  font-weight: 500;
  line-height: 1.6;
}

/* Loading */
.loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: #94a3b8; }
.loading-spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #117c75; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty State - More Engaging */
.empty-state-wrap { 
  text-align: center; 
  padding: 5rem 2rem; 
  background: white; 
  border: none;
  border-radius: 16px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-illustration { 
  margin-bottom: 2rem;
  opacity: 0.9;
}

.empty-title { 
  font-size: 1.5rem; 
  font-weight: 700; 
  color: #1f2937; 
  margin-bottom: 0.75rem; 
}

.empty-desc { 
  font-size: 1rem; 
  color: #6b7280; 
  line-height: 1.6; 
  margin-bottom: 2rem; 
}

.btn-empty { 
  display: inline-flex; 
  align-items: center; 
  gap: 0.5rem; 
  padding: 0.875rem 2rem; 
  font-size: 0.9375rem;
  font-weight: 600;
}

/* Plan Cards - Modern Shadow Style */
.plans-list { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
}

.plan-card { 
  background: white;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.plan-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.plan-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-active {
  background: #ecfdf5;
  color: #059669;
}

.badge-completed {
  background: #f0f9ff;
  color: #0284c7;
}

.badge-draft {
  background: #f9fafb;
  color: #6b7280;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Plan Cards - Modern Shadow Style */
.plans-list { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
}

.plan-card { 
  background: white;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.plan-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.plan-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-active {
  background: #ecfdf5;
  color: #059669;
}

.badge-completed {
  background: #f0f9ff;
  color: #0284c7;
}

.badge-draft {
  background: #f9fafb;
  color: #6b7280;
}
.badge-completed .badge-dot { background: #117c75; }
.badge-draft { background: #f8fafc; color: #94a3b8; }
.badge-draft .badge-dot { background: #cbd5e1; }

/* Plan Stats */
.plan-stats { display: flex; gap: 24px; margin-bottom: 20px; padding: 14px 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
.plan-stat { display: flex; flex-direction: column; gap: 2px; }
.plan-stat-val { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.plan-stat-lbl { font-size: 0.7rem; font-weight: 500; color: #94a3b8; }
.text-green { color: #10b981 !important; }

/* Plan Actions */
.plan-actions { display: flex; gap: 6px; }
.icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; width: 34px; height: 34px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; }
.icon-btn:hover { background: #e6f7f5; border-color: #99f6e4; color: #117c75; transform: translateY(-1px); }
.icon-btn-danger:hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; }
.icon-btn-sm { width: 28px; height: 28px; border-radius: 8px; }

/* OKR Grid */
.okr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.objective-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; border-left: 4px solid #f59e0b; transition: all 0.2s; }
.objective-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.objective-card.priority-high { border-left-color: #ef4444; }
.objective-card.priority-medium { border-left-color: #f59e0b; }
.objective-card.priority-low { border-left-color: #10b981; }
.obj-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.obj-header h4 { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0; }

/* Objective Status Badge */
.obj-status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.68rem; font-weight: 700; }
.obj-achieved { background: #ecfdf5; color: #059669; }
.obj-in_progress { background: #fffbeb; color: #d97706; }
.obj-pending { background: #f8fafc; color: #94a3b8; }

/* Subject Badge */
.subject-badge { display: inline-flex; align-items: center; gap: 4px; background: #e6f7f5; color: #117c75; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; margin-bottom: 10px; }

/* Key Results */
.kr-item { margin-bottom: 10px; }
.kr-header { display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 5px; }
.kr-title { color: #64748b; font-weight: 500; }
.kr-value { color: #475569; font-weight: 700; }
.kr-track { height: 6px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.kr-fill { height: 100%; background: linear-gradient(90deg, #117c75, #14b8a6); border-radius: 4px; transition: width 0.5s ease; }
.kr-percent { font-size: 0.68rem; font-weight: 700; color: #117c75; display: block; margin-top: 3px; text-align: right; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { width: 100%; max-height: 90vh; overflow-y: auto; border-radius: 16px; }

/* Detail Modal - Light Theme */
.detail-modal { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 25px 80px rgba(0,0,0,0.12); max-width: 820px; padding: 0; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(135deg, #f8fafc, #e6f7f5); }
.detail-header h2 { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin: 0; }
.detail-header .plan-meta { color: #94a3b8; font-size: 0.8rem; margin-top: 4px; }
.detail-header .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; }
.detail-header .close-btn:hover { background: #e2e8f0; color: #0f172a; }
.detail-modal .modal-body { padding: 24px 28px; }

/* Form Modals - Light Theme */
.form-modal { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 25px 80px rgba(0,0,0,0.12); padding: 28px; max-width: 580px; }
.form-modal .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.form-modal .modal-header h2 { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }
.form-modal .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; }
.form-modal .close-btn:hover { background: #e2e8f0; color: #0f172a; }

/* Form Elements */
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; color: #1e293b; }
.required { color: #ef4444; }
.form-input, .form-select { width: 100%; padding: 12px 16px; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; color: #0f172a; font-size: 0.9rem; font-family: inherit; transition: all 0.2s ease; outline: none; }
.form-input:hover, .form-select:hover { border-color: #cbd5e1; }
.form-input:focus, .form-select:focus { border-color: #117c75; box-shadow: 0 0 0 4px rgba(17,124,117,0.1); }
.form-input::placeholder { color: #94a3b8; }
.form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 14px; padding-right: 40px; cursor: pointer; }
.form-select option { background: #ffffff; color: #0f172a; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; }

/* Buttons */
.btn { padding: 11px 22px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary { background: #117c75; color: white; box-shadow: 0 4px 12px rgba(17,124,117,0.25); }
.btn-primary:hover { background: #0e6b64; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(17,124,117,0.35); }
.btn-primary:active { transform: translateY(0); }
.btn-secondary { background: #ffffff; color: #475569; border: 2px solid #e2e8f0; }
.btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-outline { background: transparent; color: #117c75; border: 2px solid #99f6e4; }
.btn-outline:hover { background: #e6f7f5; border-color: #117c75; }
.btn-sm { padding: 8px 16px; font-size: 0.8rem; background: #117c75; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-sm:hover { background: #0e6b64; transform: translateY(-1px); }
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Objective Detail (inside detail modal) */
.objective-detail { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 16px; }
.obj-detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.obj-detail-header h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
.obj-desc { font-size: 0.82rem; color: #64748b; margin-top: 4px; }
.obj-detail-actions { display: flex; gap: 4px; }
.gpa-badge { display: inline-flex; align-items: center; gap: 4px; background: #e6f7f5; color: #117c75; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-bottom: 12px; }

/* KR Detail */
.kr-detail { margin: 12px 0; padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; }
.kr-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.kr-detail-actions { display: flex; gap: 2px; }
.kr-stats { display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b; margin-bottom: 8px; }
.kr-status-text { font-weight: 600; }
.text-amber { color: #d97706; }
.kr-update { display: flex; gap: 8px; margin-top: 10px; }
.kr-input { flex: 1; padding: 8px 12px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 0.8rem; }
.kr-input:focus { outline: none; border-color: #117c75; }

/* Tasks */
.obj-tasks { margin-top: 14px; }
.obj-tasks h4 { font-size: 0.82rem; font-weight: 700; margin-bottom: 10px; color: #475569; display: flex; align-items: center; gap: 6px; }
.task-chip { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px; }
.task-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.task-dot.done { background: #10b981; }
.task-dot.in_progress { background: #f59e0b; }
.task-dot.overdue { background: #ef4444; }
.task-dot.todo { background: #117c75; }
.task-link { color: #1e293b; text-decoration: none; font-size: 0.82rem; flex: 1; font-weight: 500; }
.task-link:hover { color: #117c75; }
.link-task-row { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.task-select { flex: 1; padding: 8px 10px !important; font-size: 0.8rem !important; }
.task-select option { color: #0f172a; }

/* Subject Manager */
.subject-mgr-body { padding: 20px; }
.subject-mgr-input-row { display: flex; gap: 8px; margin-bottom: 16px; }
.subject-mgr-input-row .form-input { flex: 1; }
.subject-mgr-list { display: flex; flex-direction: column; gap: 6px; max-height: 240px; overflow-y: auto; }
.subject-mgr-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
.subject-mgr-item span { font-size: 0.85rem; color: #0f172a; font-weight: 500; }
.subject-mgr-empty { text-align: center; padding: 20px; color: #94a3b8; font-size: 0.85rem; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .form-row { grid-template-columns: 1fr; }
  .okr-grid { grid-template-columns: 1fr; }
  .plan-stats { gap: 16px; }
  .detail-modal { max-width: 100%; }
  .detail-header { padding: 16px 20px; }
  .detail-modal .modal-body { padding: 16px 20px; }
}
</style>
