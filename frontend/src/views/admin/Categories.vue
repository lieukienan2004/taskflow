<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🏷️ Quản Lý Danh Mục</h1>
        <p class="page-subtitle">Tạo và phân loại công việc</p>
      </div>
    </div>

    <div class="content-grid">
      <!-- Create form -->
      <div class="glass-card add-card">
        <h3>Thêm Danh Mục Mới</h3>
        <form @submit.prevent="handleAdd">
          <div class="form-group">
            <label>Tên danh mục</label>
            <input v-model="form.name" type="text" class="form-control" placeholder="VD: Công việc nhà" required />
          </div>
          <div class="form-group">
            <label>Màu sắc</label>
            <input v-model="form.color" type="color" class="form-control color-picker" />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">Thêm Danh Mục</button>
        </form>
      </div>

      <!-- List -->
      <div class="glass-card list-card">
        <h3>Danh Sách Danh Mục</h3>
        <div class="category-list">
          <div v-for="c in categories" :key="c.id" class="category-item">
            <div class="cat-info">
              <span class="color-dot" :style="{ backgroundColor: c.color }"></span>
              <span class="cat-name">{{ c.name }}</span>
            </div>
            <button class="btn btn-danger btn-sm" @click="handleDelete(c.id, c.name)">Xóa</button>
          </div>
          <div v-if="categories.length === 0" class="empty-state">Chưa có danh mục nào</div>
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
const categories = ref([])
const loading = ref(false)
const form = ref({ name: '', color: '#117c75' })

const fetchCategories = async () => {
  try {
    const res = await adminApi.getCategories()
    categories.value = res.data.data
  } catch (err) {
    taskStore.showToast('Lỗi tải danh mục', 'error')
  }
}

const handleAdd = async () => {
  if (!form.value.name) return
  loading.value = true
  try {
    await adminApi.createCategory(form.value)
    taskStore.showToast('Đã thêm danh mục', 'success')
    form.value.name = ''
    fetchCategories()
  } catch (err) {
    taskStore.showToast('Lỗi thêm danh mục', 'error')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id, name) => {
  if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
    try {
      await adminApi.deleteCategory(id)
      taskStore.showToast('Đã xóa danh mục', 'success')
      fetchCategories()
    } catch (err) {
      taskStore.showToast('Lỗi xóa danh mục', 'error')
    }
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s; }
.content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
.glass-card { padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; }
h3 { margin-bottom: 20px; color: #117c75; font-size: 1.1rem; }
.form-group { margin-bottom: 16px; }
label { display: block; margin-bottom: 8px; color: #a1a1aa; font-size: 0.9rem; }
.form-control { width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; }
.color-picker { padding: 4px 8px; height: 42px; cursor: pointer; }
.btn-primary { width: 100%; background: #117c75; color: #000; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }

.category-list { display: flex; flex-direction: column; gap: 12px; }
.category-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; }
.cat-info { display: flex; align-items: center; gap: 12px; }
.color-dot { width: 16px; height: 16px; border-radius: 50%; }
.cat-name { font-weight: 500; font-size: 1rem; }
.btn-sm { padding: 6px 12px; font-size: 0.8rem; background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 6px; cursor: pointer; }
.btn-sm:hover { background: #ef4444; color: white; }
.empty-state { text-align: center; color: #a1a1aa; padding: 32px; }

@media (max-width: 768px) {
  .admin-page { gap: 12px; padding: 0; }
  .page-header { padding: 1rem; }
  .page-title { font-size: 1.1rem; }
  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .glass-card { padding: 16px; border-radius: 12px; }
  h3 { font-size: 0.95rem; margin-bottom: 14px; }
  .form-group { margin-bottom: 12px; }
  .form-control {
    min-height: 44px;
    padding: 10px 14px;
    font-size: 16px;
  }
  .color-picker { height: 44px; padding: 4px 8px; }
  .btn-primary { min-height: 44px; padding: 12px; font-size: 1rem; }
  .category-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }
  .btn-sm {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    font-size: 0.85rem;
  }
}
</style>
