<template>
  <div class="admin-layout" :class="{ collapsed: sidebarCollapsed }">
    <div class="mobile-header">
      <button class="menu-toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="mobile-logo">
        <div class="brand-logo-sm">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <defs><linearGradient id="admMobGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
            <rect width="32" height="32" rx="8" fill="url(#admMobGrad)"/>
            <path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>Admin Panel</span>
      </div>
      <button class="mobile-logout-btn" @click="handleLogout" title="Đăng xuất">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>

    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

    <aside class="admin-sidebar" :class="{ open: isSidebarOpen }"
           @mouseenter="onDesktopEnter" @mouseleave="onDesktopLeave">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <defs><linearGradient id="admSideGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
            <rect width="32" height="32" rx="8" fill="url(#admSideGrad)"/>
            <path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <transition name="fade">
          <div v-if="!sidebarCollapsed" class="brand-text">
            <div class="brand-name">Admin Panel</div>
            <div class="brand-sub">TaskFlow Management</div>
          </div>
        </transition>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-label" v-if="!sidebarCollapsed">TỔNG QUAN</div>
          <router-link to="/admin/dashboard" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Dashboard</span></transition>
          </router-link>
        </div>

        <div class="nav-section">
          <div class="nav-label" v-if="!sidebarCollapsed">QUẢN LÝ</div>
          <router-link to="/admin/users" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Người dùng</span></transition>
            <transition name="fade"><span v-if="!sidebarCollapsed && userCount" class="nav-badge">{{ userCount }}</span></transition>
          </router-link>
          <router-link to="/admin/projects" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Dự án</span></transition>
          </router-link>
          <router-link to="/admin/categories" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Danh mục</span></transition>
          </router-link>
          <router-link to="/admin/notifications" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Thông báo</span></transition>
          </router-link>
          <router-link to="/admin/logs" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Nhật ký</span></transition>
          </router-link>
        </div>

        <div class="nav-section">
          <div class="nav-label" v-if="!sidebarCollapsed">HỆ THỐNG</div>
          <router-link to="/admin/settings" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Cài đặt</span></transition>
          </router-link>
          <router-link to="/admin/export" class="nav-item" active-class="active" @click="closeMobileSidebar">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <transition name="fade"><span v-if="!sidebarCollapsed" class="nav-text">Xuất dữ liệu</span></transition>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-info" v-if="!sidebarCollapsed">
          <div class="admin-avatar">{{ adminName.charAt(0).toUpperCase() }}</div>
          <div class="admin-detail">
            <div class="admin-name">{{ adminName }}</div>
            <div class="admin-role">Quản trị viên</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" :title="sidebarCollapsed ? 'Đăng xuất' : ''">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <transition name="fade"><span v-if="!sidebarCollapsed">Đăng xuất</span></transition>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/adminApi'

const authStore = useAuthStore()
const router = useRouter()
const sidebarCollapsed = ref(true)
const isSidebarOpen = ref(false)
const userCount = ref(0)
const isMobile = ref(window.innerWidth <= 768)

const adminName = computed(() => authStore.user?.name || 'Admin')

const handleLogout = () => {
  authStore.clearAuth()
  router.push('/admin/login')
}

const closeMobileSidebar = () => {
  if (isMobile.value) isSidebarOpen.value = false
}

const onDesktopEnter = () => {
  if (!isMobile.value) sidebarCollapsed.value = false
}
const onDesktopLeave = () => {
  if (!isMobile.value) sidebarCollapsed.value = true
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) isSidebarOpen.value = false
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  try {
    const res = await adminApi.getStats()
    userCount.value = res.data.data.total_users || 0
  } catch (e) {}
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.mobile-header {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 56px;
  background: linear-gradient(135deg, #0a1628, #0f1d32);
  color: #fff;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 200;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
.menu-toggle-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08);
  border: none; border-radius: 10px;
  color: #fff; cursor: pointer;
}
.menu-toggle-btn:active { background: rgba(255,255,255,0.15); }
.mobile-logo {
  display: flex; align-items: center; gap: 8px;
  font-weight: 800; font-size: 0.95rem;
}
.brand-logo-sm {
  width: 30px; height: 30px;
  background: linear-gradient(135deg, #117c75, #0d9488);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.mobile-logout-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(239,68,68,0.12);
  border: none; border-radius: 10px;
  color: #fca5a5; cursor: pointer;
}
.mobile-logout-btn:active { background: rgba(239,68,68,0.25); }

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.admin-sidebar {
  width: 260px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0a1628 0%, #0f1d32 50%, #0a1628 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  padding: 0;
  box-shadow: 4px 0 24px rgba(0,0,0,0.2);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.collapsed .admin-sidebar { width: 72px; }

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.brand-logo {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #117c75, #0d9488);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(17,124,117,0.3);
}
.brand-text { overflow: hidden; white-space: nowrap; }
.brand-name { font-weight: 800; font-size: 0.95rem; color: #fff; }
.brand-sub { font-size: 0.65rem; color: #64748b; font-weight: 500; letter-spacing: 0.05em; }

.sidebar-nav {
  flex: 1;
  padding: 8px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section { margin-bottom: 4px; }
.nav-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
  padding: 12px 12px 6px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  position: relative;
  white-space: nowrap;
}
.nav-item:hover {
  background: rgba(17,124,117,0.1);
  color: #e2e8f0;
}
.nav-item.active {
  background: linear-gradient(135deg, #117c75, #0d9488);
  color: #fff;
  box-shadow: 0 4px 12px rgba(17,124,117,0.3);
  font-weight: 600;
}
.nav-icon { flex-shrink: 0; display: flex; align-items: center; }
.nav-text { flex: 1; }
.nav-badge {
  font-size: 0.7rem;
  background: rgba(255,255,255,0.2);
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin-bottom: 8px;
}
.admin-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #117c75, #0d9488);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 0.9rem;
  flex-shrink: 0;
}
.admin-detail { overflow: hidden; }
.admin-name { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; }
.admin-role { font-size: 0.65rem; color: #64748b; }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
  justify-content: center;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #fff;
  border-color: rgba(239, 68, 68, 0.3);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 24px 32px 40px;
  min-height: 100vh;
  background: #f1f5f9;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.collapsed .main-content { margin-left: 72px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .mobile-header { display: flex; }
  .sidebar-overlay { display: block; }
  .admin-sidebar {
    transform: translateX(-100%);
    width: 280px;
    z-index: 150;
  }
  .admin-sidebar.open { transform: translateX(0); }
  .collapsed .admin-sidebar { width: 280px; }
  .main-content {
    margin-left: 0;
    padding: 72px 12px 24px;
  }
}
</style>
