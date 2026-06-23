<template>
  <div class="chat-root">
    <Transition name="chat-slide">
      <div v-if="isOpen" class="chat-panel">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="ai-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a4 4 0 014 4c0 2-2 4-4 4s-4-2-4-4 2-4 4-4z"/><path d="M16 14c2 2 4 3 4 5v1H4v-1c0-2 2-3 4-5"/></svg>
            </div>
            <div>
              <div class="chat-title">Cố vấn AI</div>
              <div class="chat-subtitle"><span class="status-dot"></span> Sẵn sàng trợ giúp</div>
            </div>
          </div>
          <div class="chat-header-actions">
            <button class="chat-action-btn" @click="clearChat" title="Xóa hội thoại">🗑️</button>
            <button class="chat-action-btn" @click="isOpen = false" title="Đóng">✕</button>
          </div>
        </div>

        <div class="chat-messages" ref="messagesEl">
          <div v-if="messages.length === 0" class="chat-welcome">
            <div class="welcome-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h4>Xin chào! Tôi là Cố vấn AI</h4>
            <p>Tôi sẽ đồng hành hỗ trợ bạn sắp xếp công việc, lập kế hoạch, tối ưu thời gian biểu và đưa ra giải pháp chống trì hoãn!</p>
            <div class="quick-actions">
              <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="sendQuick(q)">{{ q }}</button>
            </div>
          </div>

          <div v-for="(msg, i) in messages" :key="i" :class="['message', msg.role]">
            <div v-if="msg.role === 'assistant'" class="msg-avatar">🎓</div>
            <div class="msg-bubble">
              <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
              <div v-if="msg.actions?.length" class="msg-actions-notice">
                <span v-for="action in msg.actions" :key="action.type" class="action-chip">{{ actionLabel(action) }}</span>
              </div>
              <div class="msg-time">{{ msg.time }}</div>
            </div>
          </div>

          <div v-if="loading" class="message assistant">
            <div class="msg-avatar">🎓</div>
            <div class="msg-bubble typing-bubble"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="chat-input-wrap">
            <textarea v-model="inputText" ref="inputEl" class="chat-input" placeholder="Nhập tin nhắn..." rows="1" @keydown.enter.exact.prevent="sendMessage" @keydown.shift.enter="() => {}" @input="autoResize" :disabled="loading"></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || loading">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div class="chat-footer-note">Có thể tạo/sửa công việc · Gemini</div>
        </div>
      </div>
    </Transition>

    <button class="chat-fab" @click="toggleChat" :class="{ open: isOpen }">
      <Transition name="fab-icon" mode="out-in">
        <svg v-if="!isOpen" key="open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <svg v-else key="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </Transition>
      <span v-if="!isOpen && unreadCount > 0" class="fab-badge">{{ unreadCount }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import api from '@/api/taskApi'

const store = useTaskStore()
const router = useRouter()
const isOpen = ref(false)
const inputText = ref('')
const loading = ref(false)
const messages = ref([])
const messagesEl = ref(null)
const inputEl = ref(null)
const unreadCount = ref(0)

const navigateToRoute = (routeName) => { try { router.push({ name: routeName }) } catch (e) {} }
const triggerAIAnalysis = () => { isOpen.value = true; inputText.value = 'Hãy phân tích tiến độ và hiệu suất công việc hiện tại của tôi trên hệ thống.'; nextTick(() => sendMessage()) }

onMounted(() => { window.navigateToRoute = navigateToRoute; window.triggerAIAnalysis = triggerAIAnalysis })
onUnmounted(() => { delete window.navigateToRoute; delete window.triggerAIAnalysis })

const quickQuestions = ['🎯 Lập kế hoạch dự án', '⏱️ Pomodoro & Ưu tiên', '📊 Đánh giá hiệu suất', '📋 Hôm nay nên làm gì?']

const toggleChat = () => { isOpen.value = !isOpen.value; if (isOpen.value) { unreadCount.value = 0; nextTick(() => inputEl.value?.focus()) } }
const clearChat = () => { messages.value = [] }
const autoResize = (e) => { const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
const scrollToBottom = () => { nextTick(() => { if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight }) }
const now = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const sendQuick = (text) => { inputText.value = text; sendMessage() }

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  messages.value.push({ role: 'user', content: text, time: now() })
  inputText.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  scrollToBottom()
  loading.value = true
  try {
    const history = messages.value.map(m => ({ role: m.role, content: m.content }))
    const res = await api.post('/ai/coach', { message: text, history: history.slice(0, -1) })
    const { role, content, actions } = res.data.data
    messages.value.push({ role: 'assistant', content, actions: actions || [], time: now() })
    if (actions && actions.some(act => act.type === 'task_created')) store.fetchTasks()
    if (!isOpen.value) unreadCount.value++
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `❌ **Lỗi:** ${e.response?.data?.message || 'Không kết nối được AI.'}`, time: now() })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const actionLabel = (action) => {
  switch (action.type) {
    case 'task_created': return `✅ Đã tạo: "${action.task?.title}"`
    case 'task_updated': return `🔄 Đã cập nhật`
    case 'task_deleted': return `🗑️ Đã xóa`
    default: return ''
  }
}

const renderMarkdown = (text) => {
  if (!text) return ''
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const withRouteLinks = escaped.replace(/\[([^\]]+)\]\(route:\/\/([a-zA-Z0-9_-]+)\)/g, '<button class="chat-route-link-btn" onclick="window.navigateToRoute(\'$2\')">$1</button>')
  const withInline = withRouteLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>')
  const lines = withInline.split('\n')
  let html = ''
  let inList = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (/^### /.test(line)) { if (inList) { html += '</ul>'; inList = false } html += `<h4>${line.slice(4)}</h4>` }
    else if (/^## /.test(line)) { if (inList) { html += '</ul>'; inList = false } html += `<h3>${line.slice(3)}</h3>` }
    else if (/^---/.test(line) || /^\*\*\*/.test(line)) { if (inList) { html += '</ul>'; inList = false } html += '<div class="hr"></div>' }
    else if (/^- /.test(line)) { if (!inList) { html += '<ul>'; inList = true } html += `<li>${line.slice(2)}</li>` }
    else if (/^\d+\.\s/.test(line)) { if (inList) { html += '</ul>'; inList = false } html += `<p class="num-item"><span class="num-marker">${line.match(/^\d+/)[0]}.</span>${line.replace(/^\d+\.\s*/, '')}</p>` }
    else if (line === '') { if (inList) { html += '</ul>'; inList = false } }
    else { if (inList) { html += '</ul>'; inList = false } html += `<p>${line}</p>` }
  }
  if (inList) html += '</ul>'
  return html
}
</script>

<style scoped>
.chat-root {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-panel {
  width: 380px;
  height: 560px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
  animation: panelIn 0.25s ease;
}
@keyframes panelIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

.chat-header {
  padding: 14px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.chat-header-info { display: flex; align-items: center; gap: 10px; }
.ai-avatar {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #5eead4, #117c75);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.chat-title { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.chat-subtitle { font-size: 0.7rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 1px; }
.status-dot { width: 5px; height: 5px; background: #22c55e; border-radius: 50%; }
.chat-header-actions { display: flex; gap: 4px; }
.chat-action-btn {
  width: 28px; height: 28px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.chat-action-btn:hover { background: #f1f5f9; color: #475569; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fafafa;
  scroll-behavior: smooth;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.chat-welcome {
  text-align: center;
  padding: 32px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.welcome-icon { margin-bottom: 4px; }
.chat-welcome h4 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
.chat-welcome p { font-size: 0.78rem; color: #64748b; line-height: 1.5; margin: 0; max-width: 300px; }
.quick-actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px; }
.quick-btn {
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.quick-btn:hover { border-color: #5eead4; color: #0e6b64; background: #e6f7f5; }

.message { display: flex; gap: 8px; align-items: flex-start; animation: msgIn 0.2s ease; }
@keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.message.user { flex-direction: row-reverse; }
.msg-avatar { font-size: 1.1rem; flex-shrink: 0; margin-top: 2px; }
.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.82rem;
  line-height: 1.55;
}
.message.user .msg-bubble {
  background: linear-gradient(135deg, #5eead4, #117c75);
  color: white;
  border-bottom-right-radius: 4px;
}
.message.assistant .msg-bubble {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-bottom-left-radius: 4px;
  color: #334155;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.msg-content :deep(strong) { color: #117c75; font-weight: 700; }
.msg-content :deep(code) { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 0.82em; color: #117c75; }
.msg-content :deep(p) { margin: 4px 0; line-height: 1.6; }
.msg-content :deep(p:first-child) { margin-top: 0; }
.msg-content :deep(p:last-child) { margin-bottom: 0; }
.msg-content :deep(ul) { margin: 4px 0; padding-left: 0; list-style: none; }
.msg-content :deep(li) { margin: 3px 0; padding-left: 16px; position: relative; line-height: 1.5; }
.msg-content :deep(li)::before { content: '•'; position: absolute; left: 2px; color: #5eead4; font-weight: 700; }
.msg-content :deep(h3), .msg-content :deep(h4) { margin: 10px 0 4px; font-weight: 700; color: #1e293b; }
.msg-content :deep(h3) { font-size: 0.88rem; }
.msg-content :deep(h4) { font-size: 0.84rem; }
.msg-content :deep(.hr) { height: 1px; background: #e2e8f0; margin: 8px 0; }
.msg-content :deep(.num-item) { margin: 3px 0; line-height: 1.5; }
.msg-content :deep(.num-marker) { display: inline; font-weight: 700; color: #117c75; margin-right: 4px; }
.message.assistant .msg-content :deep(strong) { color: #117c75; }
.message.user .msg-content :deep(strong) { color: #2dd4bf; }
.message.user .msg-content :deep(code) { background: rgba(255,255,255,0.15); color: #ccfbf1; }
.message.user .msg-content :deep(li)::before { color: #2dd4bf; }
.message.user .msg-content :deep(.num-marker) { color: #2dd4bf; }
.message.user .msg-content :deep(h3), .message.user .msg-content :deep(h4) { color: white; }
.message.user .msg-content :deep(.hr) { background: rgba(255,255,255,0.15); }

.chat-route-link-btn {
  display: inline-block;
  padding: 5px 10px;
  background: #e6f7f5;
  border: 1px solid #ccfbf1;
  border-radius: 8px;
  color: #117c75;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  margin: 4px 2px;
  transition: all 0.15s;
}
.chat-route-link-btn:hover { background: #e6f7f5; border-color: #2dd4bf; transform: translateY(-1px); }

.msg-time { font-size: 0.62rem; color: #94a3b8; margin-top: 5px; }
.message.user .msg-time { text-align: right; color: rgba(255,255,255,0.6); }

.msg-actions-notice { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.action-chip {
  font-size: 0.68rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 2px 8px;
  border-radius: 8px;
}

.typing-bubble { display: flex; gap: 4px; align-items: center; padding: 12px 16px; }
.typing-bubble span {
  width: 6px; height: 6px;
  background: #cbd5e1;
  border-radius: 50%;
  animation: typing 1.4s ease infinite;
}
.typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-5px); opacity: 1; }
}

.chat-input-area {
  padding: 10px 14px 12px;
  border-top: 1px solid #f0f0f0;
  background: #ffffff;
  flex-shrink: 0;
}
.chat-input-wrap {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 6px 6px 12px;
  transition: border-color 0.15s;
}
.chat-input-wrap:focus-within { border-color: #5eead4; background: #ffffff; }
.chat-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #1e293b;
  font-family: inherit;
  font-size: 0.82rem;
  line-height: 1.5;
  resize: none;
  max-height: 100px;
  min-height: 20px;
}
.chat-input::placeholder { color: #94a3b8; }
.send-btn {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #5eead4, #117c75);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 2px 8px rgba(17,124,117,0.3); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.chat-footer-note { text-align: center; font-size: 0.62rem; color: #94a3b8; margin-top: 5px; }

.chat-fab {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5eead4, #117c75);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(17,124,117,0.35);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  flex-shrink: 0;
  margin-top: 12px;
}
.chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(17,124,117,0.5); }
.chat-fab.open { background: linear-gradient(135deg, #64748b, #475569); box-shadow: 0 4px 12px rgba(0,0,0,0.2); transform: rotate(90deg); }
.fab-badge {
  position: absolute;
  top: -3px; right: -3px;
  min-width: 18px; height: 18px;
  background: #ef4444;
  color: white;
  border-radius: 9px;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
}
.fab-icon-enter-active, .fab-icon-leave-active { transition: all 0.15s ease; }
.fab-icon-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
.fab-icon-leave-to { opacity: 0; transform: rotate(90deg) scale(0.5); }

@media (max-width: 768px) {
  .chat-root {
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .chat-fab {
    width: 56px;
    height: 56px;
  }
  .chat-fab svg { width: 24px; height: 24px; }

  .chat-panel {
    position: fixed;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0;
    z-index: 9999;
  }

  .chat-header { padding: 12px 14px; }
  .chat-messages { padding: 12px; gap: 8px; }
  .msg-bubble { font-size: 0.78rem; padding: 8px 12px; }
  .msg-time { font-size: 0.58rem; }

  .chat-welcome { padding: 24px 12px 12px; }
  .chat-welcome h4 { font-size: 0.88rem; }
  .chat-welcome p { font-size: 0.74rem; }
  .quick-btn { font-size: 0.68rem; padding: 5px 10px; }

  .chat-input-area { padding: 8px 12px 10px; }
  .chat-input-wrap { padding: 4px 4px 4px 10px; min-height: 44px; }
  .chat-input { font-size: 0.8rem; }
  .send-btn { width: 34px; height: 34px; }

  .chat-title { font-size: 0.82rem; }
  .chat-subtitle { font-size: 0.68rem; }
}

@media (max-width: 480px) {
  .chat-root {
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }

  .chat-panel {
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0;
  }

  .chat-fab {
    width: 52px;
    height: 52px;
  }

  .quick-actions { gap: 4px; }
  .quick-btn { font-size: 0.65rem; padding: 4px 8px; }
}
</style>
