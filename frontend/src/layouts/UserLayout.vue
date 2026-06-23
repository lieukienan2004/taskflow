<template>
  <div class="app-layout">
    <div class="mobile-header">
      <button class="menu-toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="mobile-logo">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <defs><linearGradient id="mobGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
          <rect width="32" height="32" rx="8" fill="url(#mobGrad)"/>
          <path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">TaskFlow</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <div v-if="notifications.length > 0" class="global-banner" :class="'banner-' + (notifications[0]?.type || 'info')">
      <div class="banner-content">
        <div class="banner-left">
          <span class="banner-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </span>
          <span class="banner-tag">Thông báo</span>
        </div>
        <div class="banner-marquee">
          <div class="marquee-track">
            <span class="marquee-item" v-for="(n, idx) in repeatList" :key="idx">
              <span class="marquee-dot">✦</span>
              {{ n.title }} — {{ n.message }}
            </span>
          </div>
        </div>
        <button class="banner-close" @click="notifications = []">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <Navbar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <ChatWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import { systemApi } from '@/api/adminApi'
import { useTaskStore } from '@/stores/taskStore'

const store = useTaskStore()
const isSidebarOpen = ref(false)
const notifications = ref([])

const isNavbarCollapsed = ref(localStorage.getItem('navbar_collapsed') === 'true')
let collapseInterval = null

const repeatList = computed(() => {
  const list = notifications.value
  return [...list, ...list, ...list]
})

onMounted(async () => {
  try {
    const res = await systemApi.getActiveNotifications()
    notifications.value = res.data.data
  } catch (err) {
    console.error('Lỗi tải thông báo:', err)
  }
  collapseInterval = setInterval(() => {
    isNavbarCollapsed.value = localStorage.getItem('navbar_collapsed') === 'true'
  }, 300)
})

onUnmounted(() => {
  if (collapseInterval) clearInterval(collapseInterval)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  padding-top: v-bind('notifications.length > 0 ? "40px" : "0"');
  background: linear-gradient(135deg, #f0f4ff 0%, #f0fdfa 30%, #f0fdf4 70%, #f0f4ff 100%);
}

.global-banner {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  height: 38px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.banner-content {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 500;
  background: inherit;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding-right: 12px;
  border-right: 1px solid rgba(255,255,255,0.25);
}

.banner-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.15);
  border-radius: 6px;
  animation: shake 3s ease-in-out infinite;
}
@keyframes shake {
  0%, 80%, 100% { transform: rotate(0); }
  85% { transform: rotate(12deg); }
  90% { transform: rotate(-10deg); }
  95% { transform: rotate(5deg); }
}

.banner-tag {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.9;
}

.banner-marquee {
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
}

.marquee-track {
  display: inline-flex;
  gap: 0;
  white-space: nowrap;
  will-change: transform;
  animation: marquee-scroll 20s linear infinite;
}

.marquee-item {
  font-weight: 600;
  font-size: 0.82rem;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.marquee-dot {
  font-size: 0.6rem;
  opacity: 0.5;
}

@keyframes marquee-scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.banner-close {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  width: 22px;
  height: 22px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.banner-close:hover { background: rgba(255,255,255,0.25); color: #fff; }

.banner-info { background: linear-gradient(135deg, #0d9488 0%, #117c75 50%, #0f766e 100%); }
.banner-success { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
.banner-warning { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); }
.banner-error { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); }

.main-content {
  flex: 1;
  margin-left: v-bind('isNavbarCollapsed ? "76px" : "260px"');
  padding: 28px;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.mobile-header {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 99;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.menu-toggle-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.menu-toggle-btn:hover {
  color: #0e6b64;
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #117c75;
}

.logo-text {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
}

@media (max-width: 768px) {
  .mobile-header { display: flex; }
  .sidebar-overlay { display: block; }
  .navbar { transform: translateX(-100%); width: 280px; }
  .navbar.open { transform: translateX(0); }
  .main-content {
    margin-left: 0;
    padding: 72px 16px 24px;
  }
}
</style>
