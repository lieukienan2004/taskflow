<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div class="header-left">
        <div class="header-badge">Dashboard</div>
        <h1 class="page-title">Tổng quan</h1>
        <p class="page-subtitle">{{ formattedDate }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-refresh" @click="refreshData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Làm mới
        </button>
        <button class="btn-ai" @click="analyzeWithAI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          AI Phân tích
        </button>
      </div>
    </div>

    <div class="invitations-banner" v-if="store.invitations.length > 0">
      <div class="invitations-banner-header">
        <div class="invite-banner-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h3>Bạn có lời mời tham gia Nhóm học tập mới!</h3>
        </div>
      </div>
      <div class="invitations-list">
        <div v-for="invite in store.invitations" :key="invite.project_id" class="invite-item-banner">
          <div class="invite-details">
            <span class="invite-proj-name">{{ invite.project_name }}</span>
            <span class="invite-proj-owner">Người mời: <b>{{ invite.owner_name }}</b> ({{ invite.owner_email }})</span>
          </div>
          <div class="invite-actions">
            <button class="accept-btn" @click="handleAcceptInvite(invite.project_id)">Đồng ý</button>
            <button class="decline-btn" @click="handleDeclineInvite(invite.project_id)">Từ chối</button>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-stats-grid">
      <div class="stat-card" @click="goToTasks('todo')">
        <div class="s-card-inner">
          <div class="s-icon-box todo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="s-info">
            <span class="s-val">{{ store.taskCounts.todo || 0 }}</span>
            <span class="s-lbl">Cần làm</span>
          </div>
          <svg class="s-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="stat-card" @click="goToTasks('in_progress')">
        <div class="s-card-inner">
          <div class="s-icon-box progress">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div class="s-info">
            <span class="s-val">{{ store.taskCounts.in_progress || 0 }}</span>
            <span class="s-lbl">Đang làm</span>
          </div>
          <svg class="s-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="stat-card" @click="goToTasks('done')">
        <div class="s-card-inner">
          <div class="s-icon-box done">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="s-info">
            <span class="s-val">{{ store.taskCounts.done || 0 }}</span>
            <span class="s-lbl">Đã xong</span>
          </div>
          <svg class="s-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="stat-card" @click="goToTasks('overdue')" v-if="store.taskCounts.overdue > 0">
        <div class="s-card-inner">
          <div class="s-icon-box overdue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="s-info">
            <span class="s-val">{{ store.taskCounts.overdue || 0 }}</span>
            <span class="s-lbl">Quá hạn</span>
          </div>
          <svg class="s-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>

    <div class="dashboard-charts">
      <div class="chart-card status-card">
        <div class="chart-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>
          <h3>Phân bổ trạng thái</h3>
        </div>
        <div class="status-bars">
          <div class="sbar">
            <div class="sbar-info">
              <span class="sbar-dot todo"></span>
              <span class="sbar-label">Cần làm</span>
              <span class="sbar-count">{{ store.taskCounts.todo || 0 }}</span>
            </div>
            <div class="sbar-track">
              <div class="sbar-fill todo" :style="{ width: statusPercent('todo') }"></div>
            </div>
          </div>
          <div class="sbar">
            <div class="sbar-info">
              <span class="sbar-dot progress"></span>
              <span class="sbar-label">Đang làm</span>
              <span class="sbar-count">{{ store.taskCounts.in_progress || 0 }}</span>
            </div>
            <div class="sbar-track">
              <div class="sbar-fill progress" :style="{ width: statusPercent('in_progress') }"></div>
            </div>
          </div>
          <div class="sbar">
            <div class="sbar-info">
              <span class="sbar-dot done"></span>
              <span class="sbar-label">Đã xong</span>
              <span class="sbar-count">{{ store.taskCounts.done || 0 }}</span>
            </div>
            <div class="sbar-track">
              <div class="sbar-fill done" :style="{ width: statusPercent('done') }"></div>
            </div>
          </div>
          <div class="sbar" v-if="store.taskCounts.overdue > 0">
            <div class="sbar-info">
              <span class="sbar-dot overdue"></span>
              <span class="sbar-label">Quá hạn</span>
              <span class="sbar-count">{{ store.taskCounts.overdue || 0 }}</span>
            </div>
            <div class="sbar-track">
              <div class="sbar-fill overdue" :style="{ width: statusPercent('overdue') }"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <h3>Công việc theo danh mục</h3>
        </div>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- ANALYTICS: Trend Chart + Procrastination Analyzer -->
    <div class="analytics-section">
      <div class="analytics-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <h2>Phân Tích Hiệu Suất</h2>
      </div>
      <div class="analytics-grid">
        <!-- Trend Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <h3>Xu hướng 7 ngày qua</h3>
          </div>
          <div class="chart-container">
            <canvas ref="trendChartRef"></canvas>
          </div>
        </div>
        <!-- Procrastination Analyzer -->
        <div class="chart-card procrastination-card">
          <div class="chart-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3>Phân Tích Trì Hoãn</h3>
          </div>
          <div class="procrastination-body">
            <div class="gauge-wrapper">
              <div class="gauge-ring" :style="procrastinationGaugeStyle">
                <span class="gauge-number">{{ procrastinationIndex }}%</span>
              </div>
              <span class="gauge-label">Chỉ số Trì hoãn</span>
            </div>
            <div class="risk-badge" :class="'risk-' + procrastinationRiskLevel">
              {{ procrastinationRiskText }}
            </div>
            <p class="risk-advice">{{ procrastinationAdvice }}</p>
            <!-- Peak Hours -->
            <div class="peak-hours-section">
              <h4>Khung Giờ Vàng</h4>
              <div class="peak-hour-display">
                <span class="peak-emoji">{{ peakHourEmoji }}</span>
                <span class="peak-name">{{ peakHourName }}</span>
              </div>
              <p class="peak-advice">{{ peakHourAdvice }}</p>
              <div class="hourly-bars">
                <div v-for="g in hourlyGroups" :key="g.name" class="hourly-bar-row">
                  <span class="hour-group-name">{{ g.name }}</span>
                  <div class="hourly-bar-track">
                    <div class="hourly-bar-fill" :style="{ width: g.percent + '%' }"></div>
                  </div>
                  <span class="hour-group-count">{{ g.count }}</span>
                </div>
              </div>
            </div>
            <!-- Postponed Tasks -->
            <div class="postponed-section" v-if="postponedTasks.length > 0">
              <h4>Việc bị dời hạn nhiều nhất</h4>
              <div v-for="t in postponedTasks" :key="t.id" class="postponed-task-item">
                <span class="postponed-title">{{ t.title }}</span>
                <span class="postponed-count">{{ t.postpone_count }} lần</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-widgets">
      <div class="widget-card">
        <div class="widget-top">
          <div class="widget-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3>Sắp đến hạn</h3>
          </div>
          <span class="widget-badge" v-if="store.dueSoon.length">{{ store.dueSoon.length }}</span>
        </div>
        <div class="due-list" v-if="store.dueSoon.length > 0">
          <div v-for="task in store.dueSoon.slice(0,5)" :key="task.id" class="due-item">
            <div class="dprio" :class="task.priority">
              <span class="dprio-inner"></span>
            </div>
            <div class="due-info">
              <span class="due-title">{{ task.title }}</span>
              <span class="due-meta">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatDate(task.due_date) }}
              </span>
            </div>
            <span class="dprio-tag" :class="task.priority">{{ task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung' : 'Thấp' }}</span>
          </div>
        </div>
        <div v-else class="widget-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <p>Không có task sắp hạn</p>
        </div>
      </div>

      <div class="widget-card">
        <div class="widget-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <h3>Hiệu suất hôm nay</h3>
        </div>
        <div class="perf-body">
          <div class="perf-ring-wrap">
            <svg viewBox="0 0 100 100" class="perf-ring">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="8"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#perfGrad)" stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="`${todayPercent * 2.51} 251`"
                transform="rotate(-90 50 50)"
                style="transition: stroke-dasharray 1s ease"/>
              <defs>
                <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#34d399"/>
                  <stop offset="100%" stop-color="#10b981"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="perf-ring-center">
              <span class="perf-pct">{{ todayPercent }}%</span>
              <span class="perf-lbl">hoàn thành</span>
            </div>
          </div>
          <div class="perf-stats">
            <div class="perf-stat-item">
              <span class="perf-stat-val">{{ store.taskCounts.done }}</span>
              <span class="perf-stat-lbl">Đã xong</span>
            </div>
            <div class="perf-stat-divider"></div>
            <div class="perf-stat-item">
              <span class="perf-stat-val">{{ store.tasks.length }}</span>
              <span class="perf-stat-lbl">Tổng số</span>
            </div>
          </div>
        </div>
      </div>

      <div class="widget-card" @click="router.push('/semester-plan')" style="cursor:pointer">
        <div class="widget-top">
          <div class="widget-header" style="margin-bottom:0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3>OKRs - Kế hoạch</h3>
          </div>
          <span class="widget-badge">{{ okrPlans.length }}</span>
        </div>
        <div class="okr-widget-body" v-if="okrPlans.length > 0">
          <div v-for="plan in okrPlans.slice(0, 2)" :key="plan.id" class="okr-widget-plan">
            <div class="okr-widget-name">{{ plan.name }}</div>
            <div class="okr-widget-total">
              <span>{{ okrProgress(plan).achieved }}/{{ okrProgress(plan).total }} mục tiêu đạt</span>
              <span class="okr-pct">{{ okrProgress(plan).percent }}%</span>
            </div>
            <div class="okr-widget-track">
              <div class="okr-widget-fill" :style="{ width: okrProgress(plan).percent + '%' }"></div>
            </div>
          </div>
        </div>
        <div v-else class="widget-empty" style="padding:12px 0">
          <p>Chưa có kế hoạch. Nhấp để tạo!</p>
        </div>
      </div>

      <div class="widget-card">
        <div class="widget-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <h3>Thống kê nhanh</h3>
        </div>
        <div class="qstats-grid">
          <div class="qstat-box doing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            <div class="qstat-info">
              <span class="qstat-val">{{ store.taskCounts.in_progress }}</span>
              <span class="qstat-lbl">Đang làm</span>
            </div>
          </div>
          <div class="qstat-box overdue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div class="qstat-info">
              <span class="qstat-val">{{ store.taskCounts.overdue }}</span>
              <span class="qstat-lbl">Quá hạn</span>
            </div>
          </div>
          <div class="qstat-box done">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <div class="qstat-info">
              <span class="qstat-val">{{ store.taskCounts.done }}</span>
              <span class="qstat-lbl">Hoàn thành</span>
            </div>
          </div>
          <div class="qstat-box total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
            <div class="qstat-info">
              <span class="qstat-val">{{ store.tasks.length }}</span>
              <span class="qstat-lbl">Tổng</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ECOSYSTEM HUB -->
    <div class="eco-hub">
      <div class="eco-hub-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <h2>Hệ Sinh Thái Liên Kết</h2>
      </div>

      <div class="eco-hub-grid">
        <!-- Notes Card -->
        <div class="eco-card" @click="router.push('/notes')">
          <div class="eco-card-icon" style="background: linear-gradient(135deg, #ca8a04, #a16207)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div class="eco-card-body">
            <span class="eco-card-title">Ghi chú</span>
            <span class="eco-card-stat">Hoàn thành {{ store.taskCounts.done }}/{{ store.taskCounts.all }} · {{ store.taskCounts.overdue }} trễ hạn</span>
          </div>
          <div class="eco-card-progress">
            <div class="eco-card-bar" :style="{ width: ecoCompletionPct + '%', background: '#ca8a04' }"></div>
          </div>
        </div>

        <!-- Calendar Card -->
        <div class="eco-card" @click="router.push('/calendar')">
          <div class="eco-card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="eco-card-body">
            <span class="eco-card-title">Lịch</span>
            <span class="eco-card-stat">{{ ecoTasksDueToday }} nhiệm vụ hôm nay</span>
          </div>
          <div class="eco-card-progress">
            <div class="eco-card-bar" :style="{ width: Math.min(100, ecoTasksDueToday * 20) + '%', background: '#f59e0b' }"></div>
          </div>
        </div>

        <!-- Time Tracking Card -->
        <div class="eco-card" @click="router.push('/tasks')">
          <div class="eco-card-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="eco-card-body">
            <span class="eco-card-title">Thời gian</span>
            <span class="eco-card-stat">{{ formatMinutes(timeStats.today_minutes) }} hôm nay</span>
          </div>
          <div class="eco-card-progress">
            <div class="eco-card-bar" :style="{ width: Math.min(100, timeStats.today_minutes / 8) + '%', background: '#8b5cf6' }"></div>
          </div>
        </div>
      </div>

      <!-- Smart Insight -->
      <div v-if="ecoInsight" class="eco-insight">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>{{ ecoInsight }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { semesterPlanApi, habitApi, timeLogApi } from '@/api/taskApi'
import Chart from 'chart.js/auto'

const store = useTaskStore()
const router = useRouter()
const okrPlans = ref([])
let categoryChartInstance = null
let trendChartInstance = null
const trendChartRef = ref(null)
const timeStats = ref({ total_minutes: 0, today_minutes: 0, week_minutes: 0, total_sessions: 0 })

const goToTasks = (status) => {
  store.filters.status = status
  router.push('/tasks')
}

onMounted(async () => {
  if (store.tasks.length === 0) {
    await store.fetchTasks()
  }
  await store.fetchInvitations()
  try {
    const res = await semesterPlanApi.getAll()
    okrPlans.value = res.data.data
  } catch (e) { /* ignore */ }
  // Load ecosystem data
  loadEcoHabits()
  loadTimeStats()
  renderCharts()
})

// --- Ecosystem Data ---
async function loadEcoHabits() {
  // Habit data removed from Dashboard - habits now managed separately
}

async function loadTimeStats() {
  try {
    const res = await timeLogApi.getStats()
    timeStats.value = res.data.data || { total_minutes: 0, today_minutes: 0, week_minutes: 0, total_sessions: 0 }
  } catch {
    timeStats.value = { total_minutes: 0, today_minutes: 0, week_minutes: 0, total_sessions: 0 }
  }
}

function formatMinutes(min) {
  if (!min || min === 0) return '0 phút'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0 && m > 0) return `${h}h ${m}p`
  if (h > 0) return `${h} giờ`
  return `${m} phút`
}

const ecoCompletionPct = computed(() => {
  const total = store.taskCounts.all
  if (!total) return 0
  return Math.round((store.taskCounts.done / total) * 100)
})

const ecoTasksDueToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.tasks.filter(t => t.due_date && t.due_date.startsWith(today) && t.status !== 'done').length
})

