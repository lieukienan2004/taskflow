<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">📢 Quản Lý Thông Báo</h1>
        <p class="page-subtitle">Gửi thông báo toàn hệ thống</p>
      </div>
    </div>

    <div class="content-grid">
      <!-- Create form -->
      <div class="glass-card add-card">
        <h3>Tạo Thông Báo Mới</h3>
        <form @submit.prevent="handleAdd">
          <div class="form-group">
            <label>Tiêu đề</label>
            <input v-model="form.title" type="text" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Nội dung</label>
            <textarea v-model="form.message" class="form-control" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label>Loại</label>
            <select v-model="form.type" class="form-control">
              <option value="info">Thông tin (Xanh dương)</option>
              <option value="success">Thành công (Xanh lá)</option>
              <option value="warning">Cảnh báo (Vàng)</option>
              <option value="error">Lỗi (Đỏ)</option>
            </select>
          </div>
          <div class="form-group checkbox-group">
            <input v-model="form.is_active" type="checkbox" id="isActive" />
            <label for="isActive">Kích hoạt ngay</label>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">Đăng Thông Báo</button>
        </form>
      </div>

      <!-- List -->
      <div class="glass-card list-card">
        <h3>Lịch Sử Thông Báo</h3>
        <div class="notif-list">
          <div v-for="n in notifications" :key="n.id" class="notif-item" :class="`border-${n.type}`">
            <div class="notif-content">
              <div class="notif-header">
                <h4>{{ n.title }}</h4>
                <span class="status-badge" :class="n.is_active ? 'active' : 'inactive'">
                  {{ n.is_active ? 'Đang bật' : 'Đã tắt' }}
                </span>
              </div>
              <p>{{ n.message }}</p>
              <span class="notif-date">{{ new Date(n.created_at).toLocaleString('vi-VN') }}</span>
            </div>
            <button class="btn btn-danger btn-sm" @click="handleDelete(n.id)">Xóa</button>
          </div>
          <div v-if="notifications.length === 0" class="empty-state">Chưa có thông báo nào</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/adminApi'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const notifications = ref([])
const loading = ref(false)
const form = ref({ title: '', message: '', type: 'info', is_active: true })

const fetchNotifications = async () => {
  try {
    const res = await adminApi.getNotifications()
    notifications.value = res.data.data
  } catch (err) {
    taskStore.showToast('Lỗi tải thông báo', 'error')
  }
}

const handleAdd = async () => {
  loading.value = true
  try {
    await adminApi.createNotification(form.value)
    taskStore.showToast('Đã tạo thông báo', 'success')
    form.value = { title: '', message: '', type: 'info', is_active: true }
    fetchNotifications()
  } catch (err) {
    taskStore.showToast('Lỗi tạo thông báo', 'error')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
    try {
      await adminApi.deleteNotification(id)
      taskStore.showToast('Đã xóa', 'success')
      fetchNotifications()
    } catch (err) {
      taskStore.showToast('Lỗi', 'error')
    }
  }
}

onMounted(fetchNotifications)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s; }
.content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
.glass-card { padding: 24px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
h3 { margin-bottom: 20px; color: var(--primary-dark, #117c75); font-size: 1.1rem; }
.form-group { margin-bottom: 16px; }
.checkbox-group { display: flex; align-items: center; gap: 8px; }
.checkbox-group label { margin-bottom: 0; cursor: pointer; }
label { display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 0.9rem; }
.form-control { width: 100%; padding: 10px 14px; background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; color: var(--text-primary); font-family: inherit; }
.btn-primary { width: 100%; background: #117c75; color: #000; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }

.notif-list { display: flex; flex-direction: column; gap: 16px; }
.notif-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid transparent; border: 1px solid var(--border-color); }
.border-info { border-left-color: #3b82f6; }
.border-success { border-left-color: #10b981; }
.border-warning { border-left-color: #f59e0b; }
.border-error { border-left-color: #ef4444; }

.notif-content { flex: 1; margin-right: 16px; }
.notif-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
h4 { margin: 0; font-size: 1.05rem; color: var(--text-primary); }
p { margin: 0 0 8px 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4; }
.notif-date { font-size: 0.8rem; color: var(--text-muted); }

.status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
.status-badge.active { background: rgba(16, 185, 129, 0.15); color: #059669; }
.status-badge.inactive { background: #f1f5f9; color: var(--text-muted); }

.btn-sm { padding: 6px 12px; font-size: 0.8rem; background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 6px; cursor: pointer; }
.btn-sm:hover { background: #ef4444; color: white; }
.empty-state { text-align: center; color: var(--text-muted); padding: 32px; }
</style>
