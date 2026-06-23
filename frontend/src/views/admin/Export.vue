<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">📤 Xuất Dữ liệu</h1>
        <p class="page-subtitle">Xuất toàn bộ dữ liệu hệ thống (Người dùng, Công việc, Subtask) ra file CSV</p>
      </div>
    </div>

    <div class="glass-card export-card">
      <div class="export-content">
        <div class="export-icon">📄</div>
        <div class="export-info">
          <h3>Xuất Dữ Liệu CSV</h3>
          <p>Tải xuống file chứa thông tin tất cả người dùng, công việc, và các subtask trên hệ thống. Dữ liệu có thể được dùng để phân tích hoặc báo cáo.</p>
        </div>
        <a :href="exportUrl" target="_blank" class="btn btn-primary export-btn">
          ⬇️ Tải xuống CSV
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { adminApi } from '@/api/adminApi'

const exportUrl = adminApi.getExportUrl()
</script>

<style scoped>
.admin-page {
  animation: fadeIn 0.4s ease both;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.export-card {
  padding: 40px;
  max-width: 700px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.export-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.export-icon {
  font-size: 4rem;
  background: rgba(17,124,117, 0.1);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.export-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.export-info p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.export-btn {
  margin-top: 20px;
  white-space: nowrap;
  background: linear-gradient(135deg, #c7a45a, #a37f3a);
  color: #000;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}

.export-btn:hover {
  background: linear-gradient(135deg, #dfc686, #b89554);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.3);
}

@media (max-width: 600px) {
  .export-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