const ecoInsight = computed(() => {
  const taskPct = ecoCompletionPct.value
  if (taskPct >= 75) return '🌟 Tuyệt vời! Tỷ lệ hoàn thành nhiệm vụ cao (' + taskPct + '%). Giữ vững phong độ!'
  if (taskPct < 40) return '⚠️ Tỷ lệ hoàn thành thấp (' + taskPct + '%). Hãy ưu tiên các nhiệm vụ quan trọng.'
  if (store.taskCounts.overdue > 0) return '⚠️ Bạn có ' + store.taskCounts.overdue + ' nhiệm vụ trễ hạn. Hãy ưu tiên xử lý ngay!'
  return '📊 Tỷ lệ hoàn thành: ' + taskPct + '%'
})

watch(() => store.tasks, () => {
  renderCharts()
}, { deep: true })

const statusPercent = (status) => {
  const total = store.tasks.length
  if (!total) return '0%'
  let count = 0
  if (status === 'todo') count = store.taskCounts.todo || 0
  else if (status === 'in_progress') count = store.taskCounts.in_progress || 0
  else if (status === 'done') count = store.taskCounts.done || 0
  else if (status === 'overdue') count = store.taskCounts.overdue || 0
  return Math.round((count / total) * 100) + '%'
}

const todayPercent = computed(() => {
  const total = store.taskCounts.todo + store.taskCounts.in_progress + store.taskCounts.done
  if (!total) return 0
  return Math.round((store.taskCounts.done / total) * 100)
})

