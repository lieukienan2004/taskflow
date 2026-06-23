<template>
  <div class="page-content">
    <div class="hero-banner">
      <div class="hero-content">
        <h2 class="hero-greeting">Xin chào, {{ adminName }}</h2>
        <p class="hero-date">{{ currentDate }}</p>
        <p class="hero-sub">Tổng quan hệ thống TaskFlow</p>
      </div>
      <div class="hero-actions">
        <a :href="exportUrl" target="_blank" class="hero-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Xuất dữ liệu
        </a>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" v-for="s in statCards" :key="s.key">
        <div class="stat-icon" :style="{ background: s.bg }">
          <span v-html="s.icon"></span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(s.value) }}</div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-sub" v-if="s.sub">{{ s.sub }}</div>
        </div>
      </div>
    </div>

    <div class="row-2col">
      <div class="card">
        <div class="card-header">
          <div class="card-icon" style="background:rgba(17,124,117,0.1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <h3 class="card-title">Xu hướng 30 ngày</h3>
            <p class="card-desc">Người dùng mới & công việc</p>
          </div>
        </div>
        <div class="card-body chart-wrap">
          <canvas id="trendsChart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-icon" style="background:rgba(99,102,241,0.1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <h3 class="card-title">Phân bố theo Danh mục</h3>
            <p class="card-desc">Top 8 danh mục nhiều công việc nhất</p>
          </div>
        </div>
        <div class="card-body chart-wrap">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <div class="row-2col">
      <div class="card">
        <div class="card-header">
          <div class="card-icon" style="background:rgba(236,72,153,0.1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <h3 class="card-title">Trạng thái Công việc</h3>
            <p class="card-desc">Cơ cấu theo trạng thái hiện tại</p>
          </div>
        </div>
        <div class="card-body chart-wrap">
          <canvas id="statusChart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-icon" style="background:rgba(245,158,11,0.1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <h3 class="card-title">Top Người dùng</h3>
            <p class="card-desc">Người dùng có nhiều công việc nhất</p>
          </div>
        </div>
        <div class="card-body">
          <div class="user-rank-list">
            <div class="user-rank-item" v-for="(u, i) in topUsers" :key="i">
              <div class="rank-num" :class="['rank-' + (i+1)]">{{ i + 1 }}</div>
              <div class="rank-avatar">{{ u.name?.charAt(0)?.toUpperCase() }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ u.name }}</div>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: (u.count / maxUserCount * 100) + '%' }"></div>
                </div>
              </div>
              <div class="rank-count">{{ u.count }}</div>
            </div>
            <div v-if="topUsers.length === 0" class="empty-rank">Chưa có dữ liệu</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-icon" style="background:rgba(17,124,117,0.1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M9 11l3-3 3 3"/><path d="M9 17l3-3 3 3"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
        </div>
        <div>
          <h3 class="card-title">Tổng quan Công việc</h3>
          <p class="card-desc">Phân tích chi tiết theo trạng thái</p>
        </div>
      </div>
      <div class="card-body">
        <div class="overview-grid">
          <div class="overview-item" v-for="item in overviewItems" :key="item.label">
            <div class="overview-bar-wrap">
              <div class="overview-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
            </div>
            <div class="overview-label">{{ item.label }}</div>
            <div class="overview-value" :style="{ color: item.color }">{{ item.count }}</div>
            <div class="overview-percent">{{ item.percent }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { adminApi } from '@/api/adminApi'
import { Chart } from 'chart.js/auto'

const authStore = useAuthStore()
const adminName = computed(() => authStore.user?.name || 'Admin')

const stats = ref({})
const topUsers = ref([])
const trendsData = ref({ newUsers: [], newTasks: [], completedTasks: [] })

const exportUrl = adminApi.getExportUrl()
const currentDate = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

let trendsChart, categoryChart, statusChart

const statCards = computed(() => [
  { key: 'users', value: stats.value.total_users || 0, label: 'NGƯỜI DÙNG', bg: 'linear-gradient(135deg, #117c75, #0d9488)', sub: 'Tài khoản hệ thống', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
  { key: 'tasks', value: stats.value.total_tasks || 0, label: 'TỔNG CÔNG VIỆC', bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', sub: 'Tất cả trong hệ thống', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>' },
  { key: 'active', value: stats.value.active_tasks || 0, label: 'ĐANG HOẠT ĐỘNG', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', sub: stats.value.total_tasks > 0 ? Math.round(((stats.value.active_tasks || 0) / stats.value.total_tasks) * 100) + '% tổng số' : '0%', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
  { key: 'completed', value: stats.value.completed_tasks || 0, label: 'HOÀN THÀNH', bg: 'linear-gradient(135deg, #10b981, #059669)', sub: 'Công việc đã xong', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' },
  { key: 'overdue', value: stats.value.overdue_tasks || 0, label: 'QUÁ HẠN', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', sub: 'Cần xử lý ngay', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
])

const overviewItems = computed(() => {
  const total = stats.value.total_tasks || 1
  return [
    { label: 'Chưa thực hiện', count: stats.value.todo_tasks || 0, percent: Math.round(((stats.value.todo_tasks || 0) / total) * 100), color: '#94a3b8' },
    { label: 'Đang thực hiện', count: stats.value.in_progress_tasks || 0, percent: Math.round(((stats.value.in_progress_tasks || 0) / total) * 100), color: '#3b82f6' },
    { label: 'Đã hoàn thành', count: stats.value.completed_tasks || 0, percent: Math.round(((stats.value.completed_tasks || 0) / total) * 100), color: '#10b981' },
    { label: 'Quá hạn', count: stats.value.overdue_tasks || 0, percent: Math.round(((stats.value.overdue_tasks || 0) / total) * 100), color: '#ef4444' },
  ]
})

const maxUserCount = computed(() => Math.max(...(topUsers.value.map(u => u.count) || [1])))

const formatNumber = (n) => (n || 0).toLocaleString('vi-VN')

const fetchData = async () => {
  try {
    const [statsRes, trendsRes] = await Promise.all([adminApi.getStats(), adminApi.getTrends()])
    stats.value = statsRes.data.data
    topUsers.value = statsRes.data.data.by_user || []
    trendsData.value = trendsRes.data.data
    await nextTick()
    renderCharts()
  } catch (e) { console.error(e) }
}

const renderCharts = () => {
  if (trendsChart) trendsChart.destroy()
  if (categoryChart) categoryChart.destroy()
  if (statusChart) statusChart.destroy()

  const trends = trendsData.value
  if (trends.newUsers?.length) {
    const canvas = document.getElementById('trendsChart')
    if (canvas) {
      trendsChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: trends.newUsers.map(d => { const dt = new Date(d.date); return `${dt.getDate()}/${dt.getMonth()+1}` }),
          datasets: [
            { label: 'Người dùng mới', data: trends.newUsers.map(d => d.count), borderColor: '#117c75', backgroundColor: 'rgba(17,124,117,0.1)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 },
            { label: 'Công việc mới', data: trends.newTasks?.map(d => d.count) || [], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 },
            { label: 'Hoàn thành', data: trends.completedTasks?.map(d => d.count) || [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { size: 11 }, padding: 16 } } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
      })
    }
  }

  const cats = stats.value.category_breakdown || []
  if (cats.length) {
    const canvas = document.getElementById('categoryChart')
    if (canvas) {
      categoryChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: cats.slice(0, 8).map(c => c.name),
          datasets: [{ data: cats.slice(0, 8).map(c => c.count), backgroundColor: ['#117c75','#0d9488','#14b8a6','#5eead4','#6366f1','#818cf8','#a78bfa','#c4b5fd'], borderRadius: 8, barPercentage: 0.6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: '#f1f5f9' } }, y: { grid: { display: false } } } }
      })
    }
  }

  const canvas2 = document.getElementById('statusChart')
  if (canvas2) {
    statusChart = new Chart(canvas2, {
      type: 'doughnut',
      data: {
        labels: ['Chưa làm', 'Đang làm', 'Đã xong', 'Quá hạn'],
        datasets: [{ data: [stats.value.todo_tasks||0, stats.value.in_progress_tasks||0, stats.value.completed_tasks||0, stats.value.overdue_tasks||0], backgroundColor: ['#94a3b8','#3b82f6','#10b981','#ef4444'], borderWidth: 0, hoverOffset: 6, spacing: 3 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11, weight: '500' } } } } }
    })
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page-content { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.hero-banner {
  background: linear-gradient(135deg, #117c75 0%, #0d9488 50%, #0f766e 100%);
  border-radius: 18px; padding: 28px 32px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 8px 32px rgba(17,124,117,0.25);
}
.hero-greeting { font-size: 1.4rem; font-weight: 800; color: #fff; margin: 0; }
.hero-date { font-size: 0.82rem; color: rgba(255,255,255,0.7); margin: 4px 0 0; }
.hero-sub { font-size: 0.78rem; color: rgba(255,255,255,0.5); margin: 2px 0 0; }
.hero-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
  border-radius: 10px; color: #fff; font-weight: 600; font-size: 0.85rem; text-decoration: none;
  transition: all 0.2s;
}
.hero-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

.stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.stat-card {
  display: flex; align-items: center; gap: 14px;
  padding: 20px; background: #fff; border-radius: 14px;
  border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-value { font-size: 1.7rem; font-weight: 800; color: #0f172a; line-height: 1.1; }
.stat-label { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }
.stat-sub { font-size: 0.68rem; color: #94a3b8; margin-top: 1px; }

.row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;
}
.card-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px 0; }
.card-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
.card-desc { font-size: 0.75rem; color: #94a3b8; margin: 2px 0 0; }
.card-body { padding: 16px 24px 24px; }
.chart-wrap { height: 280px; display: flex; align-items: center; justify-content: center; }

.user-rank-list { display: flex; flex-direction: column; gap: 10px; }
.user-rank-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.rank-num {
  width: 24px; height: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); }
.rank-3 { background: linear-gradient(135deg, #cd7f32, #a0522d); }
.rank-n { background: #e2e8f0; color: #64748b; }
.rank-avatar {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, #117c75, #0d9488);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
}
.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 0.82rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rank-bar-wrap { height: 4px; background: #f1f5f9; border-radius: 999px; margin-top: 4px; overflow: hidden; }
.rank-bar { height: 100%; background: linear-gradient(90deg, #117c75, #0d9488); border-radius: 999px; transition: width 0.4s; }
.rank-count { font-size: 0.85rem; font-weight: 800; color: #117c75; flex-shrink: 0; }
.empty-rank { text-align: center; color: #94a3b8; padding: 24px; font-size: 0.85rem; }

.overview-grid { display: flex; flex-direction: column; gap: 14px; }
.overview-item { display: grid; grid-template-columns: 1fr 140px 60px 50px; align-items: center; gap: 12px; }
.overview-bar-wrap { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.overview-bar { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.overview-label { font-size: 0.82rem; font-weight: 600; color: #334155; }
.overview-value { font-size: 1.1rem; font-weight: 800; text-align: right; }
.overview-percent { font-size: 0.78rem; color: #94a3b8; text-align: right; font-weight: 600; }

@media (max-width: 1400px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 1100px) { .row-2col { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .hero-banner { flex-direction: column; gap: 14px; text-align: center; padding: 20px 16px; border-radius: 14px; }
  .hero-greeting { font-size: 1.15rem; }
  .stat-card { padding: 14px; gap: 10px; }
  .stat-icon { width: 40px; height: 40px; border-radius: 10px; }
  .stat-value { font-size: 1.3rem; }
  .stat-label { font-size: 0.6rem; }
  .card-header { padding: 16px 16px 0; }
  .card-body { padding: 12px 16px 16px; }
  .chart-wrap { height: 220px; }
  .overview-item { grid-template-columns: 1fr 80px 50px; }
  .overview-percent { display: none; }
  .user-rank-item { gap: 8px; }
}
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }
</style>
