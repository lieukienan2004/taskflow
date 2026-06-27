<template>
  <div class="pomodoro-page">
    <div class="pomo-main">
      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button v-for="m in modes" :key="m.key" class="mode-tab" :class="{ active: mode === m.key }" @click="switchMode(m.key)">
          <span class="mode-icon" v-html="m.icon"></span>
          {{ m.label }}
        </button>
      </div>

      <!-- Timer Circle -->
      <div class="timer-wrapper">
        <div class="timer-ring" :class="{ running: isRunning, break: mode !== 'work' }">
          <svg viewBox="0 0 260 260">
            <circle class="ring-bg" cx="130" cy="130" r="120" />
            <circle class="ring-progress" cx="130" cy="130" r="120" :style="{ strokeDashoffset: dashOffset }" />
          </svg>
          <div class="timer-center">
            <div class="timer-digits">{{ formatTime(timeLeft) }}</div>
            <div class="timer-label">{{ isRunning ? (mode === 'work' ? 'Tập trung' : 'Nghỉ ngơi') : 'Sẵn sàng' }}</div>
          </div>
        </div>
        <!-- Pulse rings when running -->
        <div v-if="isRunning" class="pulse-ring r1"></div>
        <div v-if="isRunning" class="pulse-ring r2"></div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <button v-if="!isRunning" class="btn-main btn-start" @click="startTimer">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><polygon points="5,3 19,12 5,21"/></svg>
          Bắt đầu
        </button>
        <template v-else>
          <button class="btn-main btn-pause" @click="pauseTimer">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            Tạm dừng
          </button>
          <button class="btn-main btn-reset" @click="resetTimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Đặt lại
          </button>
        </template>
        <button v-if="isRunning" class="btn-main btn-skip" @click="skipSession">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><polygon points="5,4 15,12 5,20"/><rect x="15" y="4" width="4" height="16"/></svg>
          Bỏ qua
        </button>
      </div>

      <!-- Session Info -->
      <div class="session-info">
        <div class="info-card">
          <div class="info-value">{{ sessionsCompleted }}</div>
          <div class="info-label">Phiên hoàn thành</div>
        </div>
        <div class="info-card">
          <div class="info-value">{{ totalTimeFocused }}</div>
          <div class="info-label">Tổng thời gian</div>
        </div>
        <div class="info-card">
          <div class="info-value">{{ currentStreak }}</div>
          <div class="info-label">Chuỗi liên tiếp</div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Settings + History -->
    <div class="pomo-side">
      <!-- Settings -->
      <div class="panel settings-panel">
        <div class="panel-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Cài đặt</span>
        </div>
        <div class="settings-grid">
          <div class="setting-item">
            <label>Giờ làm (phút)</label>
            <div class="stepper">
              <button @click="adjustSetting('work', -5)">-</button>
              <span>{{ settings.work }}</span>
              <button @click="adjustSetting('work', 5)">+</button>
            </div>
          </div>
          <div class="setting-item">
            <label>Nghỉ ngắn (phút)</label>
            <div class="stepper">
              <button @click="adjustSetting('shortBreak', -5)">-</button>
              <span>{{ settings.shortBreak }}</span>
              <button @click="adjustSetting('shortBreak', 5)">+</button>
            </div>
          </div>
          <div class="setting-item">
            <label>Nghỉ dài (phút)</label>
            <div class="stepper">
              <button @click="adjustSetting('longBreak', -5)">-</button>
              <span>{{ settings.longBreak }}</span>
              <button @click="adjustSetting('longBreak', 5)">+</button>
            </div>
          </div>
          <div class="setting-item">
            <label>Nghỉ dài sau</label>
            <div class="stepper">
              <button @click="adjustSetting('longBreakInterval', -1)">-</button>
              <span>{{ settings.longBreakInterval }}</span>
              <button @click="adjustSetting('longBreakInterval', 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Today History -->
      <div class="panel history-panel">
        <div class="panel-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Phiên hôm nay</span>
        </div>
        <div v-if="history.length === 0" class="empty-history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>Chưa có phiên nào hôm nay</p>
        </div>
        <div v-else class="history-list">
          <div v-for="(h, i) in history" :key="i" class="history-item" :class="h.type">
            <div class="history-dot"></div>
            <div class="history-info">
              <span class="history-type">{{ h.type === 'work' ? 'Làm việc' : 'Nghỉ' }}</span>
              <span class="history-time">{{ h.duration }} phút</span>
            </div>
            <span class="history-clock">{{ h.clock }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted, watch } from 'vue'