const okrProgress = (plan) => {
  const objs = plan.objectives || []
  const total = objs.length
  const achieved = objs.filter(o => o.status === 'achieved').length
  return { total, achieved, percent: total ? Math.round((achieved / total) * 100) : 0 }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

const renderCharts = async () => {
  if (categoryChartInstance) categoryChartInstance.destroy()

  const categoryCtx = document.getElementById('categoryChart')
  if (categoryCtx) {
    const categories = {}
    store.tasks.forEach(t => {
      categories[t.category || 'Khác'] = (categories[t.category || 'Khác'] || 0) + 1
    })

    categoryChartInstance = new Chart(categoryCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Số lượng',
          data: Object.values(categories),
          backgroundColor: ['#117c75', '#14b8a6', '#2dd4bf', '#2dd4bf', '#f4ab19', '#117c75'],
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#f1f5f9', drawBorder: false } },
          x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } }
        }
      }
    })
  }

  // Render trend chart
  await nextTick()
  if (trendChartInstance) trendChartInstance.destroy()
  if (trendChartRef.value) {
    const labels = []
    const createdData = []
    const completedData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`)
      createdData.push(store.tasks.filter(t => {
        const cd = new Date(t.created_at).toISOString().split('T')[0]
        return cd === dayStr
      }).length)
      completedData.push(store.tasks.filter(t => {
        if (t.status !== 'done') return false
        const ud = new Date(t.updated_at || t.created_at).toISOString().split('T')[0]
        return ud === dayStr
      }).length)
    }
    trendChartInstance = new Chart(trendChartRef.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Tạo mới',
            data: createdData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Hoàn thành',
            data: completedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', stepSize: 1 } }
        }
      }
    })
  }
}

const refreshData = async () => {
  await store.fetchTasks()
  await store.fetchInvitations()
  try {
    const res = await semesterPlanApi.getAll()
    okrPlans.value = res.data.data
  } catch (e) { /* ignore */ }
  loadEcoHabits()
  loadTimeStats()
}

const handleAcceptInvite = async (projectId) => {
  try {
    await store.acceptInvitation(projectId)
  } catch (err) {
    console.error(err)
  }
}

const handleDeclineInvite = async (projectId) => {
  if (confirm('Bạn có chắc muốn từ chối lời mời này không?')) {
    try {
      await store.declineInvitation(projectId)
    } catch (err) {
      console.error(err)
    }
  }
}

const analyzeWithAI = () => {
  if (window.triggerAIAnalysis) {
    window.triggerAIAnalysis()
  } else {
    store.showToast('Cố vấn AI đang bận, vui lòng thử lại sau!', 'warning')
  }
}

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

// --- Procrastination Analyzer ---
const procrastinationIndex = computed(() => {
  const list = store.tasks
  if (list.length === 0) return 0
  let postponeSum = 0
  list.forEach(t => { postponeSum += t.postpone_count || 0 })
  const overdueCount = store.taskCounts.overdue || 0
  const score = Math.round((postponeSum / list.length) * 35 + overdueCount * 15)
  return Math.min(100, Math.max(0, score))
})

const procrastinationRiskLevel = computed(() => {
  const i = procrastinationIndex.value
  if (i < 30) return 'low'
  if (i < 60) return 'moderate'
  return 'high'
})

const procrastinationRiskText = computed(() => {
  const l = procrastinationRiskLevel.value
  if (l === 'low') return 'Nguy cơ Trì hoãn Thấp'
  if (l === 'moderate') return 'Nguy cơ Trì hoãn Trung Bình'
  return 'Cảnh Báo Trì Hoãn Cao'
})

const procrastinationAdvice = computed(() => {
  const l = procrastinationRiskLevel.value
  if (l === 'low') return 'Bạn đang kiểm soát thời gian rất tốt! Hãy duy trì phong độ.'
  if (l === 'moderate') return 'Hãy sử dụng Pomodoro và bẻ nhỏ các nhiệm vụ lớn để tránh trì hoãn.'
  return 'Hãy ưu tiên xử lý các việc trễ hạn ngay. Sử dụng AI Phân Rã để bẻ nhỏ công việc!'
})

const procrastinationGaugeStyle = computed(() => {
  const i = procrastinationIndex.value
  let color = '#10b981'
  if (i >= 30 && i < 60) color = '#f59e0b'
  if (i >= 60) color = '#ef4444'
  return { background: `conic-gradient(${color} ${i * 3.6}deg, #f1f5f9 ${i * 3.6}deg)` }
})

