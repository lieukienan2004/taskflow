<template>
  <nav class="navbar" :class="{ open: isOpen, collapsed: isCollapsed }">
    <div class="nav-logo">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
        <defs><linearGradient id="navGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
        <rect width="32" height="32" rx="8" fill="url(#navGrad)"/>
        <path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="logo-text">TaskFlow</span>
    </div>

    <div class="user-section" v-if="authStore.user">
      <div class="user-info-top-wrapper">
        <router-link to="/profile" class="user-info-top">
          <div class="user-avatar">
            <img v-if="authStore.user.avatar" :src="`${getHost() || 'http://localhost:3001'}${authStore.user.avatar}`" class="avatar-img" alt="avatar" />
            <span v-else>{{ authStore.user.name?.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">{{ authStore.user.name }}</div>
            <div class="user-email">{{ authStore.user.email }}</div>
          </div>
        </router-link>
      </div>
      <div class="xp-card" v-if="store.level > 0">
        <div class="xp-card-row">
          <div class="xp-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="xp-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
            <span class="xp-level-text">Cấp {{ store.level }}</span>
          </div>
          <span class="xp-points">{{ store.xp }} XP</span>
        </div>
        <div class="xp-bar-outer">
          <div class="xp-bar-inner" :style="{ width: xpPercent + '%' }"></div>
        </div>
        <div class="xp-next">Còn {{ xpToNext }} XP để lên cấp</div>
      </div>
    </div>

    <div class="nav-links" @click="handleNavClick">
      <router-link to="/dashboard" class="nav-link" active-class="active" data-tooltip="Dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span class="nav-label">Dashboard</span>
      </router-link>

      <router-link to="/tasks" class="nav-link" active-class="active" data-tooltip="Nhiệm vụ">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        <span class="nav-label">Nhiệm vụ</span>
        <span v-if="store.taskCounts.in_progress > 0" class="nav-badge">{{ store.taskCounts.in_progress }}</span>
      </router-link>

      <router-link to="/projects" class="nav-link" active-class="active" data-tooltip="Dự án">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
        </svg>
        <span class="nav-label">Dự án</span>
      </router-link>

      <router-link to="/calendar" class="nav-link" active-class="active" data-tooltip="Lịch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span class="nav-label">Lịch</span>
      </router-link>

      <router-link to="/pomodoro" class="nav-link" active-class="active" data-tooltip="Pomodoro">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="nav-label">Pomodoro</span>
      </router-link>

      <router-link to="/gpa" class="nav-link" active-class="active" data-tooltip="Điểm số">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          <line x1="8" y1="7" x2="16" y2="7"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <span class="nav-label">Điểm số</span>
      </router-link>

      <router-link to="/semester-plan" class="nav-link" active-class="active" data-tooltip="Mục tiêu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="nav-label">Mục tiêu & Kế hoạch</span>
      </router-link>

      <router-link to="/notes" class="nav-link" active-class="active" data-tooltip="Ghi chú">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <span class="nav-label">Ghi chú</span>
      </router-link>

      <router-link to="/reports" class="nav-link" active-class="active" data-tooltip="Báo cáo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.21 15.89A10 10 0 118 2.83"/>
          <path d="M22 12A10 10 0 0012 2v10z"/>
        </svg>
        <span class="nav-label">Báo cáo</span>
      </router-link>

      <router-link to="/profile" class="nav-link" active-class="active" data-tooltip="Hồ sơ">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="nav-label">Hồ sơ</span>
      </router-link>
    </div>

    <div class="nav-divider"></div>

    <div class="nav-stats">
      <div class="stat-item">
        <span class="stat-dot todo-dot"></span>
        <span class="stat-label">{{ store.taskCounts.todo }} chờ</span>
      </div>
      <div class="stat-item">
        <span class="stat-dot progress-dot"></span>
        <span class="stat-label">{{ store.taskCounts.in_progress }} đang làm</span>
      </div>
      <div class="stat-item">
        <span class="stat-dot done-dot"></span>
        <span class="stat-label">{{ store.taskCounts.done }} xong</span>
      </div>
      <div v-if="store.taskCounts.overdue > 0" class="stat-item overdue-stat">
        <span class="stat-dot overdue-dot"></span>
        <span class="stat-label">{{ store.taskCounts.overdue }} quá hạn</span>
      </div>
    </div>

    <div v-if="store.dueSoon.length > 0 && !isCollapsed" class="due-alert">
      <div class="due-alert-header">
        <span>Sắp đến hạn</span>
        <span class="alert-count">{{ store.dueSoon.length }}</span>
      </div>
      <div v-for="task in store.dueSoon.slice(0,3)" :key="task.id" class="due-item">
        <span class="due-dot"></span>
        <span class="due-title">{{ task.title }}</span>
      </div>
    </div>

    <div class="nav-footer">
      <div v-if="!isCollapsed" class="completion-bar">
        <div class="completion-label">
          <span>Tiến độ hôm nay</span>
          <span>{{ completionPercent }}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: completionPercent + '%' }"></div>
        </div>
      </div>
      <div v-else class="completion-mini">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ completionPercent }}%</span>
      </div>
      <button class="logout-btn" @click="authStore.logout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span class="logout-label">Đăng xuất</span>
      </button>
    </div>

    <button class="collapse-toggle" @click="toggleCollapsed" :title="isCollapsed ? 'Mở rộng' : 'Thu gọn'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: isCollapsed ? 'rotate(180deg)' : '' }">
        <polyline points="11 17 6 12 11 7"/>
        <polyline points="18 17 13 12 18 7"/>
      </svg>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { getHost } from '@/utils/serverConfig'


