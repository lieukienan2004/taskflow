<template>
  <div class="focus-mode-container">
    <!-- Floating Button -->
    <button v-if="!isActive" class="floating-btn focus-btn" @click="toggleFocusMode" title="Không Gian Thiền">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 18v-6a9 9 0 0118 0v6"/>
        <path d="M21 19a2 2 0 01-2 2h-1v-3a2 2 0 012-2h1zM3 19a2 2 0 002 2h1v-3a2 2 0 00-2-2H3z"/>
      </svg>
    </button>

    <!-- Fullscreen Overlay -->
    <transition name="fade">
      <div v-if="isActive" class="focus-overlay">
        <div class="focus-content">
          <h2 class="focus-title">Không Gian Thiền</h2>
          <p class="focus-subtitle">Tập trung cao độ. Loại bỏ mọi phân tâm.</p>
          
          <!-- Premium Task Selector inside Zen Mode (if not running) -->
          <div class="task-focus-selector" v-if="!isRunning">
            <label class="selector-label">🎯 Bạn muốn tập trung vào công việc nào?</label>
            <select v-model="selectedTaskId" class="premium-task-select">
              <option value="">-- Tập trung tự do (Không liên kết task) --</option>
              <option v-for="task in activeTasks" :key="task.id" :value="task.id">
                {{ task.title }} ({{ getPriorityEmoji(task.priority) }})
              </option>
            </select>
          </div>

          <!-- Active Task Spotlight & Complete directly inside Zen Mode -->
          <div class="active-focus-task-card glass-card" v-if="selectedTask">
            <span class="active-task-label">🎯 Mục tiêu hiện tại</span>
            <h4 class="active-task-title">{{ selectedTask.title }}</h4>
            <button class="btn btn-premium-complete" @click="completeFocusedTask">
              ✓ Đánh dấu hoàn thành ngay
            </button>
          </div>
          
          <div class="timer-container">
            <svg class="timer-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4"/>
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="#117c75" stroke-width="4" 
                stroke-linecap="round"
                :stroke-dasharray="`${strokeDash} 283`"
                transform="rotate(-90 50 50)"
                style="transition: stroke-dasharray 1s linear; filter: drop-shadow(0 0 8px rgba(17,124,117, 0.6));"
              />
            </svg>
            <div class="timer-text">{{ formattedTime }}</div>
          </div>

          <div class="timer-controls">
            <button class="control-btn" @click="toggleTimer">
              <svg v-if="!isRunning" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="control-btn" @click="resetTimer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
          
          <button class="btn btn-secondary exit-btn" @click="toggleFocusMode">
            Thoát Không Gian
          </button>
        </div>

        <!-- Hidden YouTube Iframe for Lofi Music -->
        <div class="lofi-player" v-if="isRunning">
          <iframe 
            width="0" height="0" 
            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1" 
            frameborder="0" 
            allow="autoplay">
          </iframe>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import confetti from '@/utils/confettiHelper'

const isActive = ref(false)
const isRunning = ref(false)
const totalTime = 25 * 60 // 25 phút
const timeLeft = ref(totalTime)
let timerInterval = null

const selectedTaskId = ref('')

const activeTasks = computed(() => {
  return taskStore.tasks.filter(t => t.status !== 'done')
})

const selectedTask = computed(() => {
  return taskStore.tasks.find(t => t.id === selectedTaskId.value) || null
})

const getPriorityEmoji = (p) => {
  return p === 'high' ? '🔴 Cao' : p === 'low' ? '🟢 Thấp' : '🟠 Trung bình'
}

const completeFocusedTask = async () => {
  if (!selectedTaskId.value) return
  try {
    await taskStore.changeStatus(selectedTaskId.value, 'done')
    selectedTaskId.value = ''
    
    // extra confetti and level up/victory chime!
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    })
  } catch (e) {
    console.error(e)
  }
}

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const strokeDash = computed(() => {
  return (timeLeft.value / totalTime) * 283
})

const toggleFocusMode = () => {
  isActive.value = !isActive.value
  if (!isActive.value) {
    pauseTimer()
  }
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      pauseTimer()
      // Play a sound when done and trigger confetti!
      audioService.playLevelUpSound()
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })
      taskStore.showToast('🏆 Tuyệt vời! Bạn đã hoàn thành 1 chu kỳ Pomodoro 25 phút tập trung!')
      resetTimer()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  clearInterval(timerInterval)
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = totalTime
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.floating-btn.focus-btn {
  position: fixed;
  bottom: 90px; /* Above chat widget */
  right: 24px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #050508, #1a1a24);
  border: 1px solid rgba(17,124,117, 0.4);
  color: #117c75;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 15px rgba(17,124,117, 0.2);
  transition: all 0.3s ease;
  z-index: 100;
}
.floating-btn.focus-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0,0,0,0.6), 0 0 20px rgba(17,124,117, 0.4);
}
.floating-btn.focus-btn svg { width: 24px; height: 24px; }

/* Overlay */
.focus-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: #050508;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.focus-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.focus-title {
  font-size: 2.5rem;
  color: #117c75;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-shadow: 0 0 20px rgba(17,124,117, 0.3);
}

.focus-subtitle {
  color: #a1a1aa;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

/* Timer */
.timer-container {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 20px 0;
}
.timer-svg {
  width: 100%;
  height: 100%;
}
.timer-text {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.timer-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.control-btn {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.control-btn:hover {
  background: rgba(17,124,117, 0.15);
  border-color: rgba(17,124,117, 0.4);
  color: #117c75;
  transform: scale(1.05);
}
.control-btn svg { width: 24px; height: 24px; }

.exit-btn {
  padding: 12px 30px;
  font-size: 1rem;
  margin-top: 20px;
}

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* --- Focus Mode Task Selector & Active Task Card Styles --- */
.task-focus-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 380px;
  margin-bottom: 15px;
  text-align: left;
}
.selector-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #117c75;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(17,124,117, 0.2);
}
.premium-task-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(17,124,117, 0.3);
  border-radius: var(--radius-md);
  color: #f8fafc;
  padding: 10px 14px;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 14px;
  padding-right: 40px;
}
.premium-task-select:hover {
  border-color: #117c75;
  background: rgba(17,124,117, 0.05);
}
.premium-task-select option {
  background-color: #050508;
  color: #f8fafc;
}

.active-focus-task-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 380px;
  padding: 16px;
  border-color: rgba(17,124,117, 0.25) !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(17,124,117, 0.02) 100%);
  text-align: center;
  border-radius: var(--radius-md);
  animation: fadeIn 0.4s ease both;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  margin-bottom: 10px;
}
.active-task-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #117c75;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.active-task-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  word-break: break-word;
}
.btn-premium-complete {
  background: linear-gradient(135deg, #14b8a6 0%, #34d399 100%);
  border: none;
  color: #050508;
  padding: 10px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(52, 211, 153, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-premium-complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 211, 153, 0.4);
  filter: brightness(1.1);
}
</style>
