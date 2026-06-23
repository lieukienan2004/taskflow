<template>
  <div class="ai-bar">
    <div class="ai-inner">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
      </svg>
      <input
        v-model="commandText"
        @keyup.enter="handleSendCommand"
        :placeholder="placeholderText"
        :disabled="loading"
        class="ai-input"
        ref="inputRef"
      />
      <button
        @click="handleSendCommand"
        class="ai-btn"
        :disabled="!commandText.trim() || loading"
      >
        <div class="spinner" v-if="loading"></div>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
    <div class="ai-error" v-if="errorMessage">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { aiApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

const commandText = ref('')
const loading = ref(false)
const errorMessage = ref('')
const inputRef = ref(null)

const placeholderText = ref("Tạo nhanh công việc bằng Trí tuệ Nhân tạo AI...")

// Dynamic placeholder typing text
const placeholders = [
  "Thêm công việc bằng AI... Ví dụ: 'Chiều mai 3h họp chuyên đề khóa luận, ưu tiên cao'",
  "Gõ câu nói của bạn... Ví dụ: 'Đi siêu thị mua đồ ăn lúc 8h tối nay'",
  "Tự động đặt lịch... Ví dụ: 'Thứ hai tuần sau nộp báo cáo chương 1 cho thầy'",
  "AI tự động nhận diện... Ví dụ: 'Nhắc tôi đi chạy bộ lúc 5h chiều hằng ngày, độ ưu tiên thấp'"
]

let placeholderInterval = null
let currentIdx = 0

onMounted(() => {
  placeholderInterval = setInterval(() => {
    currentIdx = (currentIdx + 1) % placeholders.length
    placeholderText.value = placeholders[currentIdx]
  }, 6000)
})

onUnmounted(() => {
  if (placeholderInterval) clearInterval(placeholderInterval)
})

const handleSendCommand = async () => {
  if (!commandText.value.trim() || loading.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const text = commandText.value.trim()
    const res = await aiApi.quickTask(text)
    
    if (res.data && res.data.success) {
      // Clear input
      commandText.value = ''
      
      // Refresh tasks list
      await taskStore.fetchTasks()
      
      // Success Notification
      taskStore.showToast(res.data.message || '✅ Đã thêm công việc thành công!', 'success')
      
      // Visual sparkle blur on input focus
      if (inputRef.value) {
        inputRef.value.blur()
        setTimeout(() => inputRef.value.focus(), 150)
      }
    } else {
      errorMessage.value = res.data.message || 'Không thể nhận diện cú pháp AI.'
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = err.response?.data?.message || 'Lỗi kết nối máy chủ AI. Vui lòng kiểm tra lại API Key Gemini của bạn.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ai-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ai-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
}
.ai-inner:focus-within {
  border-color: #c4b5fd;
  box-shadow: 0 0 0 3px rgba(17,124,117,0.06);
}
.ai-input {
  flex: 1;
  background: none;
  border: none;
  color: #0f172a;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  padding: 0;
}
.ai-input::placeholder {
  color: #94a3b8;
  font-style: italic;
}
.ai-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #e6f7f5;
  color: #117c75;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  transition: all 0.15s ease;
}
.ai-btn:hover:not(:disabled) {
  background: #117c75;
  color: #fff;
}
.ai-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.spinner {
  width: 13px;
  height: 13px;
  border: 1.5px solid #ccfbf1;
  border-top-color: #117c75;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.ai-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  background: #fef2f2;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #b91c1c;
}
.ai-error button {
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  padding: 2px;
}
</style>
