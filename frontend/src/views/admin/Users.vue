<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div>
          <h1 class="page-title">Quản Lý Người Dùng</h1>
          <p class="page-subtitle">{{ filteredUsers.length }} người dùng trong hệ thống</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportCSV">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Xuất CSV
        </button>
        <button class="btn btn-ghost" @click="fetchData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Làm mới
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" placeholder="Tìm theo tên hoặc email..." class="search-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="f in roleFilters" :key="f.value" :class="['filter-tab', { active: roleFilter === f.value }]" @click="roleFilter = f.value">
          {{ f.label }}
          <span class="tab-count">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Công việc</th>
              <th>Ngày tham gia</th>
              <th style="width:180px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-banned': u.is_banned }">
              <td class="cell-id">#{{ u.id }}</td>
              <td>
                <div class="user-cell">
                  <img v-if="u.avatar" :src="getAvatar(u.avatar)" class="avatar" />
                  <div v-else class="avatar-placeholder">{{ u.name?.charAt(0)?.toUpperCase() }}</div>
                  <div class="user-meta">
                    <span class="user-name">{{ u.name }}</span>
                    <span v-if="u.is_banned" class="badge badge-banned">Đã chặn</span>
                  </div>
                </div>
              </td>
              <td class="cell-email">{{ u.email }}</td>
              <td>
                <select v-model="u.role" @change="changeRole(u.id, u.role)" class="role-select" :class="u.role" :disabled="u.id === currentUser.id">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </td>
              <td><span class="task-count">{{ u.total_tasks || 0 }}</span></td>
              <td class="cell-date">{{ formatDate(u.created_at) }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon btn-info" @click="viewDetail(u)" title="Xem chi tiết">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button v-if="u.id !== currentUser.id" class="btn-icon" :class="u.is_banned ? 'btn-unban' : 'btn-ban'" @click="toggleBan(u)" :title="u.is_banned ? 'Bỏ chặn' : 'Chặn'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  </button>
                  <button v-if="u.id !== currentUser.id" class="btn-icon btn-delete" @click="deleteUser(u.id, u.name)" title="Xóa">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0 && !loading">
              <td colspan="7" class="empty-row">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                <p>Không tìm thấy người dùng</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Chi tiết Người dùng</h3>
            <button class="modal-close" @click="showDetail = false">&times;</button>
          </div>
          <div class="modal-body" v-if="detailUser">
            <div class="detail-top">
              <img v-if="detailUser.avatar" :src="getAvatar(detailUser.avatar)" class="detail-avatar" />
              <div v-else class="detail-avatar-placeholder">{{ detailUser.name?.charAt(0)?.toUpperCase() }}</div>
              <div class="detail-info">
                <h2 class="detail-name">{{ detailUser.name }}</h2>
                <p class="detail-email">{{ detailUser.email }}</p>
                <span class="role-badge" :class="detailUser.role">{{ detailUser.role }}</span>
              </div>
            </div>
            <div class="detail-stats">
              <div class="dstat">
                <div class="dstat-val">{{ detailUser.task_stats?.total || 0 }}</div>
                <div class="dstat-label">Tổng CV</div>
              </div>
              <div class="dstat dstat-done">
                <div class="dstat-val">{{ detailUser.task_stats?.completed || 0 }}</div>
                <div class="dstat-label">Hoàn thành</div>
              </div>
              <div class="dstat dstat-progress">
                <div class="dstat-val">{{ detailUser.task_stats?.in_progress || 0 }}</div>
                <div class="dstat-label">Đang làm</div>
              </div>
              <div class="dstat dstat-overdue">
                <div class="dstat-val">{{ detailUser.task_stats?.overdue || 0 }}</div>
                <div class="dstat-label">Quá hạn</div>
              </div>
            </div>
            <div class="detail-section" v-if="detailUser.projects?.length">
              <h4>Dự án tham gia</h4>
              <div class="detail-tags">
                <span v-for="p in detailUser.projects" :key="p.id" class="tag">{{ p.name }}</span>
              </div>
            </div>
            <div class="detail-section" v-if="detailUser.recent_tasks?.length">
              <h4>Công việc gần đây</h4>
              <div class="recent-task" v-for="t in detailUser.recent_tasks" :key="t.id">
                <span class="rt-status" :class="'st-' + t.status"></span>
                <span class="rt-title">{{ t.title }}</span>
                <span class="rt-priority" :class="'pr-' + t.priority">{{ t.priority }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { adminApi } from '@/api/adminApi'
import { getHost } from '@/utils/serverConfig'

const authStore = useAuthStore()
const taskStore = useTaskStore()
const currentUser = computed(() => authStore.user)

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const showDetail = ref(false)
const detailUser = ref(null)

const filteredUsers = computed(() => {
  let list = [...users.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }
  if (roleFilter.value) list = list.filter(u => u.role === roleFilter.value)
  return list
})

const roleFilters = computed(() => [
  { value: '', label: 'Tất cả', count: users.value.length },
  { value: 'admin', label: 'Admin', count: users.value.filter(u => u.role === 'admin').length },
  { value: 'manager', label: 'Manager', count: users.value.filter(u => u.role === 'manager').length },
  { value: 'user', label: 'User', count: users.value.filter(u => u.role === 'user').length },
])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUsers()
    users.value = res.data.data
  } catch (e) { taskStore.showToast('Lỗi tải dữ liệu', 'error') }
  finally { loading.value = false }
}

