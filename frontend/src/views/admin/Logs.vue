<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <h1 class="page-title">Nhật Ký Hoạt Động</h1>
          <p class="page-subtitle">{{ filteredLogs.length }} bản ghi gần đây</p>
        </div>
      </div>
      <button class="btn btn-ghost" @click="fetchLogs">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Làm mới
      </button>
    </div>

    <div class="filters">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" placeholder="Tìm theo hành động, người dùng..." class="search-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="f in actionFilters" :key="f.value" :class="['filter-tab', { active: actionFilter === f.value }]" @click="actionFilter = f.value">
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th style="width:170px">Thời gian</th>
              <th>Người thực hiện</th>
              <th>Hành động</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="cell-id">#{{ log.id }}</td>
              <td class="cell-time">{{ formatTime(log.created_at) }}</td>
              <td>
                <div v-if="log.user_name" class="user-cell">
                  <div class="avatar-mini">{{ log.user_name.charAt(0).toUpperCase() }}</div>
                  <div class="user-meta">
                    <span class="name">{{ log.user_name }}</span>
                    <span class="email">{{ log.user_email }}</span>
                  </div>
                </div>
                <span v-else class="system-label">Hệ thống</span>
              </td>
              <td>
                <span class="action-badge" :class="getActionClass(log.action)">
                  {{ formatAction(log.action) }}
                </span>
              </td>
              <td class="details-cell">
                <pre class="details-json" v-if="log.details">{{ formatDetails(log.details) }}</pre>
                <span v-else class="no-detail">-</span>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="5" class="empty-row">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p>Chưa có bản ghi nhật ký</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/adminApi'

const logs = ref([])
const searchQuery = ref('')
const actionFilter = ref('')

const filteredLogs = computed(() => {
  let list = [...logs.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.user_name?.toLowerCase().includes(q) ||
      l.user_email?.toLowerCase().includes(q)
    )
  }
  if (actionFilter.value) {
    if (actionFilter.value === 'create') list = list.filter(l => l.action?.includes('CREATE'))
    else if (actionFilter.value === 'delete') list = list.filter(l => l.action?.includes('DELETE'))
    else if (actionFilter.value === 'update') list = list.filter(l => l.action?.includes('UPDATE') || l.action?.includes('CHANGE') || l.action?.includes('TOGGLE'))
    else if (actionFilter.value === 'auth') list = list.filter(l => l.action?.includes('LOGIN') || l.action?.includes('LOGOUT') || l.action?.includes('REGISTER'))
    else if (actionFilter.value === 'system') list = list.filter(l => l.action?.includes('BACKUP') || l.action?.includes('EXPORT') || l.action?.includes('SETTINGS'))
  }
  return list
})

const actionFilters = [
  { value: '', label: 'Tất cả' },
  { value: 'create', label: 'Tạo' },
  { value: 'update', label: 'Cập nhật' },
  { value: 'delete', label: 'Xóa' },
  { value: 'auth', label: 'Đăng nhập' },
  { value: 'system', label: 'Hệ thống' },
]

const fetchLogs = async () => {
  try { const res = await adminApi.getLogs(); logs.value = res.data.data } catch (e) { console.error(e) }
}

const getActionClass = (action) => {
  if (action?.includes('CREATE')) return 'badge-success'
  if (action?.includes('DELETE')) return 'badge-danger'
  if (action?.includes('UPDATE') || action?.includes('CHANGE') || action?.includes('TOGGLE')) return 'badge-warning'
  if (action?.includes('LOGIN') || action?.includes('REGISTER')) return 'badge-info'
  return 'badge-default'
}

const formatAction = (action) => action?.replace(/_/g, ' ') || ''

const formatTime = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatDetails = (s) => { try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s } }

onMounted(fetchLogs)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }

.page-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.78rem; color: #64748b; margin: 2px 0 0; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; border: none; }
.btn-ghost { background: transparent; color: #64748b; }
.btn-ghost:hover { color: #117c75; background: #f0fdf8; }

.filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; }
.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; flex: 1; min-width: 200px; }
.search-box:focus-within { border-color: #117c75; box-shadow: 0 0 0 3px rgba(17,124,117,0.1); }
.search-input { border: none; outline: none; background: transparent; font-size: 0.85rem; color: #0f172a; width: 100%; font-family: inherit; }
.filter-tabs { display: flex; gap: 6px; }
.filter-tab { padding: 7px 14px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.filter-tab:hover { border-color: #cbd5e1; color: #334155; }
.filter-tab.active { background: #f0fdf8; border-color: #117c75; color: #117c75; }

.table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
.table-responsive { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; text-align: left; }
.admin-table td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; vertical-align: middle; }
.admin-table tr:hover td { background: #f8fafc; }
.cell-id { font-weight: 600; color: #94a3b8; }
.cell-time { font-size: 0.8rem; color: #64748b; white-space: nowrap; }

.user-cell { display: flex; align-items: center; gap: 8px; }
.avatar-mini { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg, #475569, #334155); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.72rem; flex-shrink: 0; }
.user-meta .name { font-weight: 600; color: #0f172a; font-size: 0.82rem; display: block; }
.user-meta .email { font-size: 0.72rem; color: #94a3b8; }
.system-label { color: #94a3b8; font-style: italic; font-size: 0.82rem; }

.action-badge { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.badge-success { background: #f0fdf8; color: #059669; border: 1px solid #d1fae5; }
.badge-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-warning { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.badge-info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.badge-default { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

.details-cell { max-width: 280px; }
.details-json { margin: 0; padding: 6px 8px; background: #f8fafc; border-radius: 6px; font-size: 0.72rem; color: #475569; border: 1px solid #e2e8f0; white-space: pre-wrap; word-break: break-all; max-height: 80px; overflow-y: auto; font-family: 'SF Mono', 'Consolas', monospace; }
.no-detail { color: #cbd5e1; }
.empty-row { text-align: center; padding: 40px !important; color: #94a3b8; }
.empty-row p { margin-top: 10px; font-size: 0.85rem; }

@media (max-width: 768px) {
  .admin-page { gap: 12px; padding: 0; }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 1rem;
  }
  .page-header .btn { width: 100%; justify-content: center; min-height: 44px; }
  .page-title { font-size: 1.1rem; }
  .filters {
    flex-direction: column;
    padding: 10px;
  }
  .search-box { min-width: 0; }
  .search-input { min-height: 44px; font-size: 16px; }
  .filter-tabs {
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }
  .filter-tab {
    flex: 1;
    min-height: 44px;
    padding: 10px 8px;
    font-size: 0.75rem;
  }
  .table-card { border-radius: 12px; }
  .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .admin-table th { padding: 10px 10px; font-size: 0.7rem; }
  .admin-table td { padding: 10px 10px; font-size: 0.8rem; }
  .user-cell { flex-direction: column; align-items: flex-start; gap: 4px; }
  .cell-time { font-size: 0.72rem; }
  .details-cell { max-width: 180px; }
}
</style>