const props = defineProps({
  isOpen: Boolean
})
const emit = defineEmits(['close'])

const store = useTaskStore()
const authStore = useAuthStore()

const xpForLevel = (lvl) => lvl * 200
const xpPercent = computed(() => {
  const current = store.xp
  const prev = xpForLevel(store.level - 1)
  const next = xpForLevel(store.level)
  const needed = next - prev
  if (needed <= 0) return 100
  return Math.min(100, Math.round(((current - prev) / needed) * 100))
})
const xpToNext = computed(() => {
  const next = xpForLevel(store.level)
  return Math.max(0, next - store.xp)
})

const isCollapsed = ref(localStorage.getItem('navbar_collapsed') === 'true')

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('navbar_collapsed', isCollapsed.value)
}

const handleNavClick = (e) => {
  if (e.target.closest('.nav-link')) {
    emit('close')
  }
}

const completionPercent = computed(() => {
  const total = store.taskCounts.all
  if (!total) return 0
  return Math.round((store.taskCounts.done / total) * 100)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  left: 0; top: 0;
  width: 260px;
  height: 100vh;
  background: #061e1c;
  border-right: 1px solid rgba(17,124,117,0.15);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.navbar.collapsed {
  width: 80px;
  padding: 16px 10px;
  align-items: center;
}
.navbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 20% 30%, rgba(17,124,117,0.25) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(14,107,100,0.18) 0%, transparent 50%),
              linear-gradient(180deg, #061e1c 0%, #0a2e2a 30%, #0a3a36 65%, #041e1c 100%);
  pointer-events: none;
  z-index: 0;
}
.navbar > * { position: relative; z-index: 1; }

/* ===== LOGO ===== */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 4px 8px;
  color: #117c75;
  overflow: visible;
  white-space: nowrap;
}
.collapsed .nav-logo {
  justify-content: center;
  padding: 0;
  margin-bottom: 14px;
}
.collapsed .logo-text { display: none; }

