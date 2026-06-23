<template>
  <div class="register-page">
    <header class="top-nav">
      <div class="nav-left">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" class="nav-brand-icon">
          <defs><linearGradient id="regLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
          <rect width="32" height="32" rx="8" fill="url(#regLogoGrad)"/>
          <path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <router-link to="/login" class="nav-brand">TaskFlow</router-link>
      </div>
      <div class="nav-center">
        <router-link to="/login" class="nav-link">ĐĂNG NHẬP</router-link>
        <a href="#" class="nav-link active" @click.prevent>ĐĂNG KÝ</a>
      </div>
      <div class="nav-right">
        <div class="user-badge">
          <span class="avatar-initial">T</span>
          <span class="username">Tạo tài khoản</span>
        </div>
      </div>
    </header>

    <div class="form-area">
      <div class="form-wrapper">
        <div class="brand-logo-container">
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="regFormGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#regFormGrad)"/><path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="form-header">
          <h2>Tạo tài khoản</h2>
          <p>Điền thông tin bên dưới để bắt đầu</p>
        </div>

        <div class="divider-line"></div>

        <transition name="fade-slide">
          <div v-if="error" class="error-box">
            <span class="error-icon">⚠️</span> {{ error }}
          </div>
        </transition>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="field-group" :class="{ focused: focused === 'name' }">
            <label class="field-label">Họ và tên</label>
            <div class="field-input-wrap">
              <span class="field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input v-model="form.name" type="text" class="field-input" placeholder="Nguyễn Văn A" required @focus="focused = 'name'" @blur="focused = ''" />
            </div>
          </div>

          <div class="field-group" :class="{ focused: focused === 'email' }">
            <label class="field-label">Email</label>
            <div class="field-input-wrap">
              <span class="field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input v-model="form.email" type="email" class="field-input" placeholder="email@example.com" required @focus="focused = 'email'" @blur="focused = ''" />
            </div>
          </div>



          <div class="field-group" :class="{ focused: focused === 'pass' }">
            <label class="field-label">Mật khẩu</label>
            <div class="field-input-wrap">
              <span class="field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </span>
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="field-input" placeholder="Từ 6 ký tự" required minlength="6" @focus="focused = 'pass'" @blur="focused = ''" />
              <button type="button" class="eye-btn" @click="showPass = !showPass">
                <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <div class="field-group" :class="{ focused: focused === 'confirm' }">
            <label class="field-label">Xác nhận mật khẩu</label>
            <div class="field-input-wrap">
              <span class="field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              </span>
              <input v-model="form.confirmPassword" :type="showPass ? 'text' : 'password'" class="field-input" :class="{ 'input-error': form.confirmPassword && form.password !== form.confirmPassword }" placeholder="Nhập lại mật khẩu" required @focus="focused = 'confirm'" @blur="focused = ''" />
            </div>
          </div>

          <div v-if="form.password" class="strength-wrap">
            <div class="strength-bars">
              <div v-for="i in 4" :key="i" class="strength-bar" :class="{ active: strength >= i, ['s' + strengthLevel]: strength >= i }"></div>
            </div>
            <span class="strength-text" :class="'s' + strengthLevel">{{ strengthLabel }}</span>
          </div>

          <label class="terms-check">
            <input v-model="agreed" type="checkbox" class="check-input" required />
            <span class="check-box"></span>
            <span class="terms-text">Tôi đồng ý với <a href="#" class="terms-link" @click.prevent="showTerms = true">Điều khoản sử dụng</a></span>
          </label>

          <button type="submit" class="submit-btn" :disabled="loading || (form.confirmPassword && form.password !== form.confirmPassword) || !agreed">
            <span v-if="loading" class="btn-loading">
              <span class="spinner"></span>Đang xử lý...
            </span>
            <span v-else class="btn-content">
              Tạo Tài Khoản
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </button>
        </form>

        <p class="switch-text">
          Đã có tài khoản?
          <router-link to="/login" class="switch-link">Đăng nhập</router-link>
        </p>

        <Teleport to="body">
          <transition name="terms-fade">
            <div v-if="showTerms" class="terms-overlay" @click.self="showTerms = false">
              <div class="terms-modal">
                <button class="terms-close-btn" @click="showTerms = false">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="terms-shield">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                </div>
                <h3 class="terms-title">Điều khoản sử dụng</h3>
                <p class="terms-desc">Bằng việc sử dụng TaskFlow, bạn đồng ý với các điều khoản sau:</p>
                <div class="terms-list">
                  <div class="terms-item">Bạn chịu trách nhiệm về bảo mật tài khoản của mình.</div>
                  <div class="terms-item">Bạn không được sử dụng dịch vụ cho mục đích trái pháp luật.</div>
                  <div class="terms-item">Chúng tôi có quyền tạm ngưng tài khoản nếu phát hiện vi phạm.</div>
                  <div class="terms-item">Dữ liệu của bạn được bảo vệ và không chia sẻ với bên thứ ba.</div>
                </div>
                <button class="terms-ok-btn" @click="showTerms = false">
                  <span>Đã hiểu</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            </div>
          </transition>
        </Teleport>
      </div>
    </div>

    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ name: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)
const focused = ref('')
const agreed = ref(false)
const showTerms = ref(false)