const hourlyGroups = computed(() => {
  const completed = store.tasks.filter(t => t.status === 'done')
  const groups = [
    { name: 'Sáng', count: 0, hours: [5,6,7,8,9,10] },
    { name: 'Chiều', count: 0, hours: [11,12,13,14,15,16] },
    { name: 'Tối', count: 0, hours: [17,18,19,20,21,22] },
    { name: 'Đêm', count: 0, hours: [23,0,1,2,3,4] }
  ]
  completed.forEach(t => {
    const hour = new Date(t.updated_at || t.created_at).getHours()
    const gp = groups.find(g => g.hours.includes(hour))
    if (gp) gp.count++
  })
  const maxCount = Math.max(...groups.map(g => g.count))
  return groups.map(g => ({
    name: g.name,
    count: g.count,
    percent: maxCount > 0 ? Math.round((g.count / maxCount) * 100) : 0
  }))
})

const peakHourName = computed(() => {
  let max = -1, name = 'Chưa có dữ liệu'
  hourlyGroups.value.forEach(g => { if (g.count > max && g.count > 0) { max = g.count; name = g.name } })
  return name
})

const peakHourEmoji = computed(() => {
  const pk = peakHourName.value
  if (pk.includes('Sáng')) return '🌅'
  if (pk.includes('Chiều')) return '☀️'
  if (pk.includes('Tối')) return '🌃'
  if (pk.includes('Đêm')) return '🦉'
  return '⏰'
})

