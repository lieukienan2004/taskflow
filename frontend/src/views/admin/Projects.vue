<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        </div>
        <div>
          <h1 class="page-title">Quản Lý Dự Án</h1>
          <p class="page-subtitle">{{ projects.length }} dự án trong hệ thống</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost" @click="fetchData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Làm mới
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" placeholder="Tìm dự án..." class="search-input" />
      </div>
    </div>

    <div class="projects-grid">
      <div class="project-card" v-for="p in filteredProjects" :key="p.id">
        <div class="pc-header">
          <div class="pc-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          </div>
          <div class="pc-info">
            <h3 class="pc-name">{{ p.name }}</h3>
            <p class="pc-desc">{{ p.description || 'Không có mô tả' }}</p>
          </div>
        </div>
        <div class="pc-stats">
          <div class="pc-stat">
            <span class="pc-stat-val">{{ p.member_count || 0 }}</span>
            <span class="pc-stat-label">Thành viên</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-val">{{ p.task_count || 0 }}</span>
            <span class="pc-stat-label">Công việc</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-val">{{ p.done_count || 0 }}</span>
            <span class="pc-stat-label">Hoàn thành</span>
          </div>
        </div>
        <div class="pc-progress">
          <div class="pc-bar-wrap">
            <div class="pc-bar" :style="{ width: (p.task_count > 0 ? (p.done_count / p.task_count * 100) : 0) + '%' }"></div>
          </div>
          <span class="pc-percent">{{ p.task_count > 0 ? Math.round(p.done_count / p.task_count * 100) : 0 }}%</span>
        </div>
        <div class="pc-footer">
          <div class="pc-owner">
            <div class="pc-owner-avatar">{{ p.owner_name?.charAt(0)?.toUpperCase() }}</div>
            <span>{{ p.owner_name || 'N/A' }}</span>
          </div>
          <span class="pc-date">{{ formatDate(p.created_at) }}</span>
        </div>
      </div>
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        <p>Không tìm thấy dự án nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/adminApi'

const projects = ref([])
const searchQuery = ref('')

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  const q = searchQuery.value.toLowerCase()
  return projects.value.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
})

const fetchData = async () => {
  try { const res = await adminApi.getProjects(); projects.value = res.data.data }
  catch (e) { console.error(e) }
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''

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

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; border: none; }
.btn-ghost { background: transparent; color: #64748b; }
.btn-ghost:hover { color: #117c75; background: #f0fdf8; }

.filters { display: flex; gap: 12px; padding: 12px 16px; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; }
.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; flex: 1; }
.search-box:focus-within { border-color: #117c75; box-shadow: 0 0 0 3px rgba(17,124,117,0.1); }
.search-input { border: none; outline: none; background: transparent; font-size: 0.85rem; color: #0f172a; width: 100%; font-family: inherit; }

.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.project-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s;
}
.project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

.pc-header { display: flex; gap: 12px; margin-bottom: 16px; }
.pc-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #117c75, #0d9488); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.pc-name { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
.pc-desc { font-size: 0.78rem; color: #64748b; margin: 4px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.pc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.pc-stat { padding: 10px; background: #f8fafc; border-radius: 10px; text-align: center; }
.pc-stat-val { font-size: 1.1rem; font-weight: 800; color: #0f172a; display: block; }
.pc-stat-label { font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; }

.pc-progress { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.pc-bar-wrap { flex: 1; height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.pc-bar { height: 100%; background: linear-gradient(90deg, #117c75, #0d9488); border-radius: 999px; transition: width 0.4s; }
.pc-percent { font-size: 0.75rem; font-weight: 700; color: #117c75; min-width: 32px; text-align: right; }

.pc-footer { display: flex; align-items: center; justify-content: space-between; }
.pc-owner { display: flex; align-items: center; gap: 8px; }
.pc-owner-avatar { width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(135deg, #6366f1, #4f46e5); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.7rem; }
.pc-footer span { font-size: 0.75rem; color: #64748b; }
.pc-date { font-size: 0.72rem; }

.empty-state { text-align: center; padding: 48px; color: #94a3b8; grid-column: 1 / -1; }
.empty-state p { margin-top: 12px; font-size: 0.88rem; }

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
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .project-card { padding: 16px; border-radius: 12px; }
  .pc-header { gap: 10px; margin-bottom: 12px; }
  .pc-icon { width: 36px; height: 36px; border-radius: 8px; }
  .pc-name { font-size: 0.92rem; }
  .pc-stats { gap: 6px; margin-bottom: 10px; }
  .pc-stat { padding: 8px 6px; }
  .pc-stat-val { font-size: 0.95rem; }
  .pc-stat-label { font-size: 0.6rem; }
  .pc-footer { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>