const changeRole = async (id, role) => {
  try { await adminApi.changeUserRole(id, role); taskStore.showToast('Đã cập nhật quyền', 'success') }
  catch (e) { taskStore.showToast('Lỗi khi đổi quyền', 'error'); fetchData() }
}

const toggleBan = async (u) => {
  const banned = !u.is_banned
  const msg = banned ? `Chặn "${u.name}"?` : `Bỏ chặn "${u.name}"?`
  if (!confirm(msg)) return
  try { await adminApi.toggleUserStatus(u.id, banned); u.is_banned = banned ? 1 : 0; taskStore.showToast(banned ? 'Đã chặn' : 'Đã bỏ chặn', 'success') }
  catch (e) { taskStore.showToast('Lỗi', 'error') }
}

const deleteUser = async (id, name) => {
  if (!confirm(`Xóa "${name}"? Hành động không thể hoàn tác.`)) return
  try { await adminApi.deleteUser(id); taskStore.showToast(`Đã xóa ${name}`, 'success'); fetchData() }
  catch (e) { taskStore.showToast('Lỗi khi xóa', 'error') }
}

const viewDetail = async (u) => {
  try {
    const res = await adminApi.getUserDetail(u.id)
    detailUser.value = res.data.data
    showDetail.value = true
  } catch (e) { taskStore.showToast('Lỗi tải chi tiết', 'error') }
}

const getAvatar = (avatar) => avatar?.startsWith('http') ? avatar : `${getHost() || 'http://localhost:3001'}${avatar}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''

const exportCSV = () => {
  if (!filteredUsers.value.length) return
  const csv = 'ID,Tên,Email,Quyền,Công việc,Ngày tham gia\n' + filteredUsers.value.map(u => `${u.id},"${u.name}",${u.email},${u.role},${u.total_tasks||0},${formatDate(u.created_at)}`).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `Users_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url)
}

onMounted(fetchData)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }

