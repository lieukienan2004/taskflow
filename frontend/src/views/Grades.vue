<template>
  <div class="grades-page">
    <div class="page-header">
      <div>
        <h1>📊 Quản Lý Điểm & GPA</h1>
        <p class="subtitle">Theo dõi điểm học tập và tính toán GPA tự động</p>
      </div>
      <button class="btn-primary" @click="openAddModal">+ Thêm Môn Học</button>
    </div>

    <!-- Help Box -->
    <div class="help-box">
      <div class="help-icon">💡</div>
      <div>
        <strong>Cách tính điểm:</strong>
        <p>Điểm TB = (Chuyên cần × % CC) + (Giữa kỳ × % GK) + (Cuối kỳ × % CK)</p>
        <p><small>Ví dụ: CC=8 (10%), GK=7 (30%), CK=9 (60%) → Điểm TB = 8.5</small></p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card gpa">
        <div class="stat-icon">🏆</div>
        <div>
          <div class="stat-label">GPA Tích Lũy</div>
          <div class="stat-value">{{ overallGpa }}</div>
          <div class="stat-desc">{{ gpaClassification }}</div>
        </div>
      </div>
      <div class="stat-card credits">
        <div class="stat-icon">🎓</div>
        <div>
          <div class="stat-label">Tổng Tín Chỉ</div>
          <div class="stat-value">{{ totalCredits }}</div>
          <div class="stat-desc">{{ grades.length }} môn học</div>
        </div>
      </div>
      <div class="stat-card average">
        <div class="stat-icon">📈</div>
        <div>
          <div class="stat-label">Điểm TB (Hệ 10)</div>
          <div class="stat-value">{{ overallAverage }}</div>
          <div class="stat-desc">{{ completionPercent }}% hoàn thành</div>
        </div>
      </div>
    </div>

    <div v-if="grades.length === 0" class="empty">
      <div class="empty-icon">📚</div>
      <h3>Chưa có môn học nào</h3>
      <p>Thêm môn học để theo dõi điểm số và GPA</p>
      <button class="btn-primary" @click="openAddModal">Thêm Môn Đầu Tiên</button>
    </div>

    <div v-else class="grades-grid">
      <div v-for="g in grades" :key="g.id" class="grade-card">
        <div class="card-header">
          <div class="subject-info">
            <h3>{{ g.subject_name }}</h3>
            <div class="meta">
              <span class="badge">{{ g.credits }} Tín chỉ</span>
              <span class="target">🎯 Mục tiêu: {{ g.target_gpa }}</span>
            </div>
          </div>
          <div class="actions">
            <button @click="editGrade(g)" class="btn-icon" title="Sửa">✏️</button>
            <button @click="deleteGrade(g.id)" class="btn-icon" title="Xóa">🗑️</button>
          </div>
        </div>
        
        <!-- Scores Display -->
        <div class="scores-section">
          <div class="score-row">
            <span class="score-label">Chuyên cần ({{ g.weight_attendance }}%)</span>
            <span class="score-value" :class="{ empty: !g.grade_attendance }">
              {{ formatScore(g.grade_attendance) }}
            </span>
          </div>
          <div class="score-row">
            <span class="score-label">Giữa kỳ ({{ g.weight_midterm }}%)</span>
            <span class="score-value" :class="{ empty: !g.grade_midterm }">
              {{ formatScore(g.grade_midterm) }}
            </span>
          </div>
          <div class="score-row">
            <span class="score-label">Cuối kỳ ({{ g.weight_final }}%)</span>
            <span class="score-value" :class="{ empty: !g.grade_final }">
              {{ formatScore(g.grade_final) }}
            </span>
          </div>
        </div>

        <!-- Average Display -->
        <div class="average-section">
          <div class="average-label">Điểm Trung Bình</div>
          <div class="average-value" :class="getClass(calculateAverage(g))">
            {{ formatScore(calculateAverage(g)) }}
          </div>
          <div class="average-formula" v-if="calculateAverage(g)">
            = {{ formatScore(g.grade_attendance) }} × {{ g.weight_attendance }}% + 
            {{ formatScore(g.grade_midterm) }} × {{ g.weight_midterm }}% + 
            {{ formatScore(g.grade_final) }} × {{ g.weight_final }}%
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Sửa Môn Học' : 'Thêm Môn Học' }}</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-body">
            <!-- Basic Info -->
            <div class="form-group">
              <label>Tên môn học</label>
              <input v-model="form.subject_name" required placeholder="Ví dụ: Lập trình Web" class="input-large">
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Số tín chỉ</label>
                <input v-model.number="form.credits" type="number" min="1" max="10" required>
              </div>
              <div class="form-group">
                <label>Mục tiêu</label>
                <select v-model="form.target_gpa">
                  <option value="A">A (8.5-10)</option>
                  <option value="B+">B+ (8.0-8.4)</option>
                  <option value="B">B (7.0-7.9)</option>
                  <option value="C">C (5.5-6.9)</option>
                </select>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Weights Section -->
            <div class="section-header">
              <h3>Tỷ trọng điểm (%)</h3>
              <span class="helper-text">Tổng phải bằng 100%</span>
            </div>

            <div class="weights-row">
              <div class="weight-input">
                <label>Chuyên cần</label>
                <input v-model.number="form.weight_attendance" type="number" min="0" max="100" required>
                <span class="unit">%</span>
              </div>
              <div class="weight-input">
                <label>Giữa kỳ</label>
                <input v-model.number="form.weight_midterm" type="number" min="0" max="100" required>
                <span class="unit">%</span>
              </div>
              <div class="weight-input">
                <label>Cuối kỳ</label>
                <input v-model.number="form.weight_final" type="number" min="0" max="100" required>
                <span class="unit">%</span>
              </div>
            </div>

            <div class="weight-check" :class="{ valid: totalWeights === 100, invalid: totalWeights !== 100 }">
              <span>Tổng: {{ totalWeights }}%</span>
              <span v-if="totalWeights === 100">✓ Hợp lệ</span>
              <span v-else>✗ Phải = 100%</span>
            </div>

            <div class="divider"></div>

            <!-- Scores Section -->
            <div class="section-header">
              <h3>Nhập điểm</h3>
              <span class="helper-text">Thang điểm 10 - Để trống nếu chưa có</span>
            </div>

            <div class="scores-row">
              <div class="score-input">
                <label>Chuyên cần</label>
                <input v-model.number="form.grade_attendance" type="number" step="0.1" min="0" max="10" placeholder="0-10">
              </div>
              <div class="score-input">
                <label>Giữa kỳ</label>
                <input v-model.number="form.grade_midterm" type="number" step="0.1" min="0" max="10" placeholder="0-10">
              </div>
              <div class="score-input">
                <label>Cuối kỳ</label>
                <input v-model.number="form.grade_final" type="number" step="0.1" min="0" max="10" placeholder="0-10">
              </div>
            </div>

            <!-- Preview -->
            <div v-if="previewAverage !== null" class="preview-box">
              <div class="preview-label">Điểm trung bình dự kiến</div>
              <div class="preview-value">{{ previewAverage }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-cancel">Hủy</button>
            <button type="submit" :disabled="totalWeights !== 100" class="btn-submit">
              {{ isEdit ? 'Cập Nhật' : 'Thêm Môn Học' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gradeApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const store = useTaskStore()
const grades = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const form = ref({
  subject_name: '',
  credits: 3,
  grade_attendance: null,
  grade_midterm: null,
  grade_final: null,
  weight_attendance: 10,
  weight_midterm: 30,
  weight_final: 60,
  target_gpa: 'A'
})

const totalWeights = computed(() => {
  return (form.value.weight_attendance || 0) + (form.value.weight_midterm || 0) + (form.value.weight_final || 0)
})

const previewAverage = computed(() => {
  const a = form.value.grade_attendance || 0
  const m = form.value.grade_midterm || 0
  const f = form.value.grade_final || 0
  if (!a && !m && !f) return null
  return ((a * form.value.weight_attendance + m * form.value.weight_midterm + f * form.value.weight_final) / 100).toFixed(2)
})

const totalCredits = computed(() => grades.value.reduce((acc, g) => acc + g.credits, 0))

const overallAverage = computed(() => {
  let total = 0, credits = 0
  grades.value.forEach(g => {
    const avg = calculateAverage(g)
    if (avg !== null) {
      total += avg * g.credits
      credits += g.credits
    }
  })
  return credits === 0 ? '-' : (total / credits).toFixed(2)
})

const overallGpa = computed(() => {
  let total = 0, credits = 0
  grades.value.forEach(g => {
    const avg = calculateAverage(g)
    if (avg !== null) {
      total += getGpa(avg) * g.credits
      credits += g.credits
    }
  })
  return credits === 0 ? '0.00' : (total / credits).toFixed(2)
})

const gpaClassification = computed(() => {
  const gpa = parseFloat(overallGpa.value)
  if (gpa >= 3.6) return 'Xuất sắc 👑'
  if (gpa >= 3.2) return 'Giỏi 🌟'
  if (gpa >= 2.5) return 'Khá 👍'
  if (gpa >= 2.0) return 'Trung bình'
  return gpa === 0 ? 'Chưa có' : 'Yếu'
})

const completionPercent = computed(() => {
  if (grades.value.length === 0) return 0
  const done = grades.value.filter(g => g.grade_final !== null).length
  return Math.round((done / grades.value.length) * 100)
})

const calculateAverage = (g) => {
  if (!g.grade_attendance && !g.grade_midterm && !g.grade_final) return null
  const a = g.grade_attendance || 0
  const m = g.grade_midterm || 0
  const f = g.grade_final || 0
  return (a * g.weight_attendance + m * g.weight_midterm + f * g.weight_final) / 100
}

const formatScore = (val) => val == null ? '-' : parseFloat(val).toFixed(2)

const getClass = (avg) => {
  if (avg == null) return ''
  if (avg >= 8.0) return 'high'
  if (avg >= 5.5) return 'med'
  return 'low'
}

const getGpa = (avg) => {
  if (avg >= 8.5) return 4.0
  if (avg >= 8.0) return 3.5
  if (avg >= 7.0) return 3.0
  if (avg >= 6.5) return 2.5
  if (avg >= 5.5) return 2.0
  if (avg >= 5.0) return 1.5
  if (avg >= 4.0) return 1.0
  return 0.0
}

const fetchGrades = async () => {
  try {
    const res = await gradeApi.getAll()
    grades.value = res.data.data
  } catch (err) {
    store.showToast('Không thể tải dữ liệu', 'error')
  }
}

const openAddModal = () => {
  isEdit.value = false
  form.value = {
    subject_name: '',
    credits: 3,
    grade_attendance: null,
    grade_midterm: null,
    grade_final: null,
    weight_attendance: 10,
    weight_midterm: 30,
    weight_final: 60,
    target_gpa: 'A'
  }
  showModal.value = true
}

const editGrade = (g) => {
  isEdit.value = true
  editingId.value = g.id
  form.value = { ...g }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  console.log('Form data:', form.value)
  console.log('Total weights:', totalWeights.value)
  
  if (totalWeights.value !== 100) {
    store.showToast('Tổng trọng số phải bằng 100%', 'error')
    return
  }
  
  try {
    const data = { ...form.value }
    console.log('Submitting data:', data)
    
    if (isEdit.value) {
      await gradeApi.update(editingId.value, data)
      store.showToast('Cập nhật thành công!', 'success')
    } else {
      const response = await gradeApi.create(data)
      console.log('Create response:', response)
      store.showToast('Thêm môn học thành công!', 'success')
    }
    closeModal()
    fetchGrades()
  } catch (err) {
    console.error('Submit error:', err)
    console.error('Error response:', err.response)
    const errorMsg = err.response?.data?.message || 'Lỗi khi lưu'
    store.showToast(errorMsg, 'error')
  }
}

const deleteGrade = async (id) => {
  if (confirm('Xóa môn học này?')) {
    try {
      await gradeApi.delete(id)
      store.showToast('Đã xóa!', 'success')
      fetchGrades()
    } catch (err) {
      store.showToast('Không thể xóa', 'error')
    }
  }
}

onMounted(fetchGrades)
</script>

<style scoped>
.grades-page {
  padding: 3rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  max-width: 1400px;
  margin: 0 auto;
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
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Help Box */
.help-box {
  display: flex;
  gap: 1.25rem;
  background: white;
  border: 2px solid #e0e7ff;
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.help-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.help-box strong {
  color: #4c1d95;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
}

.help-box p {
  color: #5b21b6;
  font-size: 0.875rem;
  margin: 0.375rem 0;
  line-height: 1.5;
}

.help-box small {
  color: #117c75;
  font-style: italic;
}
/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-desc {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Grades Table */
.grades-table {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 100px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 100px;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.subject-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
}

.credits-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  color: #117c75;
  background: #e6f7f5;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid #ccfbf1;
  margin-top: 4px;
  width: fit-content;
}

.score-cell {
  font-size: 0.9375rem;
  color: #334155;
  font-weight: 500;
}

.score-cell.empty {
  color: #cbd5e1;
}

.average-cell {
  font-size: 1rem;
  font-weight: 700;
}

.average-cell.high {
  color: #10b981;
}

.average-cell.med {
  color: #f59e0b;
}

.average-cell.low {
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-icon:hover {
  background: #dbeafe;
  border-color: #60a5fa;
  color: #2563eb;
}

.btn-icon:last-child:hover {
  background: #fee2e2;
  border-color: #f87171;
  color: #dc2626;
}

/* Empty State */
.empty {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 3px dashed #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.4;
}

.empty h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.empty p {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeInOverlay 0.3s ease;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white !important;
  border-radius: 24px;
  width: 90%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1f2937 !important;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  border-bottom: 2px solid #f3f4f6;
  background: white !important;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937 !important;
  letter-spacing: -0.01em;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #fef2f2;
  color: #dc2626;
  transform: scale(1.05);
}

form {
  display: flex;
  flex-direction: column;
}

.form-body {
  padding: 2.5rem;
  background: white !important;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 700;
  color: #374151 !important;
  font-size: 0.9375rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white !important;
  color: #1f2937 !important;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-large {
  font-size: 1.125rem !important;
  padding: 1rem 1.25rem !important;
  font-weight: 600;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 2rem 0;
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937 !important;
  margin: 0 0 0.375rem 0;
}

.helper-text {
  font-size: 0.875rem;
  color: #6b7280 !important;
  font-weight: 500;
}

/* Weights Row */
.weights-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.weight-input {
  position: relative;
}

.weight-input label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b !important;
  margin-bottom: 0.5rem;
  text-align: center;
}

.weight-input input {
  width: 100%;
  padding: 0.75rem 2.25rem 0.75rem 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  background: white !important;
  color: #1e293b !important;
}

.weight-input input:focus {
  border-color: #117c75;
  background: white !important;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.1);
}

.weight-input .unit {
  position: absolute;
  right: 0.875rem;
  top: 2.125rem;
  font-size: 1rem;
  font-weight: 700;
  color: #94a3b8 !important;
  pointer-events: none;
}

.weight-check {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
}

.weight-check.valid {
  background: #dcfce7 !important;
  color: #166534 !important;
  border: 2px solid #86efac;
}

.weight-check.invalid {
  background: #fee2e2 !important;
  color: #991b1b !important;
  border: 2px solid #fca5a5;
}

/* Scores Row */
.scores-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.score-input label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b !important;
  margin-bottom: 0.5rem;
  text-align: center;
}

.score-input input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  background: white !important;
  color: #1e293b !important;
}

.score-input input:focus {
  border-color: #117c75;
  background: white !important;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.1);
}

.score-input input::placeholder {
  color: #cbd5e1 !important;
  font-weight: 500;
}

/* Preview Box */
.preview-box {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  text-align: center;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e !important;
  margin-bottom: 0.5rem;
}

.preview-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #78350f !important;
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

.btn-submit {
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

.btn-submit:hover:not(:disabled) {
  background: #0e6b64 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

small {
  font-size: 0.75rem;
  color: #64748b;
  display: block;
  margin-top: 0.25rem;
}

small.error {
  color: #ef4444;
}

/* Help Box */
.help-box {
  display: flex;
  gap: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.help-icon {
  font-size: 1.5rem;
}

.help-box strong {
  color: #1e40af;
  font-size: 0.9375rem;
  display: block;
  margin-bottom: 0.375rem;
}

.help-box p {
  color: #1e3a8a;
  font-size: 0.8125rem;
  margin: 0.25rem 0;
}

.help-box small {
  color: #3b82f6;
  font-style: italic;
}

/* Grades Grid */
.grades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.grade-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.grade-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.subject-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.target {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.scores-section {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1.25rem;
}

.score-row {
  display: flex;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.score-row:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.score-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.score-value {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1f2937;
}

.score-value.empty {
  color: #d1d5db;
  font-style: italic;
}

.average-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
}

.average-label {
  font-size: 0.8125rem;
  color: #92400e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.average-value {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.average-value.high { color: #059669; }
.average-value.med { color: #d97706; }
.average-value.low { color: #dc2626; }

.average-formula {
  font-size: 0.75rem;
  color: #92400e;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #fbbf24;
  line-height: 1.5;
}

.weight-inputs, .score-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.weight-item, .score-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.weight-item label, .score-item label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.weight-item input, .score-item input {
  text-align: center;
  font-weight: 700;
}

.weight-total {
  text-align: center;
  padding: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
}

.weight-total.error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.weight-inputs, .score-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.weight-item, .score-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.weight-item label, .score-item label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.weight-item input, .score-item input {
  text-align: center;
  font-weight: 700;
}

.weight-total {
  text-align: center;
  padding: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
}

.weight-total.error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

@media (max-width: 768px) {
  .grades-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row-2,
  .weights-row,
  .scores-row {
    grid-template-columns: 1fr;
  }
  
  .weight-input .unit {
    top: 2.5rem;
  }
}
</style>
