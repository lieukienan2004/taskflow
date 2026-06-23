<template>
  <div class="reports-page" id="reports-print-section">
    <!-- HERO HEADER -->
    <div class="reports-hero no-print">
      <div class="hero-content">
        <div class="hero-badge">ANALYTICS</div>
        <h1 class="hero-title">
          <span class="hero-icon">📊</span>
          Phân Tích & Báo Cáo
        </h1>
        <p class="hero-subtitle">Theo dõi xu hướng, phân tích năng suất AI, lộ trình Gantt và nhắc nhở deadline thông minh.</p>
      </div>
      <button @click="exportToPDF" class="btn-export" :disabled="exporting">
        <svg v-if="!exporting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span class="spinner mini" v-else></span>
        {{ exporting ? 'Đang xuất...' : 'Xuất PDF' }}
      </button>
    </div>

    <!-- Print-only header -->
    <div class="print-only print-pdf-header">
      <div class="print-header-row">
        <div>
          <h1>BÁO CÁO NĂNG SUẤT</h1>
          <p class="print-sub">Hệ thống Quản lý Công việc TaskFlow</p>
        </div>
        <div class="print-meta">
          <span>{{ currentDateString }}</span>
        </div>
      </div>
      <div class="print-divider"></div>
    </div>

    <!-- TREND CHART -->
    <section class="card card--trend animate-in" style="animation-delay: 0.1s">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon card-icon--blue">📈</span>
          <div>
            <h3 class="card-title">Xu hướng theo thời gian</h3>
            <p class="card-desc">Biểu đồ trực quan hóa số lượng task tạo, hoàn thành và quá hạn.</p>
          </div>
        </div>
        <div class="period-tabs">
          <button :class="['period-tab', { active: trendPeriod === 'weekly' }]" @click="changeTrendPeriod('weekly')">7 ngày</button>
          <button :class="['period-tab', { active: trendPeriod === 'monthly' }]" @click="changeTrendPeriod('monthly')">30 ngày</button>
          <button :class="['period-tab', { active: trendPeriod === 'yearly' }]" @click="changeTrendPeriod('yearly')">12 tháng</button>
        </div>
      </div>
      <div v-if="trendData.length" class="trend-summary">
        <div class="trend-sum-item">
          <span class="trend-sum-dot" style="background:#38bdf8"></span>
          <span class="trend-sum-label">Tạo mới</span>
          <span class="trend-sum-val">{{ trendData.reduce((s, d) => s + d.created, 0) }}</span>
        </div>
        <div class="trend-sum-item">
          <span class="trend-sum-dot" style="background:#10b981"></span>
          <span class="trend-sum-label">Hoàn thành</span>
          <span class="trend-sum-val">{{ trendData.reduce((s, d) => s + d.completed, 0) }}</span>
        </div>
        <div class="trend-sum-item">
          <span class="trend-sum-dot" style="background:#ef4444"></span>
          <span class="trend-sum-label">Quá hạn</span>
          <span class="trend-sum-val">{{ trendData.reduce((s, d) => s + d.overdue, 0) }}</span>
        </div>
      </div>
      <div class="chart-box" :style="{ height: trendData.length <= 2 ? '200px' : '300px' }">
        <canvas ref="trendLineChartRef"></canvas>
      </div>
    </section>

    <!-- PRODUCTIVITY AI -->
    <section class="card card--productivity animate-in" style="animation-delay: 0.2s">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon card-icon--purple">🧠</span>
          <div>
            <h3 class="card-title">Phân tích năng suất AI</h3>
            <p class="card-desc">Đánh giá tổng quan và gợi ý cải thiện dựa trên dữ liệu thực tế.</p>
          </div>
        </div>
        <button class="btn-analyze" @click="fetchProductivity" :disabled="loadingProductivity">
          <svg v-if="!loadingProductivity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          {{ loadingProductivity ? 'Đang phân tích...' : 'Phân tích lại' }}
        </button>
      </div>

      <div v-if="productivityData" class="prod-content">
        <!-- Stats Row -->
        <div class="prod-stats">
          <div class="prod-stat-card prod-stat-total">
            <div class="prod-stat-icon">📋</div>
            <div class="prod-stat-num">{{ productivityData.summary.total }}</div>
            <div class="prod-stat-label">Tổng task</div>
          </div>
          <div class="prod-stat-card prod-stat-done">
            <div class="prod-stat-icon">✅</div>
            <div class="prod-stat-num">{{ productivityData.summary.completionRate }}%</div>
            <div class="prod-stat-label">Hoàn thành</div>
          </div>
          <div class="prod-stat-card prod-stat-active">
            <div class="prod-stat-icon">⚡</div>
            <div class="prod-stat-num">{{ productivityData.summary.inProgress }}</div>
            <div class="prod-stat-label">Đang làm</div>
          </div>
          <div class="prod-stat-card prod-stat-overdue">
            <div class="prod-stat-icon">⚠️</div>
            <div class="prod-stat-num">{{ productivityData.summary.overdue }}</div>
            <div class="prod-stat-label">Quá hạn</div>
          </div>
        </div>

        <!-- Insights -->
        <div class="prod-insights" v-if="productivityData.insights.length">
          <div class="section-label">
            <span class="section-label-icon">💡</span>
            Gợi ý cải thiện
          </div>
          <div class="insight-list">
            <div v-for="(insight, idx) in productivityData.insights" :key="idx" class="insight-item">
              <div class="insight-dot"></div>
              <span>{{ insight }}</span>
            </div>
          </div>
        </div>

        <!-- Category Bars -->
        <div class="prod-categories" v-if="productivityData.categoryInsights.length">
          <div class="section-label">
            <span class="section-label-icon">📊</span>
            Hiệu suất theo danh mục
          </div>
          <div class="category-bars">
            <div v-for="cat in productivityData.categoryInsights" :key="cat.category" class="category-row">
              <span class="cat-label">{{ cat.category }}</span>
              <div class="cat-track">
                <div class="cat-fill" :style="{ width: cat.rate + '%' }"></div>
              </div>
              <span class="cat-value">{{ cat.done }}/{{ cat.total }}</span>
              <span class="cat-percent">{{ cat.rate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="loadingProductivity" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Đang thu thập dữ liệu...</span>
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon">🤖</span>
        <p>Nhấn "Phân tích lại" để AI đánh giá năng suất của bạn.</p>
      </div>
    </section>

    <!-- GANTT CHART -->
    <section class="card card--gantt animate-in" style="animation-delay: 0.3s">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon card-icon--green">📅</span>
          <div>
            <h3 class="card-title">Biểu đồ Lộ trình (Gantt)</h3>
            <p class="card-desc">Trực quan hóa timeline các nhiệm vụ theo ngày.</p>
          </div>
        </div>
        <div class="gantt-legend">
          <span class="legend-chip"><span class="legend-dot dot-todo"></span>Chưa làm</span>
          <span class="legend-chip"><span class="legend-dot dot-progress"></span>Đang làm</span>
          <span class="legend-chip"><span class="legend-dot dot-done"></span>Hoàn thành</span>
          <span class="legend-chip"><span class="legend-dot dot-overdue"></span>Trễ hạn</span>
        </div>
      </div>

      <div class="gantt-scroll" v-if="ganttTasks.length > 0">
        <div class="gantt-table" :style="{ minWidth: ganttTableMinWidth + 'px' }">
          <div class="gantt-axis">
            <div class="gantt-name-col axis-label">Nhiệm vụ</div>
            <div class="gantt-timeline">
              <div v-for="axis in ganttAxisDates" :key="axis.label" class="gantt-date-cell" :style="{ width: axisCellWidth + '%' }">
                {{ axis.label }}
              </div>
            </div>
          </div>
          <div v-for="gt in ganttTasks" :key="gt.id" class="gantt-row">
            <div class="gantt-name-col">
              <span class="gantt-task-name" :title="gt.title">{{ gt.title }}</span>
              <span class="gantt-task-dates">{{ formatDateShort(gt.start) }} → {{ formatDateShort(gt.end) }}</span>
            </div>
            <div class="gantt-timeline">
              <div v-for="idx in ganttAxisDates.length" :key="idx" class="gantt-gridline" :style="{ left: ((idx - 1) * (100 / ganttAxisDates.length)) + '%' }"></div>
              <div class="gantt-bar" :class="'gantt-bar--' + gt.status" :style="{ left: gt.offsetPercent + '%', width: Math.max(gt.widthPercent, 3) + '%' }" :title="gt.title + ' (' + gt.statusText + ')'">
                <span class="bar-text">{{ gt.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <span class="empty-icon">📅</span>
        <p>Không có task nào đủ thông tin ngày bắt đầu / hạn chót để vẽ Gantt.</p>
      </div>
    </section>

    <!-- REMINDERS -->
    <section class="card card--reminder animate-in" style="animation-delay: 0.4s">
      <div class="card-header">
        <div class="card-header-left">
          <span class="card-icon card-icon--amber">⏰</span>
          <div>
            <h3 class="card-title">Nhắc nhở Deadline</h3>
            <p class="card-desc">Các nhiệm vụ sắp đến hạn và gửi email nhắc nhở tự động.</p>
          </div>
        </div>
        <div class="reminder-filter">
          <label>Trong vòng:</label>
          <select v-model="reminderHours" @change="fetchReminders" class="select-compact">
            <option :value="1">1 giờ</option>
            <option :value="6">6 giờ</option>
            <option :value="24">24 giờ</option>
            <option :value="72">3 ngày</option>
          </select>
        </div>
      </div>

      <div v-if="reminders.length" class="reminder-list">
        <div v-for="task in reminders" :key="task.id" class="reminder-card" :class="'reminder--' + task.priority">
          <div class="reminder-priority-bar"></div>
          <div class="reminder-body">
            <div class="reminder-main">
              <span class="reminder-task-title">{{ task.title }}</span>
              <span class="reminder-due-tag" :class="'due--' + task.priority">{{ formatDueDate(task.due_date) }}</span>
            </div>
            <button class="btn-send-email" @click="sendReminderEmail(task.id)" :disabled="sendingReminder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              {{ sendingReminder ? 'Đang gửi...' : 'Gửi nhắc nhở' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon">🎉</span>
        <p>Không có task nào sắp đến hạn trong {{ reminderHours }} giờ tới. Yên tâm nhé!</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { taskApi, reminderApi, trendApi, productivityApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'
import Chart from 'chart.js/auto'
import html2pdf from 'html2pdf.js'

const taskStore = useTaskStore()

// State
const tasksList = ref([])
const exporting = ref(false)

const trendLineChartRef = ref(null)
let trendLineChart = null

// Trend state
const trendPeriod = ref('weekly')
const trendData = ref([])

// Productivity state
const productivityData = ref(null)
const loadingProductivity = ref(false)

// Reminder state
const reminders = ref([])
const reminderHours = ref(24)
const sendingReminder = ref(false)

const currentDateString = computed(() => {
  return new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Fetch tasks for Gantt + export
const fetchReportsData = async () => {
  try {
    const tasksRes = await taskApi.getAll()
    tasksList.value = tasksRes.data.data
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu báo cáo:', err)
    taskStore.showToast('❌ Không thể tải dữ liệu báo cáo', 'error')
  }
}

onMounted(() => {
  fetchReportsData()
  fetchTrendData()
  fetchProductivity()
  fetchReminders()
})

// Trend chart functions
const fetchTrendData = async () => {
  try {
    const res = await trendApi.getTrends(trendPeriod.value)
    trendData.value = res.data.data || []
    await nextTick()
    renderTrendLineChart()
  } catch (err) {
    console.error('Lỗi tải trend:', err)
  }
}

const changeTrendPeriod = (period) => {
  trendPeriod.value = period
  fetchTrendData()
}

const renderTrendLineChart = () => {
  if (trendLineChart) trendLineChart.destroy()
  const canvas = trendLineChartRef.value
  if (!canvas || !trendData.value.length) return

  const labels = trendData.value.map(d => {
    const raw = d.period
    if (!raw) return ''
    if (raw.includes('T')) {
      const dt = new Date(raw)
      return `${dt.getDate()}/${dt.getMonth() + 1}`
    }
    if (/^\d{4}-\d{2}$/.test(raw)) {
      const [y, m] = raw.split('-')
      return `Th${parseInt(m)}/${y.slice(2)}`
    }
    return raw
  })

  const hasData = trendData.value.some(d => d.created > 0 || d.completed > 0 || d.overdue > 0)
  const isSinglePoint = labels.length <= 2

  trendLineChart = new Chart(canvas, {
    type: isSinglePoint ? 'bar' : 'line',
    data: {
      labels,
      datasets: isSinglePoint ? [
        { label: 'Tạo mới', data: trendData.value.map(d => d.created), backgroundColor: 'rgba(56,189,248,0.7)', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 6 },
        { label: 'Hoàn thành', data: trendData.value.map(d => d.completed), backgroundColor: 'rgba(16,185,129,0.7)', borderColor: '#10b981', borderWidth: 1, borderRadius: 6 },
        { label: 'Quá hạn', data: trendData.value.map(d => d.overdue), backgroundColor: 'rgba(239,68,68,0.7)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 6 }
      ] : [
        { label: 'Tạo mới', data: trendData.value.map(d => d.created), borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
        { label: 'Hoàn thành', data: trendData.value.map(d => d.completed), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
        { label: 'Quá hạn', data: trendData.value.map(d => d.overdue), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#64748b', font: { size: 12, weight: '500' }, usePointStyle: true, pointStyle: 'circle', padding: 16 } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        y: { beginAtZero: true, ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1 }, grid: { color: '#f1f5f9' } }
      }
    }
  })
}

// Productivity functions
const fetchProductivity = async () => {
  loadingProductivity.value = true
  try {
    const res = await productivityApi.analyze()
    productivityData.value = res.data.data
  } catch (err) {
    console.error('Lỗi phân tích:', err)
    taskStore.showToast('❌ Không thể phân tích năng suất', 'error')
  } finally {
    loadingProductivity.value = false
  }
}

// Reminder functions
const fetchReminders = async () => {
  try {
    const res = await reminderApi.getUpcoming(reminderHours.value)
    reminders.value = res.data.data || []
  } catch (err) {
    console.error('Lỗi tải nhắc nhở:', err)
  }
}

const sendReminderEmail = async (taskId) => {
  sendingReminder.value = true
  try {
    await reminderApi.sendEmail(taskId)
    taskStore.showToast('✅ Đã gửi email nhắc nhở!', 'success')
  } catch (err) {
    taskStore.showToast('❌ Gửi email thất bại', 'error')
  } finally {
    sendingReminder.value = false
  }
}

const formatDueDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d - now
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Sắp hết hạn!'
  if (diffHours < 24) return `Còn ${diffHours} giờ`
  const diffDays = Math.round(diffHours / 24)
  return `Còn ${diffDays} ngày`
}

// GANTT CHART CALCULATIONS LOGIC
const ganttAxisDates = computed(() => {
  const items = tasksList.value
  if (items.length === 0) return []

  const dates = []
  const now = new Date()
  
  // Find min and max timestamps
  let minTime = now.getTime()
  let maxTime = now.getTime() + 7 * 24 * 60 * 60 * 1000 // default max: 7 days in future

  items.forEach(t => {
    const start = new Date(t.created_at).getTime()
    const end = t.due_date ? new Date(t.due_date).getTime() : start + 3 * 24 * 60 * 60 * 1000 // default 3 days
    if (start < minTime) minTime = start
    if (end > maxTime) maxTime = end
  })

  // Format dates in between (step size depends on range, we'll draw 8 cell intervals)
  const duration = maxTime - minTime
  const step = duration / 7

  for (let i = 0; i <= 7; i++) {
    const time = minTime + i * step
    const d = new Date(time)
    dates.push({
      timestamp: time,
      label: `${d.getDate()}/${d.getMonth() + 1}`
    })
  }

  return dates
})

const ganttTasks = computed(() => {
  const items = tasksList.value
  if (items.length === 0 || ganttAxisDates.value.length === 0) return []

  const minTime = ganttAxisDates.value[0].timestamp
  const maxTime = ganttAxisDates.value[ganttAxisDates.value.length - 1].timestamp
  const totalDuration = maxTime - minTime

  return items.map(t => {
    const start = new Date(t.created_at).getTime()
    // Default 3 days timeline if task due_date is empty
    const end = t.due_date ? new Date(t.due_date).getTime() : start + 3 * 24 * 60 * 60 * 1000

    // Bound values inside overall range
    const taskStart = Math.max(minTime, start)
    const taskEnd = Math.min(maxTime, Math.max(taskStart + 12 * 60 * 60 * 1000, end)) // min 12h block width

    const offsetPercent = ((taskStart - minTime) / totalDuration) * 100
    const widthPercent = ((taskEnd - taskStart) / totalDuration) * 100

    return {
      id: t.id,
      title: t.title,
      start,
      end,
      status: t.status,
      statusText: formatStatusText(t.status),
      offsetPercent: Math.min(99, Math.max(0, offsetPercent)),
      widthPercent: Math.min(100 - offsetPercent, Math.max(1, widthPercent))
    }
  })
})

const axisCellWidth = computed(() => {
  if (ganttAxisDates.value.length === 0) return 0
  return 100 / ganttAxisDates.value.length
})

const ganttTableMinWidth = computed(() => {
  return 200 + ganttAxisDates.value.length * 100
})

// html2pdf exporter
const exportToPDF = () => {
  exporting.value = true
  taskStore.showToast('⚙️ Đang khởi tạo bản PDF báo cáo...')
  
  const element = document.getElementById('reports-print-section')
  element.querySelectorAll('.animate-in').forEach(el => { el.style.opacity = '1'; el.style.animation = 'none' })

  const printHeader = element.querySelector('.print-pdf-header')
  if (printHeader) printHeader.style.display = 'block'
  const noPrint = element.querySelector('.no-print')
  if (noPrint) noPrint.style.display = 'none'
  element.querySelectorAll('.animate-in').forEach(el => {
    el.style.opacity = '1'
    el.style.animation = 'none'
    el.style.transform = 'none'
  })
  element.querySelectorAll('.period-tabs').forEach(el => el.style.display = 'none')
  element.querySelectorAll('.btn-analyze, .btn-send-email, .btn-export').forEach(el => el.style.display = 'none')
  element.querySelectorAll('.card').forEach(el => {
    el.style.padding = '16px'
    el.style.marginBottom = '12px'
    el.style.transition = 'none'
    el.style.boxShadow = 'none'
    el.style.opacity = '1'
    el.style.transform = 'none'
  })

  const opt = {
    margin:       [12, 10, 12, 10],
    filename:     'Bao_Cao_Tien_Do_Hoc_Tap_TaskFlow.pdf',
    image:        { type: 'jpeg', quality: 0.95 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, letterRendering: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  }

  html2pdf().from(element).set(opt).save().then(() => {
    exporting.value = false
    if (noPrint) noPrint.style.display = 'flex'
    if (printHeader) printHeader.style.display = 'none'
    element.querySelectorAll('.animate-in').forEach(el => { el.style.opacity = ''; el.style.animation = ''; el.style.transform = '' })
    element.querySelectorAll('.period-tabs').forEach(el => el.style.display = '')
    element.querySelectorAll('.btn-analyze, .btn-send-email, .btn-export').forEach(el => el.style.display = '')
    element.querySelectorAll('.card').forEach(el => {
      el.style.padding = ''
      el.style.marginBottom = ''
      el.style.transition = ''
      el.style.boxShadow = ''
      el.style.opacity = ''
      el.style.transform = ''
    })
    taskStore.showToast('✅ Báo cáo PDF đã được tải xuống!')
  }).catch(err => {
    console.error(err)
    exporting.value = false
    if (noPrint) noPrint.style.display = 'flex'
    if (printHeader) printHeader.style.display = 'none'
    element.querySelectorAll('.animate-in').forEach(el => { el.style.opacity = ''; el.style.animation = ''; el.style.transform = '' })
    element.querySelectorAll('.period-tabs').forEach(el => el.style.display = '')
    element.querySelectorAll('.btn-analyze, .btn-send-email, .btn-export').forEach(el => el.style.display = '')
    element.querySelectorAll('.card').forEach(el => {
      el.style.padding = ''
      el.style.marginBottom = ''
      el.style.transition = ''
      el.style.boxShadow = ''
      el.style.opacity = ''
      el.style.transform = ''
    })
    taskStore.showToast('❌ Không thể xuất PDF báo cáo', 'error')
  })
}

// Helpers
const formatDateShort = (timestamp) => {
  const d = new Date(timestamp)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const formatStatusText = (status) => {
  if (status === 'todo') return 'Chưa thực hiện'
  if (status === 'in_progress') return 'Đang làm'
  if (status === 'done') return 'Hoàn thành ✓'
  if (status === 'overdue') return 'Trễ hạn'
  return status
}
</script>

<style scoped>
/* ===== PAGE ===== */
.reports-page {
  max-width: 1240px;
  margin: 0 auto;
  padding-bottom: 30px;
  animation: fadeIn 0.3s ease both;
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}

/* ===== HERO HEADER ===== */
.reports-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
}
.hero-content { flex: 1; }
.hero-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(17, 124, 117, 0.08);
  color: #117c75;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.hero-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.02em;
}
.hero-icon { font-size: 1.4rem; }
.hero-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: #ffffff;
  background: #117c75;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-export:hover:not(:disabled) {
  background: #0d6660;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 124, 117, 0.25);
}
.btn-export:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-icon { width: 16px; height: 16px; }
.spinner.mini { width: 14px; height: 14px; border-width: 2px; border-color: #fff; border-top-color: transparent; }

/* ===== GLASS CARD ===== */
.card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.25s ease;
}
.card:hover { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }

/* Card header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 14px;
}
.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.card-icon--blue { background: #eff6ff; }
.card-icon--purple { background: #f5f3ff; }
.card-icon--green { background: #ecfdf5; }
.card-icon--amber { background: #fffbeb; }
.card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}
.card-desc {
  margin: 2px 0 0 0;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}

/* ===== PERIOD TABS ===== */
.period-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 10px;
}
.period-tab {
  padding: 6px 14px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.period-tab.active {
  background: #ffffff;
  color: #117c75;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.period-tab:hover:not(.active) { color: #334155; }

/* ===== CHART BOX ===== */
.trend-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}
.trend-sum-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.trend-sum-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.trend-sum-label {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}
.trend-sum-val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}
.chart-box {
  height: 300px;
  position: relative;
}

/* ===== PRODUCTIVITY ===== */
.btn-analyze {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-analyze:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}
.btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }

.prod-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.prod-stat-card {
  text-align: center;
  padding: 18px 12px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background: #ffffff;
  transition: all 0.25s;
}
.prod-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.prod-stat-icon {
  font-size: 20px;
  margin-bottom: 6px;
}
.prod-stat-num {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.prod-stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 4px;
  display: block;
}
.prod-stat-done .prod-stat-num { color: #10b981; }
.prod-stat-active .prod-stat-num { color: #f59e0b; }
.prod-stat-overdue .prod-stat-num { color: #ef4444; }

.prod-stat-total { border-top: 3px solid #e2e8f0; }
.prod-stat-done { border-top: 3px solid #10b981; }
.prod-stat-active { border-top: 3px solid #f59e0b; }
.prod-stat-overdue { border-top: 3px solid #ef4444; }

/* Section labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
}
.section-label-icon { font-size: 15px; }

/* Insights */
.prod-insights { margin-bottom: 24px; }
.insight-list { display: flex; flex-direction: column; gap: 8px; }
.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.5;
}
.insight-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #117c75;
  margin-top: 6px;
  flex-shrink: 0;
}

/* Category bars */
.category-bars { display: flex; flex-direction: column; gap: 12px; }
.category-row {
  display: grid;
  grid-template-columns: 110px 1fr 60px 50px;
  align-items: center;
  gap: 12px;
}
.cat-label {
  font-size: 0.78rem;
  color: #64748b;
  text-align: right;
  font-weight: 500;
}
.cat-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.cat-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #117c75, #2dd4bf);
  transition: width 0.6s ease;
}
.cat-value {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
}
.cat-percent {
  font-size: 0.78rem;
  color: #117c75;
  font-weight: 700;
  text-align: right;
}

/* Loading & Empty */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #94a3b8;
  font-size: 0.82rem;
}
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #f1f5f9;
  border-top-color: #117c75;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px;
  text-align: center;
}
.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}
.empty-state p {
  color: #94a3b8;
  font-size: 0.82rem;
  margin: 0;
  max-width: 340px;
  line-height: 1.5;
}

/* ===== GANTT ===== */
.gantt-legend {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.legend-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
}
.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.dot-todo { background: #94a3b8; }
.dot-progress { background: #f59e0b; }
.dot-done { background: #10b981; }
.dot-overdue { background: #ef4444; }

.gantt-scroll {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
}
.gantt-table { display: flex; flex-direction: column; }
.gantt-axis {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}
.gantt-name-col {
  width: 200px;
  padding: 10px 14px;
  border-right: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.axis-label {
  font-weight: 700;
  font-size: 0.72rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.gantt-timeline {
  flex: 1;
  position: relative;
  display: flex;
}
.gantt-date-cell {
  padding: 10px 0;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  border-right: 1px solid #f1f5f9;
}
.gantt-row {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  transition: background 0.15s;
}
.gantt-row:hover { background: #f8fafc; }
.gantt-task-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #0f172a;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gantt-task-dates {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 2px;
  display: block;
}
.gantt-gridline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #f1f5f9;
  pointer-events: none;
}
.gantt-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.gantt-bar:hover {
  transform: translateY(-50%) scaleY(1.15);
  z-index: 5;
}
.bar-text {
  font-size: 0.68rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gantt-bar--todo { background: #94a3b8; }
.gantt-bar--in_progress { background: #f59e0b; }
.gantt-bar--done { background: #10b981; }
.gantt-bar--overdue { background: #ef4444; }

/* ===== REMINDERS ===== */
.reminder-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.reminder-filter label {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}
.select-compact {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.select-compact:focus { border-color: #117c75; }

.reminder-list { display: flex; flex-direction: column; gap: 8px; }
.reminder-card {
  display: flex;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.2s;
}
.reminder-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.reminder-priority-bar { width: 4px; flex-shrink: 0; }
.reminder--high .reminder-priority-bar { background: #ef4444; }
.reminder--medium .reminder-priority-bar { background: #f59e0b; }
.reminder--low .reminder-priority-bar { background: #10b981; }
.reminder-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 14px;
}
.reminder-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.reminder-task-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.reminder-due-tag {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}
.due--high { background: #fef2f2; color: #ef4444; }
.due--medium { background: #fffbeb; color: #f59e0b; }
.due--low { background: #f0fdf4; color: #10b981; }

.btn-send-email {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-send-email:hover:not(:disabled) {
  background: #117c75;
  color: #ffffff;
  border-color: #117c75;
}
.btn-send-email:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .reports-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .card { padding: 20px; }
  .card-header { flex-direction: column; align-items: flex-start; }
  .prod-stats { grid-template-columns: repeat(2, 1fr); }
  .category-row { grid-template-columns: 80px 1fr 50px 40px; gap: 8px; }
  .reminder-body { flex-direction: column; align-items: flex-start; }
  .btn-send-email { align-self: flex-end; }
}
@media (max-width: 768px) {
  .reports-hero {
    padding: 16px;
    margin-bottom: 16px;
    gap: 12px;
  }

  .hero-title {
    font-size: 1.2rem;
  }

  .hero-subtitle {
    font-size: 0.75rem;
  }

  .btn-export {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
  }

  .card {
    padding: 16px;
    margin-bottom: 14px;
    border-radius: 12px;
  }

  .card-title {
    font-size: 0.88rem;
  }

  .card-desc {
    font-size: 0.72rem;
  }

  .period-tabs {
    width: 100%;
  }

  .period-tab {
    flex: 1;
    text-align: center;
    padding: 6px 8px;
    font-size: 0.72rem;
  }

  .chart-box {
    height: 200px;
  }

  .trend-summary {
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
  }

  .trend-sum-item {
    gap: 6px;
  }

  .prod-stats {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .prod-stat-card {
    padding: 14px 10px;
  }

  .prod-stat-num {
    font-size: 1.4rem;
  }

  .prod-stat-label {
    font-size: 0.65rem;
  }

  .category-row {
    grid-template-columns: 70px 1fr 45px 38px;
    gap: 6px;
  }

  .cat-label {
    font-size: 0.7rem;
  }

  .cat-percent {
    font-size: 0.7rem;
  }

  .gantt-legend {
    gap: 4px;
  }

  .legend-chip {
    font-size: 0.65rem;
    padding: 3px 7px;
  }

  .gantt-name-col {
    width: 120px;
    padding: 8px 10px;
  }

  .gantt-task-name {
    font-size: 0.75rem;
  }

  .gantt-task-dates {
    font-size: 0.62rem;
  }

  .gantt-date-cell {
    font-size: 0.65rem;
    padding: 8px 0;
  }

  .reminder-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .reminder-body {
    padding: 10px 12px;
    gap: 10px;
  }

  .reminder-task-title {
    font-size: 0.75rem;
  }

  .reminder-due-tag {
    font-size: 0.62rem;
  }

  .btn-send-email {
    width: 100%;
    justify-content: center;
    padding: 8px 12px;
    font-size: 0.72rem;
  }

  .btn-analyze {
    width: 100%;
    justify-content: center;
    padding: 8px 12px;
  }

  .insight-item {
    padding: 8px 10px;
    font-size: 0.75rem;
  }

  .section-label {
    font-size: 0.75rem;
  }
}
@media (max-width: 600px) {
  .prod-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
  .gantt-name-col { width: 140px; }
}

/* ===== PRINT ===== */
.print-only { display: none; }
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .reports-page { padding: 0 !important; }
  .card {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: none !important;
    break-inside: avoid;
  }
  .card-title { color: #0f172a !important; }
  .card-desc { color: #64748b !important; }
  .animate-in { opacity: 1 !important; animation: none !important; }
}

/* Print header styles */
.print-pdf-header {
  padding: 0 0 12px 0;
  margin-bottom: 16px;
}
.print-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.print-pdf-header h1 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px 0;
  letter-spacing: -0.02em;
}
.print-sub {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}
.print-meta {
  font-size: 11px;
  color: #64748b;
  text-align: right;
}
.print-divider {
  height: 2px;
  background: linear-gradient(90deg, #117c75, #2dd4bf, transparent);
  margin-top: 12px;
  border-radius: 1px;
}
</style>
