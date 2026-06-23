<template>
  <nav class="navbar admin-navbar">
    <!-- Logo -->
    <div class="nav-logo">
      <span class="logo-icon">🛡️</span>
      <span class="logo-text">Admin Panel</span>
    </div>

    <!-- User Info Top -->
    <div class="user-info-top" v-if="authStore.user">
      <div class="user-avatar">
        <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="avatar-img" alt="avatar" />
        <span v-else>{{ authStore.user.name?.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="user-details">
        <div class="user-name">{{ authStore.user.name }}</div>
        <div class="user-email">Quản trị viên</div>
      </div>
    </div>

    <!-- Navigation Links -->
    <div class="nav-links">
      <router-link to="/admin/dashboard" class="nav-link" active-class="active">
        <span class="icon">📊</span> Tổng Quan
      </router-link>
      <router-link to="/admin/users" class="nav-link" active-class="active">
        <span class="icon">👥</span> Người Dùng
      </router-link>
      <router-link to="/admin/categories" class="nav-link" active-class="active">
        <span class="icon">🏷️</span> Danh Mục
      </router-link>
      <router-link to="/admin/notifications" class="nav-link" active-class="active">
        <span class="icon">📢</span> Thông Báo
      </router-link>
      <router-link to="/admin/logs" class="nav-link" active-class="active">
        <span class="icon">📜</span> Nhật Ký
      </router-link>
      <router-link to="/admin/settings" class="nav-link" active-class="active">
        <span class="icon">⚙️</span> Cài Đặt
      </router-link>
      <router-link to="/admin/export" class="nav-link" active-class="active">
        <span class="icon">📤</span> Xuất Dữ Liệu
      </router-link>
    </div>

    <!-- Footer -->
    <div class="nav-footer">
      <button class="logout-btn" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Đăng xuất Admin
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.clearAuth()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-navbar {
  position: fixed;
  left: 0; top: 0;
  width: 260px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  z-index: 100;
}

/* Logo */
.nav-logo {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding: 0 8px;
}
.logo-icon { font-size: 1.5rem; }
.logo-text {
  font-size: 1.3rem; font-weight: 800;
  color: #0e6b64; letter-spacing: -0.02em;
}

/* User Info Top */
.user-info-top {
  display: flex; align-items: center; gap: 10px; padding: 10px 8px; margin-bottom: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.user-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #117c75, #0e6b64);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.user-name { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
.user-email { font-size: 0.75rem; color: #117c75; }

/* Nav Links */
.nav-links { display: flex; flex-direction: column; gap: 6px; }
.nav-link {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-radius: 8px; color: #64748b; text-decoration: none; font-size: 0.95rem; font-weight: 500;
  transition: all 0.3s;
}
.nav-link .icon { font-size: 1.1rem; }
.nav-link:hover { background: #f1f5f9; color: #0f172a; }
.nav-link.active { background: rgba(17,124,117, 0.08); color: #0e6b64; }

/* Footer */
.nav-footer { margin-top: auto; padding-top: 20px; }
.logout-btn {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 8px; color: #dc2626; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.logout-btn:hover { background: #fee2e2; }
</style>