.page-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.78rem; color: #64748b; margin: 2px 0 0; }
.header-actions { display: flex; gap: 10px; }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: inherit; border: none;
}
.btn-outline { background: #fff; border: 1.5px solid #e2e8f0; color: #334155; }
.btn-outline:hover { border-color: #117c75; color: #117c75; background: #f0fdf8; }
.btn-ghost { background: transparent; color: #64748b; }
.btn-ghost:hover { color: #117c75; background: #f0fdf8; }

.filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; }
.search-box {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; flex: 1; min-width: 200px;
}
.search-box:focus-within { border-color: #117c75; box-shadow: 0 0 0 3px rgba(17,124,117,0.1); }
.search-input { border: none; outline: none; background: transparent; font-size: 0.85rem; color: #0f172a; width: 100%; font-family: inherit; }
.filter-tabs { display: flex; gap: 6px; }
.filter-tab {
  padding: 7px 14px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;
  color: #64748b; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  font-family: inherit; display: inline-flex; align-items: center; gap: 6px;
}
.filter-tab:hover { border-color: #cbd5e1; color: #334155; }
.filter-tab.active { background: #f0fdf8; border-color: #117c75; color: #117c75; }
.tab-count { font-size: 0.68rem; background: #e2e8f0; color: #64748b; padding: 1px 6px; border-radius: 999px; }
.filter-tab.active .tab-count { background: #d1fae5; color: #065f46; }

.table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.table-responsive { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; text-align: left; }
.admin-table td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; font-size: 0.88rem; vertical-align: middle; }
.admin-table tr:hover { background: #f8fafc; }
.row-banned { opacity: 0.5; }
.cell-id { font-weight: 600; color: #94a3b8; }
.cell-email { color: #64748b; }
.cell-date { color: #94a3b8; font-size: 0.82rem; }
.task-count { font-weight: 700; color: #0f172a; background: #f1f5f9; padding: 3px 10px; border-radius: 6px; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; }
.avatar-placeholder { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #117c75, #0d9488); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
.user-meta { display: flex; align-items: center; gap: 8px; }
.user-name { font-weight: 600; color: #0f172a; }
.badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
.badge-banned { background: #fef2f2; color: #dc2626; }

.role-select {
  padding: 5px 10px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; outline: none;
}
.role-select:focus { border-color: #117c75; }
.role-select.admin { border-color: #117c75; color: #117c75; }
.role-select.manager { border-color: #3b82f6; color: #3b82f6; }
.role-select.user { color: #64748b; }

.action-btns { display: flex; gap: 6px; }
.btn-icon {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
}
.btn-icon:hover { transform: translateY(-1px); }
.btn-info:hover { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
.btn-ban:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
.btn-unban:hover { background: #f0fdf8; border-color: #10b981; color: #10b981; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

.empty-row { text-align: center; padding: 40px !important; color: #94a3b8; }
.empty-row p { margin-top: 12px; font-size: 0.88rem; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.modal {
  background: #fff; border-radius: 20px; width: 90%; max-width: 560px; max-height: 85vh;
  overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.2);
}
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
.modal-close { width: 32px; height: 32px; border: none; background: #f1f5f9; border-radius: 8px; font-size: 1.2rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; }
.modal-close:hover { background: #e2e8f0; }

.modal-body { padding: 24px; }
.detail-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.detail-avatar { width: 64px; height: 64px; border-radius: 16px; object-fit: cover; border: 3px solid #e2e8f0; }
.detail-avatar-placeholder { width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #117c75, #0d9488); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 1.5rem; }
.detail-name { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; }
.detail-email { font-size: 0.82rem; color: #64748b; margin: 2px 0 8px; }
.role-badge { font-size: 0.72rem; padding: 3px 12px; border-radius: 999px; font-weight: 700; }
.role-badge.admin { background: #f0fdf8; color: #117c75; }
.role-badge.manager { background: #eff6ff; color: #3b82f6; }
.role-badge.user { background: #f1f5f9; color: #64748b; }

.detail-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
.dstat { padding: 14px 10px; background: #f8fafc; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
.dstat-val { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
.dstat-label { font-size: 0.68rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
.dstat-done .dstat-val { color: #10b981; }
.dstat-progress .dstat-val { color: #3b82f6; }
.dstat-overdue .dstat-val { color: #ef4444; }

.detail-section { margin-bottom: 16px; }
.detail-section h4 { font-size: 0.82rem; font-weight: 700; color: #334155; margin: 0 0 10px; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { padding: 4px 12px; background: #f0fdf8; color: #117c75; border-radius: 8px; font-size: 0.78rem; font-weight: 600; border: 1px solid #d1fae5; }

.recent-task { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
.recent-task:last-child { border: none; }
.rt-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.st-todo { background: #94a3b8; }
.st-in_progress { background: #3b82f6; }
.st-done { background: #10b981; }
.st-overdue { background: #ef4444; }
.rt-title { flex: 1; font-size: 0.82rem; color: #334155; }
.rt-priority { font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase; }
.pr-high { background: #fef2f2; color: #dc2626; }
.pr-medium { background: #fffbeb; color: #d97706; }
.pr-low { background: #f0fdf8; color: #059669; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; padding: 1rem; }
  .header-left { width: 100%; }
  .header-actions { width: 100%; }
  .header-actions .btn { flex: 1; justify-content: center; }
  .filters { flex-direction: column; gap: 10px; padding: 10px; }
  .search-box { min-width: 0; width: 100%; }
  .filter-tabs { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap; padding-bottom: 4px; }
  .filter-tab { white-space: nowrap; flex-shrink: 0; min-height: 38px; }
  .table-card { border-radius: 12px; }
  .admin-table th, .admin-table td { padding: 10px 10px; font-size: 0.78rem; }
  .action-btns { flex-wrap: nowrap; }
  .btn-icon { min-width: 34px; min-height: 34px; }
  .modal { width: 95%; max-width: none; border-radius: 16px; }
  .modal-header { padding: 16px; }
  .modal-body { padding: 16px; }
  .detail-top { flex-direction: column; text-align: center; }
  .detail-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