const peakHourAdvice = computed(() => {
  const pk = peakHourName.value
  if (pk.includes('Sáng')) return 'Bạn hoạt động hiệu quả nhất vào buổi sáng. Hãy giải quyết việc khó trước 11h!'
  if (pk.includes('Chiều')) return 'Khung giờ chiều là thời gian vàng của bạn. Dành cho việc code và viết báo cáo.'
  if (pk.includes('Tối')) return 'Bộ não sáng tạo nhất vào buổi tối. Thích hợp để thiết kế và vẽ mindmap.'
  if (pk.includes('Đêm')) return 'Bạn là cú đêm nỗ lực! Nhưng hãy chú ý giữ gìn sức khỏe.'
  return 'Hoàn thành thêm nhiệm vụ để hệ thống phân tích nhịp sinh học.'
})

const postponedTasks = computed(() => {
  return store.tasks
    .filter(t => (t.postpone_count || 0) > 0)
    .sort((a, b) => b.postpone_count - a.postpone_count)
    .slice(0, 3)
})
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.3s ease both;
  padding-bottom: 30px;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.header-left { display: flex; flex-direction: column; gap: 4px; }

.header-badge {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #117c75;
  background: rgba(17,124,117,0.08);
  padding: 3px 10px;
  border-radius: 20px;
  width: fit-content;
  margin-bottom: 2px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 500;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-refresh, .btn-ai {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
}
.btn-refresh:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.btn-ai {
  background: linear-gradient(135deg, #117c75, #14b8a6);
  border: none;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(17,124,117,0.2);
}
.btn-ai:hover {
  box-shadow: 0 4px 16px rgba(17,124,117,0.3);
  transform: translateY(-1px);
}

/* Invitations */
.invitations-banner {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 14px;
}

.invitations-banner-header { margin-bottom: 14px; }
.invite-banner-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.invite-banner-left h3 {
  font-size: 0.95rem;
  color: #b45309;
  font-weight: 600;
  margin: 0;
}

.invitations-list { display: flex; flex-direction: column; gap: 10px; }

.invite-item-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #fde68a;
  padding: 12px 16px;
  border-radius: 10px;
  gap: 16px;
  flex-wrap: wrap;
}

.invite-details { display: flex; flex-direction: column; gap: 2px; }
.invite-proj-name { font-size: 0.88rem; font-weight: 600; color: #0f172a; }
.invite-proj-owner { font-size: 0.75rem; color: #64748b; }

.invite-actions { display: flex; gap: 8px; }

.accept-btn {
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  background: #059669;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.accept-btn:hover { background: #047857; }

.decline-btn {
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}
.decline-btn:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* Stats Grid */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.stat-card {
  cursor: pointer;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: #e2e8f0;
  box-shadow: 0 8px 28px rgba(0,0,0,0.06);
}
.stat-card:nth-child(1):hover { background: linear-gradient(135deg, #9080b0, #a898c8); border-color: #8070a0; box-shadow: 0 8px 28px rgba(17,124,117,0.1); }
.stat-card:nth-child(2):hover { background: linear-gradient(135deg, #9080b0, #a898c8); border-color: #8070a0; box-shadow: 0 8px 28px rgba(17,124,117,0.1); }
.stat-card:nth-child(3):hover { background: linear-gradient(135deg, #7098a8, #88b0c0); border-color: #608898; box-shadow: 0 8px 28px rgba(13,148,136,0.1); }
.stat-card:nth-child(4):hover { background: linear-gradient(135deg, #b88888, #c8a0a0); border-color: #a87070; box-shadow: 0 8px 28px rgba(239,68,68,0.1); }

.s-card-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
}

.s-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.s-icon-box.todo { background: #f1f5f9; color: #64748b; }
.s-icon-box.progress { background: #fffbeb; color: #f59e0b; }
.s-icon-box.done { background: #f0fdf4; color: #10b981; }
.s-icon-box.overdue { background: #fef2f2; color: #ef4444; }

.stat-card:hover .s-icon-box.todo,
.stat-card:hover .s-icon-box.progress,
.stat-card:hover .s-icon-box.done,
.stat-card:hover .s-icon-box.overdue { background: rgba(255,255,255,0.15); color: #ffffff; box-shadow: none; }

.s-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.s-val { font-size: 1.8rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; }
.s-lbl { font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

.stat-card:hover .s-val { color: #ffffff; }
.stat-card:hover .s-lbl { color: rgba(255,255,255,0.65); }

.s-arrow {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  color: #cbd5e1;
}
.stat-card:hover .s-arrow {
  opacity: 1;
  transform: translateX(3px);
  color: rgba(255,255,255,0.5);
}

/* Charts */
.dashboard-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 360px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: box-shadow 0.25s ease;
}
.chart-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.chart-card.status-card { height: auto; min-height: auto; }

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.chart-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.chart-container {
  flex-grow: 1;
  position: relative;
  min-height: 0;
}

/* Status bars */
.status-bars { display: flex; flex-direction: column; gap: 16px; }
.sbar { display: flex; flex-direction: column; gap: 6px; }
.sbar-info { display: flex; align-items: center; gap: 8px; }
.sbar-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sbar-dot.todo { background: #94a3b8; }
.sbar-dot.progress { background: #f59e0b; }
.sbar-dot.done { background: #10b981; }
.sbar-dot.overdue { background: #ef4444; }
.sbar-label { font-size: 0.82rem; font-weight: 500; color: #334155; flex: 1; }
.sbar-count { font-size: 0.82rem; font-weight: 700; color: #0f172a; }
.sbar-track { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.sbar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.sbar-fill.todo { background: #94a3b8; }
.sbar-fill.progress { background: #f59e0b; }
.sbar-fill.done { background: #10b981; }
.sbar-fill.overdue { background: #ef4444; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Widgets Row */
.dashboard-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.widget-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: all 0.25s ease;
}
.widget-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-1px); }

.widget-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

.widget-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.widget-top .widget-header { margin-bottom: 0; }
.widget-header h3 { font-size: 0.88rem; font-weight: 600; color: #0f172a; margin: 0; }

.widget-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: #117c75;
  color: #ffffff;
  padding: 1px 8px;
  border-radius: 8px;
  line-height: 1.6;
}

/* Due list */
.due-list { display: flex; flex-direction: column; gap: 8px; }
.due-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s ease;
}
.due-item:hover { background: #f8fafc; }

.dprio {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dprio.high { background: #fef2f2; }
.dprio.medium { background: #fffbeb; }
.dprio.low { background: #f8fafc; }
.dprio-inner {
  width: 5px; height: 5px;
  border-radius: 50%;
}
.dprio.high .dprio-inner { background: #ef4444; box-shadow: 0 0 4px rgba(239,68,68,0.3); }
.dprio.medium .dprio-inner { background: #f59e0b; box-shadow: 0 0 4px rgba(245,158,11,0.3); }
.dprio.low .dprio-inner { background: #94a3b8; }

.due-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.due-title { font-size: 0.8rem; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.due-meta { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #94a3b8; font-weight: 500; }

.dprio-tag {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}
.dprio-tag.high { background: #fef2f2; color: #dc2626; }
.dprio-tag.medium { background: #fffbeb; color: #d97706; }
.dprio-tag.low { background: #f1f5f9; color: #64748b; }

.widget-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
}
.widget-empty p { font-size: 0.8rem; color: #94a3b8; margin: 0; }

/* Performance ring */
.perf-body { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.perf-ring-wrap { position: relative; width: 120px; height: 120px; }
.perf-ring { width: 100%; height: 100%; }
.perf-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.perf-pct { font-size: 1.8rem; font-weight: 800; color: #10b981; letter-spacing: -0.03em; line-height: 1; }
.perf-lbl { font-size: 0.65rem; color: #94a3b8; font-weight: 500; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

.perf-stats { display: flex; align-items: center; gap: 20px; }
.perf-stat-item { text-align: center; }
.perf-stat-val { display: block; font-size: 1.2rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
.perf-stat-lbl { display: block; font-size: 0.6rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
.perf-stat-divider { width: 1px; height: 28px; background: #f1f5f9; }

/* Quick stats grid */
.qstats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.qstat-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
}
.qstat-box.doing { background: #fffbeb; color: #f59e0b; }
.qstat-box.overdue { background: #fef2f2; color: #ef4444; }
.qstat-box.done { background: #f0fdf4; color: #10b981; }
.qstat-box.total { background: #e6f7f5; color: #117c75; }

.qstat-info { display: flex; flex-direction: column; gap: 1px; }
.qstat-val { font-size: 1.1rem; font-weight: 700; line-height: 1.2; }
.qstat-lbl { font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.7; }

/* OKR widget */
.okr-widget-body { display: flex; flex-direction: column; gap: 12px; }
.okr-widget-plan { }
.okr-widget-name { font-size: 0.8rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.okr-widget-total { display: flex; justify-content: space-between; font-size: 0.7rem; color: #64748b; margin-bottom: 6px; }
.okr-pct { font-weight: 700; color: #117c75; }
.okr-widget-track { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.okr-widget-fill { height: 100%; background: linear-gradient(90deg, #117c75, #14b8a6); border-radius: 3px; transition: width 0.6s ease; }

/* ECOSYSTEM HUB */
.eco-hub {
  margin-top: 2rem;
}

.eco-hub-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.eco-hub-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.eco-hub-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.eco-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
}

.eco-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: #99f6e4;
}

.eco-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.eco-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.eco-card-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
}

.eco-card-stat {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}

.eco-card-progress {
  height: 4px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.eco-card-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
}

.eco-insight {
  margin-top: 1rem;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #92400e;
}

@media (max-width: 1024px) {
  .eco-hub-grid { grid-template-columns: repeat(2, 1fr); }
  .analytics-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dashboard-page { padding: 0; }
  .page-header { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; }
  .page-title { font-size: 1.2rem; }
  .header-actions { display: flex; gap: 8px; }
  .header-actions .btn { flex: 1; min-height: 44px; }
  .dashboard-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }
  .s-card-inner { padding: 12px; gap: 10px; }
  .s-icon { width: 36px; height: 36px; border-radius: 10px; }
  .s-val { font-size: 1.25rem; }
  .s-lbl { font-size: 0.75rem; }
  .dashboard-charts { grid-template-columns: 1fr; gap: 16px; padding: 0 16px; }
  .chart-card { height: 240px; }
  .dashboard-widgets { grid-template-columns: 1fr; gap: 16px; padding: 0 16px; }
  .analytics-grid { grid-template-columns: 1fr; gap: 16px; }
  .analytics-grid .chart-card { min-height: 240px; }
  .eco-hub-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .eco-card { padding: 12px; }
  .eco-card-stat { font-size: 0.72rem; }
  .dprio-tag { font-size: 0.7rem; }
  .due-meta { font-size: 0.72rem; }
  .widget-badge { font-size: 0.72rem; }
}

/* Analytics Section */
.analytics-section {
  margin-bottom: 28px;
}

.analytics-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.analytics-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.analytics-grid .chart-card {
  height: auto;
  min-height: 320px;
}

.procrastination-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 10px;
}

.gauge-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.gauge-ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gauge-ring::after {
  content: '';
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  position: absolute;
}

.gauge-number {
  position: relative;
  z-index: 1;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
}

.gauge-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.risk-badge {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

.risk-low { background: #ecfdf5; color: #059669; }
.risk-moderate { background: #fffbeb; color: #d97706; }
.risk-high { background: #fef2f2; color: #dc2626; }

.risk-advice {
  font-size: 0.73rem;
  color: #64748b;
  text-align: center;
  margin: 0;
  padding: 0 12px;
  line-height: 1.4;
}

.peak-hours-section {
  width: 100%;
  margin-top: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.peak-hours-section h4 {
  font-size: 0.76rem;
  font-weight: 700;
  color: #475569;
  margin: 0 0 8px 0;
}

.peak-hour-display {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.peak-emoji { font-size: 1.1rem; }

.peak-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
}

.peak-advice {
  font-size: 0.7rem;
  color: #64748b;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.hourly-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hourly-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hour-group-name {
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  width: 40px;
  flex-shrink: 0;
}

.hourly-bar-track {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.hourly-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #117c75, #14b8a6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.hour-group-count {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  width: 20px;
  text-align: right;
  flex-shrink: 0;
}

.postponed-section {
  width: 100%;
  margin-top: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 10px;
}

.postponed-section h4 {
  font-size: 0.76rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 8px 0;
}

.postponed-task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.postponed-task-item:last-child { border-bottom: none; }

.postponed-title {
  font-size: 0.73rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.postponed-count {
  font-size: 0.68rem;
  font-weight: 700;
  color: #ef4444;
  white-space: nowrap;
}
</style>