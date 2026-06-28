<template>
  <div class="gpa-page">
    <!-- Header -->
    <div class="gpa-header">
      <div class="header-left">
        <div class="header-badge">GPA</div>
        <h1 class="page-title">Quản lý điểm số</h1>
        <p class="page-subtitle">Theo dõi điểm các môn học và tính toán GPA tự động</p>
      </div>
      <div class="header-actions">
        <button class="btn-add" @click="openAddModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm môn học
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card gpa-main-card">
          <div class="gpa-ring-wrapper">
            <svg viewBox="0 0 120 120" class="gpa-ring">
              <circle cx="60" cy="60" r="52" class="ring-bg"/>
              <circle cx="60" cy="60" r="52" class="ring-fill" :style="{ strokeDashoffset: gpaDashOffset, stroke: gpaColor }"/>
            </svg>
            <div class="gpa-center">
              <span class="gpa-number">{{ gpaDisplay }}</span>
              <span class="gpa-scale">/4.0</span>
            </div>
          </div>
          <div class="gpa-info">
            <h3>GPA tích lũy</h3>
            <p class="gpa-label" :style="{ color: gpaColor }">{{ gpaLabel }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon credits-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div class="card-data">
            <span class="card-val">{{ totalCredits }}</span>
            <span class="card-lbl">Tổng tín chỉ</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon subject-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          </div>
          <div class="card-data">
            <span class="card-val">{{ grades.length }}</span>
            <span class="card-lbl">Môn học</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon target-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div class="card-data">
            <span class="card-val target-val">{{ gpaPercent }}%</span>
            <span class="card-lbl">Tiến độ mục tiêu</span>
          </div>
        </div>
      </div>

      <!-- Chart + Legend -->
      <div v-if="grades.length > 0" class="chart-section">
        <div class="chart-card">
          <h3 class="section-title">Điểm các môn học</h3>
          <div class="bar-chart">
            <div v-for="(g, i) in sortedGrades" :key="g.id" class="bar-group">
              <div class="bar-wrapper">
                <div class="bar" :style="{ height: barHeight(g) + '%', background: barColor(g) }">
                  <span class="bar-val">{{ getWeightedGrade(g) }}</span>
                </div>
              </div>
              <span class="bar-label" :title="g.subject_name">{{ truncate(g.subject_name, 10) }}</span>
            </div>
          </div>
        </div>

        <div class="legend-card">
          <h3 class="section-title">Bảng điểm</h3>
          <div class="grade-scale">
            <div class="scale-row" v-for="s in gradeScale" :key="s.letter">
              <span class="scale-dot" :style="{ background: s.color }"></span>
              <span class="scale-letter">{{ s.letter }}</span>
              <span class="scale-range">{{ s.range }}</span>
              <span class="scale-label">{{ s.label }}</span>
            </div>
          </div>

          <div class="target-section">
            <h4>GPA mục tiêu</h4>
            <div class="target-options">
              <button v-for="t in targetOptions" :key="t" class="target-btn" :class="{ active: targetGpa === t }" @click="setTarget(t)">{{ t }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="grades.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="1.5" opacity="0.4">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
        <h3>Chưa có môn học nào</h3>
        <p>Nhấn nút "Thêm môn học" để bắt đầu theo dõi điểm số</p>
      </div>

      <!-- Subject List -->
      <div v-if="grades.length > 0" class="subjects-section">
        <h3 class="section-title">Danh sách môn học</h3>
        <div class="subjects-grid">
          <div v-for="g in grades" :key="g.id" class="subject-card" :class="{ 'has-final': g.grade_final !== null }">
            <div class="subject-header">
              <div class="subject-name-row">
                <span class="subject-letter" :style="{ background: letterColor(g) }">{{ letterGrade(g) }}</span>
                <div class="subject-info">
                  <h4>{{ g.subject_name }}</h4>
                  <span class="credit-badge">{{ g.credits }} tín chỉ</span>
                </div>
              </div>
              <div class="subject-actions">
                <button class="action-btn edit" @click="openEditModal(g)" title="Chỉnh sửa">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(g)" title="Xóa">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>

            <div class="grade-details">
              <div class="grade-item" v-if="g.grade_attendance !== null">
                <span class="gi-label">Chuyên cần</span>
                <span class="gi-value">{{ g.grade_attendance }}</span>
                <span class="gi-weight">{{ g.weight_attendance }}%</span>
              </div>
              <div class="grade-item" v-if="g.grade_midterm !== null">
                <span class="gi-label">Giữa kỳ</span>
                <span class="gi-value">{{ g.grade_midterm }}</span>
                <span class="gi-weight">{{ g.weight_midterm }}%</span>
              </div>
              <div class="grade-item final" v-if="g.grade_final !== null">
                <span class="gi-label">Cuối kỳ</span>
                <span class="gi-value">{{ g.grade_final }}</span>
                <span class="gi-weight">{{ g.weight_final }}%</span>
              </div>
            </div>

            <div class="subject-footer">
              <div class="weighted-grade">
                <span class="wg-label">Điểm tổng kết</span>
                <span class="wg-value" :style="{ color: letterColor(g) }">{{ getWeightedGrade(g) }}</span>
              </div>
              <div class="gpa-point">
                <span class="gp-label">Điểm hệ 4</span>
                <span class="gp-value">{{ gradePoint(g).toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="gpa-modal-box">
        <div class="modal-top-accent"></div>
        <div class="gpa-modal-header">
          <div class="modal-title-row">
            <div class="modal-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
            </div>
            <div>
              <h2>{{ editingGrade ? 'Chỉnh sửa môn học' : 'Thêm môn học mới' }}</h2>
              <p class="modal-subtitle">{{ editingGrade ? 'Cập nhật thông tin điểm' : 'Nhập thông tin môn học và điểm số' }}</p>
            </div>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form @submit.prevent="saveGrade" class="modal-form">
          <div class="form-section">
            <div class="section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Thông tin cơ bản
            </div>
            <div class="form-group">
              <label>Tên môn học <span class="required">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                <input v-model="form.subject_name" type="text" placeholder="VD: Lập trình Web" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Số tín chỉ <span class="required">*</span></label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  <input v-model.number="form.credits" type="number" min="1" max="10" required />
                </div>
              </div>
              <div class="form-group">
                <label>Ngày thi</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input v-model="form.exam_date" type="date" />
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              Điểm thành phần
              <span class="weight-badge" :class="{ 'weight-ok': weightTotal === 100 }">{{ weightTotal }}%</span>
            </div>

            <div class="grade-cards">
              <div class="grade-card">
                <div class="gc-header">
                  <div class="gc-dot" style="background:#10b981"></div>
                  <span class="gc-name">Chuyên cần</span>
                </div>
                <div class="gc-inputs">
                  <div class="gc-field">
                    <label>Điểm</label>
                    <input v-model.number="form.grade_attendance" type="number" step="0.1" min="0" max="10" placeholder="0-10" />
                  </div>
                  <div class="gc-field">
                    <label>Trọng số</label>
                    <div class="weight-input">
                      <input v-model.number="form.weight_attendance" type="number" min="0" max="100" />
                      <span class="weight-unit">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grade-card">
                <div class="gc-header">
                  <div class="gc-dot" style="background:#f59e0b"></div>
                  <span class="gc-name">Giữa kỳ</span>
                </div>
                <div class="gc-inputs">
                  <div class="gc-field">
                    <label>Điểm</label>
                    <input v-model.number="form.grade_midterm" type="number" step="0.1" min="0" max="10" placeholder="0-10" />
                  </div>
                  <div class="gc-field">
                    <label>Trọng số</label>
                    <div class="weight-input">
                      <input v-model.number="form.weight_midterm" type="number" min="0" max="100" />
                      <span class="weight-unit">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grade-card">
                <div class="gc-header">
                  <div class="gc-dot" style="background:#ef4444"></div>
                  <span class="gc-name">Cuối kỳ</span>
                </div>
                <div class="gc-inputs">
                  <div class="gc-field">
                    <label>Điểm</label>
                    <input v-model.number="form.grade_final" type="number" step="0.1" min="0" max="10" placeholder="0-10" />
                  </div>
                  <div class="gc-field">
                    <label>Trọng số</label>
                    <div class="weight-input">
                      <input v-model.number="form.weight_final" type="number" min="0" max="100" />
                      <span class="weight-unit">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="weight-warning" v-if="weightTotal !== 100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Tổng trọng số: {{ weightTotal }}% — Phải bằng 100%
          </div>

          <div class="form-preview" v-if="previewGrade !== null">
            <div class="preview-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Điểm tổng kết</span>
            </div>
            <div class="preview-right">
              <span class="preview-score" :style="{ color: previewColor }">{{ previewGrade }}</span>
              <span class="preview-letter" :style="{ background: previewColor, color: '#fff' }">{{ previewLetter }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Hủy bỏ</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <svg v-if="!saving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ saving ? 'Đang lưu...' : (editingGrade ? 'Cập nhật' : 'Thêm môn học') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="gpa-modal-box gpa-modal-sm">
        <div class="gpa-modal-header" style="padding:20px 24px;border-bottom:1px solid #f1f5f9;">
          <h2 style="margin:0;font-size:1.05rem;font-weight:700;color:#0f172a;">Xác nhận xóa</h2>
        </div>
        <p class="delete-msg">Xóa môn học <strong>{{ deletingGrade?.subject_name }}</strong>? Hành động này không thể hoàn tác.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">Hủy</button>
          <button class="btn-delete" @click="deleteGrade" :disabled="saving">{{ saving ? 'Đang xóa...' : 'Xóa' }}</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { gradeApi } from '@/api/taskApi'

const grades = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingGrade = ref(null)
const deletingGrade = ref(null)
const targetGpa = ref('A')
const toast = ref({ show: false, message: '', type: 'success' })

const form = ref(emptyForm())

function emptyForm() {
  return {
    subject_name: '',
    credits: 3,
    grade_attendance: null,
    grade_midterm: null,
    grade_final: null,
    weight_attendance: 10,
    weight_midterm: 30,
    weight_final: 60,
    target_gpa: 'A',
    exam_date: ''
  }
}

const gradeScale = [
  { letter: 'A+', range: '9.0 – 10', label: 'Xuất sắc', color: '#10b981', min: 9.0, point: 4.0 },
  { letter: 'A', range: '8.0 – 8.9', label: 'Giỏi', color: '#22c55e', min: 8.0, point: 3.5 },
  { letter: 'B+', range: '7.0 – 7.9', label: 'Khá', color: '#3b82f6', min: 7.0, point: 3.0 },
  { letter: 'B', range: '6.0 – 6.9', label: 'TB khá', color: '#6366f1', min: 6.0, point: 2.5 },
  { letter: 'C+', range: '5.0 – 5.9', label: 'Trung bình', color: '#f59e0b', min: 5.0, point: 2.0 },
  { letter: 'C', range: '4.0 – 4.9', label: 'TB yếu', color: '#f97316', min: 4.0, point: 1.5 },
  { letter: 'D', range: '3.0 – 3.9', label: 'Yếu', color: '#ef4444', min: 3.0, point: 1.0 },
  { letter: 'F', range: '0 – 2.9', label: 'Kém', color: '#dc2626', min: 0, point: 0 }
]

const targetOptions = ['A+', 'A', 'B+', 'B', 'C+']

onMounted(() => {
  targetGpa.value = localStorage.getItem('gpa_target') || 'A'
  fetchGrades()
})

async function fetchGrades() {
  loading.value = true
  try {
    const { data } = await gradeApi.getAll()
    grades.value = data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function getWeightedGrade(g) {
  let total = 0
  let wSum = 0
  if (g.grade_attendance !== null) { total += g.grade_attendance * g.weight_attendance; wSum += g.weight_attendance }
  if (g.grade_midterm !== null) { total += g.grade_midterm * g.weight_midterm; wSum += g.weight_midterm }
  if (g.grade_final !== null) { total += g.grade_final * g.weight_final; wSum += g.weight_final }
  if (wSum === 0) return '—'
  return (total / wSum).toFixed(1)
}

function gradePoint(g) {
  const wg = parseFloat(getWeightedGrade(g))
  if (isNaN(wg)) return 0
  for (const s of gradeScale) {
    if (wg >= s.min) return s.point
  }
  return 0
}

function letterGrade(g) {
  const wg = parseFloat(getWeightedGrade(g))
  if (isNaN(wg)) return '—'
  for (const s of gradeScale) {
    if (wg >= s.min) return s.letter
  }
  return 'F'
}

function letterColor(g) {
  const wg = parseFloat(getWeightedGrade(g))
  if (isNaN(wg)) return '#94a3b8'
  for (const s of gradeScale) {
    if (wg >= s.min) return s.color
  }
  return '#dc2626'
}

const totalCredits = computed(() => grades.value.reduce((s, g) => s + (parseInt(g.credits) || 0), 0))

const gpaDisplay = computed(() => {
  if (grades.value.length === 0) return '0.00'
  let totalPoints = 0
  let totalCreds = 0
  for (const g of grades.value) {
    const gp = gradePoint(g)
    const cr = parseInt(g.credits) || 0
    totalPoints += gp * cr
    totalCreds += cr
  }
  if (totalCreds === 0) return '0.00'
  return (totalPoints / totalCreds).toFixed(2)
})

const gpaColor = computed(() => {
  const v = parseFloat(gpaDisplay.value)
  if (v >= 3.5) return '#10b981'
  if (v >= 3.0) return '#3b82f6'
  if (v >= 2.5) return '#6366f1'
  if (v >= 2.0) return '#f59e0b'
  if (v >= 1.5) return '#f97316'
  return '#ef4444'
})

const gpaLabel = computed(() => {
  const v = parseFloat(gpaDisplay.value)
  if (v >= 3.5) return 'Xuất sắc'
  if (v >= 3.0) return 'Giỏi'
  if (v >= 2.5) return 'Khá'
  if (v >= 2.0) return 'Trung bình'
  if (v >= 1.5) return 'Trung bình yếu'
  if (v > 0) return 'Yếu / Kém'
  return 'Chưa có điểm'
})

const gpaDashOffset = computed(() => {
  const circumference = 2 * Math.PI * 52
  const v = parseFloat(gpaDisplay.value) / 4.0
  return circumference - (v * circumference)
})

const gpaPercent = computed(() => {
  const targetMap = { 'A+': 4.0, 'A': 3.5, 'B+': 3.0, 'B': 2.5, 'C+': 2.0 }
  const target = targetMap[targetGpa.value] || 3.5
  const current = parseFloat(gpaDisplay.value)
  return Math.min(100, Math.round((current / target) * 100))
})

const sortedGrades = computed(() => {
  return [...grades.value].sort((a, b) => {
    const ga = parseFloat(getWeightedGrade(a)) || 0
    const gb = parseFloat(getWeightedGrade(b)) || 0
    return gb - ga
  })
})

const weightTotal = computed(() => {
  return (form.value.weight_attendance || 0) + (form.value.weight_midterm || 0) + (form.value.weight_final || 0)
})

const previewGrade = computed(() => {
  let total = 0, wSum = 0
  if (form.value.grade_attendance !== null && form.value.grade_attendance !== '') { total += form.value.grade_attendance * form.value.weight_attendance; wSum += form.value.weight_attendance }
  if (form.value.grade_midterm !== null && form.value.grade_midterm !== '') { total += form.value.grade_midterm * form.value.weight_midterm; wSum += form.value.weight_midterm }
  if (form.value.grade_final !== null && form.value.grade_final !== '') { total += form.value.grade_final * form.value.weight_final; wSum += form.value.weight_final }
  if (wSum === 0) return null
  return (total / wSum).toFixed(1)
})

const previewLetter = computed(() => {
  const v = parseFloat(previewGrade.value)
  if (isNaN(v)) return '—'
  for (const s of gradeScale) {
    if (v >= s.min) return s.letter
  }
  return 'F'
})

const previewColor = computed(() => {
  const v = parseFloat(previewGrade.value)
  if (isNaN(v)) return '#94a3b8'
  for (const s of gradeScale) {
    if (v >= s.min) return s.color
  }
  return '#dc2626'
})

function barHeight(g) {
  const wg = parseFloat(getWeightedGrade(g))
  if (isNaN(wg)) return 0
  return (wg / 10) * 100
}

function barColor(g) {
  return letterColor(g)
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '…' : str
}

function openAddModal() {
  editingGrade.value = null
  form.value = emptyForm()
  showModal.value = true
}

function openEditModal(g) {
  editingGrade.value = g
  form.value = {
    subject_name: g.subject_name,
    credits: g.credits,
    grade_attendance: g.grade_attendance,
    grade_midterm: g.grade_midterm,
    grade_final: g.grade_final,
    weight_attendance: g.weight_attendance,
    weight_midterm: g.weight_midterm,
    weight_final: g.weight_final,
    target_gpa: g.target_gpa || 'A',
    exam_date: g.exam_date ? g.exam_date.split('T')[0] : ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingGrade.value = null
}

async function saveGrade() {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.grade_attendance) payload.grade_attendance = null
    if (!payload.grade_midterm) payload.grade_midterm = null
    if (!payload.grade_final) payload.grade_final = null
    if (!payload.exam_date) payload.exam_date = null

    if (editingGrade.value) {
      await gradeApi.update(editingGrade.value.id, payload)
      showToast('Cập nhật thành công!', 'success')
    } else {
      await gradeApi.create(payload)
      showToast('Thêm môn học thành công!', 'success')
    }
    closeModal()
    await fetchGrades()
  } catch (e) {
    showToast(e.response?.data?.message || 'Có lỗi xảy ra', 'error')
  } finally {
    saving.value = false
  }
}

function confirmDelete(g) {
  deletingGrade.value = g
  showDeleteModal.value = true
}

async function deleteGrade() {
  saving.value = true
  try {
    await gradeApi.delete(deletingGrade.value.id)
    showToast('Đã xóa môn học', 'success')
    showDeleteModal.value = false
    await fetchGrades()
  } catch (e) {
    showToast('Lỗi khi xóa', 'error')
  } finally {
    saving.value = false
  }
}

function setTarget(t) {
  targetGpa.value = t
  localStorage.setItem('gpa_target', t)
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}
</script>

<style scoped>
.gpa-page { max-width: 1100px; margin: 0 auto; padding: 24px 20px; }

/* Header */
.gpa-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
.header-badge { display: inline-block; background: rgba(17,124,117,0.1); color: #117c75; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.88rem; color: #64748b; margin: 4px 0 0; }
.btn-add { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #117c75; color: #fff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-add:hover { background: #0d9488; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(17,124,117,0.3); }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; }
.spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #117c75; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Summary */
.summary-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
.summary-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; }
.gpa-main-card { background: linear-gradient(135deg, #061e1c 0%, #0a3a36 100%); border: none; color: #fff; }
.gpa-main-card .gpa-info h3 { color: #94a3b8; font-size: 0.82rem; font-weight: 500; margin: 0 0 4px; }
.gpa-main-card .gpa-info .gpa-label { font-size: 1.1rem; font-weight: 700; margin: 0; }

/* GPA Ring */
.gpa-ring-wrapper { position: relative; width: 100px; height: 100px; flex-shrink: 0; }
.gpa-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 8; }
.ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; stroke-dasharray: 326.73; transition: stroke-dashoffset 1s ease, stroke 0.5s; }
.gpa-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.gpa-number { font-size: 1.6rem; font-weight: 800; color: #fff; line-height: 1; }
.gpa-scale { font-size: 0.7rem; color: #94a3b8; }

/* Summary card icons */
.card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-icon svg { width: 22px; height: 22px; }
.credits-icon { background: rgba(16,185,129,0.1); color: #10b981; }
.subject-icon { background: rgba(59,130,246,0.1); color: #3b82f6; }
.target-icon { background: rgba(244,171,25,0.1); color: #f4ab19; }
.card-data { display: flex; flex-direction: column; }
.card-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; line-height: 1; }
.target-val { color: #f4ab19; }
.card-lbl { font-size: 0.78rem; color: #64748b; margin-top: 2px; }

/* Chart Section */
.chart-section { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 28px; }
.chart-card, .legend-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
.section-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0 0 16px; }

/* Bar Chart */
.bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding-top: 10px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; }
.bar-wrapper { width: 100%; height: 160px; display: flex; align-items: flex-end; justify-content: center; }
.bar { width: 70%; max-width: 50px; border-radius: 6px 6px 2px 2px; transition: height 0.6s ease; position: relative; min-height: 4px; }
.bar-val { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.72rem; font-weight: 700; color: #334155; white-space: nowrap; }
.bar-label { font-size: 0.7rem; color: #64748b; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70px; }

/* Legend */
.grade-scale { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.scale-row { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; }
.scale-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.scale-letter { font-weight: 700; color: #0f172a; width: 28px; }
.scale-range { color: #64748b; width: 70px; }
.scale-label { color: #475569; }

.target-section h4 { font-size: 0.85rem; font-weight: 600; color: #334155; margin: 0 0 10px; }
.target-options { display: flex; gap: 6px; flex-wrap: wrap; }
.target-btn { padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #475569; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.target-btn:hover { border-color: #117c75; color: #117c75; }
.target-btn.active { background: #117c75; border-color: #117c75; color: #fff; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; }
.empty-state h3 { font-size: 1.1rem; color: #334155; margin: 0; }
.empty-state p { font-size: 0.88rem; color: #64748b; margin: 0; }

/* Subjects */
.subjects-section { margin-bottom: 24px; }
.subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
.subject-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; transition: all 0.2s; }
.subject-card:hover { border-color: #117c75; box-shadow: 0 2px 12px rgba(17,124,117,0.08); }

.subject-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.subject-name-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.subject-letter { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.subject-info { min-width: 0; }
.subject-info h4 { font-size: 0.92rem; font-weight: 700; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.credit-badge { font-size: 0.72rem; color: #64748b; }

.subject-actions { display: flex; gap: 4px; flex-shrink: 0; }
.action-btn { width: 30px; height: 30px; border: none; border-radius: 8px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.action-btn.edit { color: #94a3b8; }
.action-btn.edit:hover { background: rgba(17,124,117,0.1); color: #117c75; }
.action-btn.delete { color: #94a3b8; }
.action-btn.delete:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

.grade-details { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.grade-item { flex: 1; min-width: 80px; background: #f8fafc; border-radius: 8px; padding: 8px 10px; text-align: center; }
.grade-item.final { background: #f0fdf9; }
.gi-label { display: block; font-size: 0.68rem; color: #64748b; margin-bottom: 2px; }
.gi-value { display: block; font-size: 1rem; font-weight: 700; color: #0f172a; }
.gi-weight { display: block; font-size: 0.65rem; color: #94a3b8; }

.subject-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f1f5f9; }
.wg-label, .gp-label { display: block; font-size: 0.7rem; color: #64748b; }
.wg-value { font-size: 1.3rem; font-weight: 800; }
.gp-value { font-size: 1.3rem; font-weight: 800; color: #0f172a; }

.modal-overlay { position: fixed; inset: 0; background: #f1f5f9; display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.gpa-modal-box { background: #ffffff !important; border-radius: 20px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.15); position: relative; color: #0f172a !important; overflow: hidden; }
.modal-top-accent { height: 4px; background: linear-gradient(90deg, #117c75, #2dd4bf, #f4ab19); }
.gpa-modal-sm { max-width: 400px; background: #ffffff !important; }
.gpa-modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px 0; background: #ffffff !important; }
.modal-title-row { display: flex; align-items: center; gap: 12px; }
.modal-icon-box { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #117c75, #0d9488); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-icon-box svg { width: 20px; height: 20px; color: #fff; }
.modal-header h2 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0; }
.modal-subtitle { font-size: 0.78rem; color: #94a3b8; margin: 2px 0 0; }
.modal-close { background: #f1f5f9; border: none; cursor: pointer; color: #94a3b8; padding: 8px; border-radius: 10px; transition: all 0.2s; margin-top: 2px; }
.modal-close:hover { background: #e2e8f0; color: #475569; }

.modal-form { padding: 16px 24px 24px; background: #ffffff !important; }
.form-section { margin-bottom: 16px; }
.section-label { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.section-label svg { color: #117c75; }
.weight-badge { margin-left: auto; background: #fef3c7; color: #92400e; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; }
.weight-badge.weight-ok { background: #d1fae5; color: #065f46; }

.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #334155; margin-bottom: 5px; }
.required { color: #ef4444; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; flex-shrink: 0; }
.input-wrapper input { width: 100%; padding: 10px 12px 10px 36px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.88rem; color: #0f172a; background: #f8fafc; transition: all 0.2s; box-sizing: border-box; }
.input-wrapper input:focus { outline: none; border-color: #117c75; background: #fff; box-shadow: 0 0 0 3px rgba(17,124,117,0.1); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.grade-cards { display: flex; flex-direction: column; gap: 10px; }
.grade-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; transition: all 0.2s; }
.grade-card:focus-within { border-color: #117c75; background: #f0fdf9; box-shadow: 0 0 0 2px rgba(17,124,117,0.08); }
.gc-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.gc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.gc-name { font-size: 0.82rem; font-weight: 600; color: #334155; }
.gc-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.gc-field label { display: block; font-size: 0.72rem; font-weight: 500; color: #64748b; margin-bottom: 3px; }
.gc-field input { width: 100%; padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #fff; transition: all 0.2s; box-sizing: border-box; }
.gc-field input:focus { outline: none; border-color: #117c75; box-shadow: 0 0 0 2px rgba(17,124,117,0.1); }
.weight-input { position: relative; display: flex; align-items: center; }
.weight-input input { padding-right: 24px; }
.weight-unit { position: absolute; right: 8px; font-size: 0.75rem; font-weight: 600; color: #94a3b8; pointer-events: none; }

.weight-warning { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; font-size: 0.82rem; font-weight: 500; color: #92400e; margin-top: 12px; }

.form-preview { margin-top: 12px; padding: 12px 16px; background: linear-gradient(135deg, #f0fdf9, #ecfdf5); border: 1px solid #a7f3d0; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; }
.preview-left { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #065f46; font-weight: 500; }
.preview-left svg { color: #10b981; }
.preview-right { display: flex; align-items: center; gap: 8px; }
.preview-score { font-size: 1.3rem; font-weight: 800; }
.preview-letter { font-size: 0.78rem; font-weight: 800; padding: 3px 10px; border-radius: 8px; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.btn-cancel { padding: 10px 20px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; color: #475569; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-save { display: flex; align-items: center; gap: 6px; padding: 10px 24px; border: none; border-radius: 10px; background: linear-gradient(135deg, #117c75, #0d9488); color: #fff; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-save:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(17,124,117,0.35); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-save:disabled:hover { transform: none; box-shadow: none; }
.btn-delete { padding: 10px 24px; border: none; border-radius: 10px; background: #ef4444; color: #fff; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-delete:hover { background: #dc2626; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
.delete-msg { padding: 16px 24px; font-size: 0.9rem; color: #475569; line-height: 1.5; }

/* Toast */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; z-index: 2000; animation: slideUp 0.3s ease; }
.toast.success { background: #10b981; color: #fff; }
.toast.error { background: #ef4444; color: #fff; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Responsive */
@media (max-width: 768px) {
  .gpa-page { padding: 16px 12px; }
  .gpa-header { flex-direction: column; }
  .page-title { font-size: 1.3rem; }
  .btn-add { width: 100%; justify-content: center; min-height: 44px; }
  .summary-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .gpa-main-card { grid-column: 1 / -1; }
  .chart-section { grid-template-columns: 1fr; }
  .subjects-grid { grid-template-columns: 1fr; }
  .grade-input-row { grid-template-columns: 1fr; }
  .gpa-modal-box { max-height: 95vh; border-radius: 16px; }
  .bar-chart { height: 150px; gap: 6px; }
  .bar-wrapper { height: 120px; }
  .bar { width: 80%; }
}
</style>