const modes = [
  { key: 'work', label: 'Làm việc', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
  { key: 'shortBreak', label: 'Nghỉ ngắn', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' },
  { key: 'longBreak', label: 'Nghỉ dài', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' }
]

const settings = reactive({
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4
})

const mode = ref('work')
const timeLeft = ref(settings.work * 60)
const isRunning = ref(false)
const sessionsCompleted = ref(0)
const currentStreak = ref(0)
const history = ref([])
let interval = null

const totalTime = computed(() => {
  if (mode.value === 'work') return settings.work * 60
  if (mode.value === 'shortBreak') return settings.shortBreak * 60
  return settings.longBreak * 60
})

const dashOffset = computed(() => {
  const circumference = 2 * Math.PI * 120
  const progress = timeLeft.value / totalTime.value
  return circumference * (1 - progress)
})

const totalTimeFocused = computed(() => {
  const mins = history.value.filter(h => h.type === 'work').reduce((s, h) => s + h.duration, 0)
  if (mins < 60) return mins + 'p'
  return Math.floor(mins / 60) + 'g' + (mins % 60) + 'p'
})

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function startTimer() {
  isRunning.value = true
  interval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(interval)
      isRunning.value = false
      onSessionComplete()
    }
  }, 1000)
}

function pauseTimer() {
  clearInterval(interval)
  isRunning.value = false
}

function resetTimer() {
  clearInterval(interval)
  isRunning.value = false
  timeLeft.value = totalTime.value
}

function skipSession() {
  clearInterval(interval)
  isRunning.value = false
  onSessionComplete()
}

function onSessionComplete() {
  const now = new Date()
  const clock = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  if (mode.value === 'work') {
    sessionsCompleted.value++
    currentStreak.value++
    history.value.unshift({
      type: 'work',
      duration: settings.work,
      clock
    })
    saveHistory()

    if (sessionsCompleted.value % settings.longBreakInterval === 0) {
      switchMode('longBreak')
    } else {
      switchMode('shortBreak')
    }
  } else {
    history.value.unshift({
      type: 'break',
      duration: mode.value === 'shortBreak' ? settings.shortBreak : settings.longBreak,
      clock
    })
    switchMode('work')
  }
}

function switchMode(m) {
  clearInterval(interval)
  isRunning.value = false
  mode.value = m
  if (m === 'work') timeLeft.value = settings.work * 60
  else if (m === 'shortBreak') timeLeft.value = settings.shortBreak * 60
  else timeLeft.value = settings.longBreak * 60
}

function adjustSetting(key, delta) {
  settings[key] = Math.max(5, Math.min(60, settings[key] + delta))
  if (!isRunning.value && ((key === 'work' && mode.value === 'work') || (key === 'shortBreak' && mode.value === 'shortBreak') || (key === 'longBreak' && mode.value === 'longBreak'))) {
    timeLeft.value = settings[key] * 60
  }
  localStorage.setItem('pomo_settings', JSON.stringify(settings))
}

function saveHistory() {
  const today = new Date().toDateString()
  const data = { date: today, sessions: sessionsCompleted.value, history: history.value }
  localStorage.setItem('pomo_history', JSON.stringify(data))
}

function loadHistory() {
  try {
    const data = JSON.parse(localStorage.getItem('pomo_history'))
    if (data && data.date === new Date().toDateString()) {
      sessionsCompleted.value = data.sessions || 0
      history.value = data.history || []
      currentStreak.value = sessionsCompleted.value
    }
  } catch {}
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('pomo_settings'))
    if (saved) Object.assign(settings, saved)
    timeLeft.value = settings.work * 60
  } catch {}
}

loadSettings()
loadHistory()

onUnmounted(() => { if (interval) clearInterval(interval) })
</script>