/* ===== USER ===== */
.user-section { margin-bottom: 14px; }
.user-info-top-wrapper { display: flex; align-items: center; gap: 8px; }
.user-info-top {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  overflow: hidden;
}
.user-info-top:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
.collapsed .user-info-top { justify-content: center; padding: 10px; width: 52px; min-width: 52px; }
.user-avatar {
  width: 36px; height: 36px;
  background: #117c75;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.95rem; color: #fff;
  flex-shrink: 0; overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.user-details { min-width: 0; flex: 1; overflow: hidden; }
.collapsed .user-details { display: none; }
.user-name { font-size: 0.85rem; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ===== XP CARD ===== */
.xp-card {
  margin-top: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(244,171,25,0.12) 0%, rgba(244,171,25,0.04) 100%);
  border: 1px solid rgba(244,171,25,0.2);
  border-radius: 10px;
}
.collapsed .xp-card { display: none; }
.xp-card-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.xp-badge { display: flex; align-items: center; gap: 6px; }
.xp-icon { width: 14px; height: 14px; color: #f4ab19; flex-shrink: 0; }
.xp-level-text { font-size: 0.78rem; font-weight: 700; color: #f4ab19; }
.xp-points { font-size: 0.72rem; font-weight: 600; color: #94a3b8; }
.xp-bar-outer { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.xp-bar-inner { height: 100%; background: linear-gradient(90deg, #f4ab19, #fbbf24); border-radius: 2px; transition: width 0.6s ease; }
.xp-next { font-size: 0.65rem; color: #64748b; margin-top: 4px; }

/* ===== NAV LINKS ===== */
.nav-links { display: flex; flex-direction: column; gap: 2px; }
.nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px; border-radius: 10px;
  color: #e2e8f0; text-decoration: none;
  font-size: 0.88rem; font-weight: 500;
  transition: all 0.2s; position: relative;
  white-space: nowrap; overflow: hidden;
}
.nav-link svg { width: 20px; height: 20px; flex-shrink: 0; }
.nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-link.active { background: rgba(17,124,117,0.15); color: #2dd4bf; font-weight: 600; }
.nav-link.active svg { color: #2dd4bf; }
.collapsed .nav-link { justify-content: center; padding: 12px; width: 52px; height: 52px; }
.collapsed .nav-label { display: none; }
.collapsed .nav-badge { position: absolute; top: 6px; right: 6px; margin: 0; padding: 1px 5px; font-size: 0.6rem; }
.nav-badge {
  margin-left: auto; background: rgba(17,124,117,0.15); color: #2dd4bf;
  font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; min-width: 18px; text-align: center;
}
/* Tooltip */
.collapsed .nav-link::after {
  content: attr(data-tooltip);
  position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%) translateX(-4px);
  background: #1a3a36; color: #e2e8f0; font-size: 0.78rem; font-weight: 500;
  padding: 6px 12px; border-radius: 8px; white-space: nowrap;
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 200; border: 1px solid rgba(17,124,117,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.collapsed .nav-link:hover::after { opacity: 1; transform: translateY(-50%) translateX(0); }

/* ===== DIVIDER ===== */
.nav-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 14px 0; }

/* ===== STATS ===== */
.nav-stats { display: flex; flex-direction: column; gap: 10px; padding: 0 8px; }
.collapsed .nav-stats { align-items: center; padding: 0; gap: 12px; }
.stat-item { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #cbd5e1; }
.stat-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.collapsed .stat-label { display: none; }
.collapsed .stat-item { position: relative; justify-content: center; }
.collapsed .stat-dot { width: 10px; height: 10px; }
.collapsed .stat-item::after {
  content: attr(data-tooltip);
  position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%);
  background: #1a3a36; color: #e2e8f0; font-size: 0.78rem; padding: 6px 12px; border-radius: 8px;
  white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s;
  border: 1px solid rgba(17,124,117,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.collapsed .stat-item:hover::after { opacity: 1; }
.todo-dot { background: #94a3b8; }
.progress-dot { background: #f59e0b; }
.done-dot { background: #10b981; }
.overdue-dot { background: #ef4444; }
.overdue-stat { color: #ef4444; }

/* ===== DUE ALERT ===== */
.due-alert { margin-top: 14px; padding: 12px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.15); border-radius: 10px; }
.due-alert-header { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: #fbbf24; margin-bottom: 10px; }
.alert-count { background: rgba(251,191,36,0.2); color: #fbbf24; border-radius: 10px; padding: 1px 7px; font-size: 0.7rem; }
.due-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.due-dot { width: 6px; height: 6px; background: #fbbf24; border-radius: 50%; flex-shrink: 0; }
.due-title { font-size: 0.78rem; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ===== FOOTER ===== */
.nav-footer { margin-top: auto; padding-top: 14px; }
.completion-bar { padding: 0 8px; }
.completion-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 500; color: #cbd5e1; margin-bottom: 6px; }
.bar-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #117c75, #2dd4bf); border-radius: 3px; transition: width 0.5s ease; }
.completion-mini { display: flex; align-items: center; justify-content: center; gap: 6px; color: #94a3b8; font-size: 0.75rem; font-weight: 600; padding: 10px 0; }
.completion-mini svg { color: #2dd4bf; }
.logout-btn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; margin-top: 12px; padding: 11px 12px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px;
  color: #fca5a5; font-size: 0.85rem; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.logout-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.25); }
.collapsed .logout-btn { justify-content: center; padding: 11px; width: 52px; }
.collapsed .logout-label { display: none; }

/* ===== TOGGLE ===== */
.collapse-toggle {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; margin: 14px auto 0;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
  color: #64748b; cursor: pointer; transition: all 0.25s;
}
.collapse-toggle:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; border-color: rgba(255,255,255,0.15); }
.collapse-toggle svg { transition: transform 0.3s ease; }

/* ===== MOBILE ===== */
@media (max-width: 768px) {
  .navbar {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    z-index: 200;
    overflow-y: auto;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .navbar.open { transform: translateX(0); }
  .collapsed .navbar { width: 280px; }
  .nav-links { gap: 4px; }
  .nav-link { padding: 11px 16px; font-size: 0.88rem; min-height: 44px; }
  .user-email { font-size: 0.78rem; }
  .xp-next { font-size: 0.72rem; }
  .stat-label { font-size: 0.72rem; }
  .collapse-toggle { display: none; }
  .collapsed .nav-text { display: block; }
  .collapsed .nav-link { padding-left: 16px; width: auto; justify-content: flex-start; }
  .collapsed .nav-icon { margin: 0; }
}
</style>