const strength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) s++
  if (/[!@#$%^&*]/.test(p)) s++
  return s
})
const strengthLevel = computed(() => {
  if (strength.value <= 1) return 1
  if (strength.value === 2) return 2
  if (strength.value === 3) return 3
  return 4
})
const strengthLabel = computed(() => ['', 'Chưa đạt', 'Tạm ổn', 'Tốt', 'Rất tốt'][strengthLevel.value])

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu không khớp!'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.register(
      form.value.name,
      form.value.email,
      form.value.password
    )
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@300;400;500;600;700&display=swap');

.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #f0fdfa 30%, #f0fdf4 70%, #f0f4ff 100%);
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.register-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #94a3b8 0.5px, transparent 0.5px);
  background-size: 24px 24px;
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

.top-nav {
  position: relative;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 60px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.top-nav::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(17, 124, 117, 0.3), rgba(244, 171, 25, 0.3), transparent);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-brand {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  color: #0f172a;
  text-decoration: none;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #64748b;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.nav-link:hover, .nav-link.active {
  color: #117c75;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
}

.avatar-initial {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #117c75;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}

.form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  z-index: 2;
}

.form-wrapper {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 40px 36px 36px;
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.06);
}

.brand-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.brand-logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  object-fit: cover;
}

.form-header { margin-bottom: 20px; text-align: center; }
.form-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.form-header p { font-size: 0.85rem; color: #64748b; }

.divider-line {
  height: 1px;
  background: #f1f5f9;
  margin-bottom: 24px;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 20px;
}

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

.auth-form { display: flex; flex-direction: column; gap: 18px; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  transition: color 0.3s;
}

.field-group.focused .field-label { color: #117c75; }

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  display: flex;
  transition: color 0.3s;
}

.field-group.focused .field-icon { color: #117c75; }

.field-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #0f172a;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.25s ease;
}

.field-input::placeholder { color: #94a3b8; }
.field-input:focus {
  background: #ffffff;
  border-color: #117c75;
  box-shadow: 0 0 0 4px rgba(17, 124, 117, 0.08);
}

.input-error { border-color: #ef4444 !important; }

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: color 0.3s;
}

.eye-btn:hover { color: #117c75; }

.strength-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -2px;
}

.strength-bars {
  display: flex;
  gap: 6px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  transition: background 0.4s ease;
}

.strength-bar.active.s1 { background: #ef4444; }
.strength-bar.active.s2 { background: #f59e0b; }
.strength-bar.active.s3 { background: #f4ab19; }
.strength-bar.active.s4 { background: #10b981; }

.strength-text {
  font-size: 0.72rem;
  font-weight: 600;
  flex-shrink: 0;
  width: 50px;
  text-align: right;
}

.strength-text.s1 { color: #ef4444; }
.strength-text.s2 { color: #f59e0b; }
.strength-text.s3 { color: #f4ab19; }
.strength-text.s4 { color: #10b981; }

.terms-check {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.check-input { display: none; }

.check-box {
  width: 20px;
  height: 20px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}

.check-input:checked + .check-box {
  background: linear-gradient(135deg, #117c75, #0e6b64);
  border-color: transparent;
}

.check-input:checked + .check-box::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
}

.terms-text { font-size: 0.8rem; color: #64748b; font-weight: 500; }
.terms-link { color: #117c75; text-decoration: none; font-weight: 600; }
.terms-link:hover { color: #0e6b64; }

.submit-btn {
  margin-top: 6px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #117c75, #0e6b64);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(17, 124, 117, 0.2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(17, 124, 117, 0.3);
}

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-content, .btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.switch-text {
  margin-top: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
}

.switch-link {
  color: #117c75;
  text-decoration: none;
  font-weight: 600;
  margin-left: 6px;
  transition: all 0.3s;
}

.switch-link:hover {
  color: #0e6b64;
}

.terms-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}
.terms-modal {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  padding: 36px 32px 28px;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1);
  position: relative;
  animation: terms-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes terms-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.terms-close-btn {
  position: absolute;
  top: 14px; right: 14px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.terms-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.terms-shield {
  width: 72px; height: 72px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #e6f5f3, #fef9e7);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #117c75;
}
.terms-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}
.terms-desc {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.5;
}
.terms-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  text-align: left;
}
.terms-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.5;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}
.terms-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.terms-ok-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #117c75, #0e6b64);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s;
  box-shadow: 0 6px 16px rgba(17,124,117,0.25);
}
.terms-ok-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(17,124,117,0.35);
}
.terms-fade-enter-active { transition: all 0.25s ease; }
.terms-fade-leave-active { transition: all 0.2s ease; }
.terms-fade-enter-from,
.terms-fade-leave-to { opacity: 0; }
.terms-fade-enter-from .terms-modal,
.terms-fade-leave-to .terms-modal { transform: scale(0.95); }

.ambient-glow {
  display: none;
}

@media (max-width: 1024px) {
  .top-nav { padding: 0 24px; }
  .nav-center { display: none; }
}

@media (max-width: 480px) {
  .top-nav { padding: 0 16px; height: 70px; }
  .nav-brand { font-size: 1.1rem; }
  .user-badge { padding: 4px 10px; }
  .username { display: none; }
  .form-wrapper { padding: 28px 20px; border-radius: 20px; }
  .field-row { grid-template-columns: 1fr; gap: 16px; }
}
</style>