<style scoped>
.pomodoro-page {
  display: flex;
  gap: 28px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 0;
}
.pomo-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* ===== MODE TABS ===== */
.mode-tabs {
  display: flex;
  gap: 6px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 5px;
}
.mode-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.mode-tab:hover { color: #0f172a; background: rgba(17,124,117,0.06); }
.mode-tab.active { background: #117c75; color: #fff; box-shadow: 0 2px 12px rgba(17,124,117,0.3); }
.mode-tab .mode-icon { display: flex; align-items: center; }

/* ===== TIMER RING ===== */
.timer-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.timer-ring {
  width: 260px;
  height: 260px;
  position: relative;
  filter: drop-shadow(0 0 20px rgba(17,124,117,0.15));
}
.timer-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 8; }
.ring-progress {
  fill: none;
  stroke: #117c75;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 753.98;
  transition: stroke-dashoffset 0.5s ease;
}
.timer-ring.break .ring-progress { stroke: #f59e0b; }
.timer-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.timer-digits {
  font-size: 3.2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}
.timer-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 4px;
}
.timer-ring.running { filter: drop-shadow(0 0 30px rgba(17,124,117,0.3)); }
.timer-ring.running.break { filter: drop-shadow(0 0 30px rgba(245,158,11,0.3)); }

/* Pulse rings */
.pulse-ring {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 2px solid rgba(17,124,117,0.2);
  animation: pulse-expand 2s ease-out infinite;
  pointer-events: none;
}
.pulse-ring.break { border-color: rgba(245,158,11,0.2); }
.pulse-ring.r2 { animation-delay: 1s; }
@keyframes pulse-expand {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.15); opacity: 0; }
}

/* ===== CONTROLS ===== */
.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.btn-main {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.btn-start {
  background: linear-gradient(135deg, #117c75, #0d9488);
  color: #fff;
  box-shadow: 0 4px 20px rgba(17,124,117,0.35);
  padding: 16px 40px;
  font-size: 1.05rem;
}
.btn-start:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(17,124,117,0.45); }
.btn-pause {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 4px 16px rgba(245,158,11,0.3);
}
.btn-pause:hover { transform: translateY(-1px); }
.btn-reset {
  background: rgba(100,116,139,0.1);
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.btn-reset:hover { background: rgba(100,116,139,0.15); }
.btn-skip {
  background: rgba(17,124,117,0.08);
  color: #117c75;
  border: 1px solid rgba(17,124,117,0.2);
}
.btn-skip:hover { background: rgba(17,124,117,0.14); }

/* ===== SESSION INFO ===== */
.session-info {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 480px;
}
.info-card {
  flex: 1;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 14px;
  text-align: center;
  transition: all 0.2s;
}
.info-card:hover { border-color: #117c75; transform: translateY(-2px); }
.info-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #117c75;
}
.info-label {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 4px;
}

/* ===== SIDE PANELS ===== */
.pomo-side {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.panel {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 18px;
}
.panel-header svg { color: #117c75; }

/* ===== SETTINGS ===== */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.setting-item label {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 6px;
}
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.stepper button {
  width: 34px;
  height: 36px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.stepper button:hover { background: #e2e8f0; color: #117c75; }
.stepper span {
  flex: 1;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

/* ===== HISTORY ===== */
.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px 0;
  color: #cbd5e1;
}
.empty-history p { font-size: 0.85rem; }
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.15s;
}
.history-item:hover { border-color: #e2e8f0; }
.history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #117c75;
  flex-shrink: 0;
}
.history-item.break .history-dot { background: #f59e0b; }
.history-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.history-type { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.history-time { font-size: 0.72rem; color: #94a3b8; }
.history-clock { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .pomodoro-page { flex-direction: column; align-items: center; }
  .pomo-side { width: 100%; max-width: 500px; flex-direction: row; flex-wrap: wrap; }
  .pomo-side .panel { flex: 1; min-width: 240px; }
}
@media (max-width: 600px) {
  .mode-tabs { flex-wrap: wrap; justify-content: center; }
  .mode-tab { padding: 8px 14px; font-size: 0.82rem; }
  .timer-wrapper { width: 240px; height: 240px; }
  .timer-ring { width: 220px; height: 220px; }
  .timer-digits { font-size: 2.6rem; }
  .session-info { flex-direction: column; }
  .btn-main { padding: 12px 20px; font-size: 0.88rem; }
  .pomo-side { flex-direction: column; }
}
</style>
