<template>
  <div class="admin-auth-wrapper">
    <div class="form-wrapper">
      <div class="form-header">
        <div class="logo-icon">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="adminLoginGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#adminLoginGrad)"/><path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h2>Admin Portal</h2>
        <p>Hệ thống quản trị chuyên dụng</p>
      </div>

      <transition name="fade-slide">
        <div v-if="error" class="error-box">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>
      </transition>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="field-group">
          <label class="field-label">Tên tài khoản (Email hoặc Username)</label>
          <input
            v-model="form.email"
            type="text"
            class="field-input"
            placeholder="admin"
            required
          />
        </div>

        <div class="field-group">
          <label class="field-label">Mật khẩu</label>
          <input
            v-model="form.password"
            type="password"
            class="field-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">Đang xác thực...</span>
          <span v-else>Truy cập hệ thống</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value.email, form.value.password)
    
    // Kiểm tra quyền admin
    if (authStore.user?.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      error.value = 'Tài khoản không có quyền quản trị.'
      authStore.logout() // Đăng xuất nếu không phải admin
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #f0fdfa 30%, #f0fdf4 70%, #f0f4ff 100%);
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.06);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}
.logo-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}
.form-header h2 {
  font-size: 1.5rem;
  color: #0e6b64;
  margin-bottom: 5px;
}
.form-header p {
  color: #64748b;
  font-size: 0.85rem;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.8rem;
  color: #374151;
  font-weight: 600;
}

.field-input {
  width: 100%;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #0f172a;
  outline: none;
  transition: all 0.25s;
  font-family: inherit;
  font-size: 0.9rem;
}
.field-input:focus {
  border-color: #117c75;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(17,124,117, 0.08);
}

.submit-btn {
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #117c75, #0e6b64);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
  font-size: 0.9rem;
  box-shadow: 0 8px 20px rgba(17,124,117, 0.2);
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(17,124,117, 0.3);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
