<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ Cài đặt Hệ thống</h1>
        <p class="page-subtitle">Quản lý cấu hình chung của ứng dụng</p>
      </div>
    </div>

    <div class="glass-card settings-card">
      <form @submit.prevent="saveSettings" class="settings-form">
        <div class="form-group">
          <label>Tên Ứng dụng</label>
          <input type="text" v-model="settings.appName" class="form-input" required />
        </div>
        
        <div class="form-group">
          <label>Màu Chủ đạo (Theme Color)</label>
          <div class="color-picker-wrapper">
            <input type="color" v-model="settings.themeColor" class="color-picker" />
            <input type="text" v-model="settings.themeColor" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label>Kích thước Tải lên Tối đa (MB)</label>
          <input type="number" v-model="settings.maxUploadSize" class="form-input" min="1" max="100" required />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Đang lưu...</span>
            <span v-else>💾 Lưu Cài đặt</span>
          </button>
        </div>
        
        <div v-if="message" class="alert success-alert">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/adminApi'

const settings = ref({
  appName: '',
  themeColor: '#117c75',
  maxUploadSize: 10
})
const loading = ref(false)
const message = ref('')

const fetchSettings = async () => {
  try {
    const res = await adminApi.getSettings()
    if (res.data.success && res.data.data) {
      settings.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  }
}

const saveSettings = async () => {
  loading.value = true
  message.value = ''
  try {
    await adminApi.updateSettings(settings.value)
    message.value = 'Cập nhật cài đặt thành công!'
    setTimeout(() => { message.value = '' }, 3000)
  } catch (err) {
    console.error(err)
    alert('Có lỗi xảy ra khi lưu cài đặt.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.admin-page {
  animation: fadeIn 0.4s ease both;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  padding: 32px;
  max-width: 600px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: var(--text-primary);
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #117c75;
  outline: none;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(17,124,117,0.1);
}

.color-picker-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 50px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.form-actions {
  margin-top: 10px;
}

.btn-primary {
  background: linear-gradient(135deg, #c7a45a, #a37f3a);
  color: #000;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #dfc686, #b89554);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-alert {
  margin-top: 16px;
  padding: 12px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #059669;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}
</style>
