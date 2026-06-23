<template>
  <div class="focus-room-container">
    <!-- Header -->
    <div class="focus-header">
      <h1>🎵 Không Gian Tập Trung Pomodoro</h1>
      <p class="subtitle">Kết hợp thiền Pomodoro và âm thanh Lofi tự nhiên giúp kích thích sóng não và tối ưu hiệu suất.</p>
    </div>

    <div class="focus-workspace-grid">
      <!-- LEFT PANEL: Circular Timer -->
      <div class="timer-panel glass-card">
        <!-- Task Selection Dropdown -->
        <div class="task-selector-wrapper">
          <label class="panel-label">🎯 Bạn đang tập trung thực hiện việc gì?</label>
          <select v-model="selectedTaskId" class="task-select" :disabled="timerRunning">
            <option value="">-- Chọn công việc từ danh sách --</option>
            <option v-for="t in activeTasks" :key="t.id" :value="t.id">
              {{ getTaskPriorityEmoji(t.priority) }} {{ t.title }}
            </option>
          </select>
        </div>

        <!-- Glowing Circular Countdown Timer -->
        <div class="timer-display-circle">
          <svg class="circular-svg" viewBox="0 0 200 200">
            <circle class="circle-bg" cx="100" cy="100" r="85"></circle>
            <circle 
              class="circle-progress" 
              :style="{ strokeDashoffset: strokeDashoffset }"
              cx="100" 
              cy="100" 
              r="85"
            ></circle>
          </svg>
          <div class="timer-content">
            <span class="time-text">{{ formattedTime }}</span>
            <span class="session-label">{{ currentSessionName }}</span>
          </div>
        </div>

        <!-- Timer Controls -->
        <div class="timer-controls">
          <button @click="toggleTimer" class="control-btn play-btn" :class="{ 'paused': timerRunning }">
            {{ timerRunning ? 'Tạm Dừng' : 'Bắt Đầu Tập Trung' }}
          </button>
          <button @click="resetTimer" class="control-btn reset-btn" :disabled="!timerRunning && timeLeft === currentSessionDuration">
            Đặt Lại
          </button>
        </div>

        <!-- Session Modes Selection -->
        <div class="session-modes">
          <button 
            @click="setSessionMode('pomodoro')" 
            class="mode-btn" 
            :class="{ active: currentMode === 'pomodoro' }"
            :disabled="timerRunning"
          >
            🧠 Tập Trung (25p)
          </button>
          <button 
            @click="setSessionMode('short_break')" 
            class="mode-btn" 
            :class="{ active: currentMode === 'short_break' }"
            :disabled="timerRunning"
          >
            ☕ Nghỉ Ngắn (5p)
          </button>
          <button 
            @click="setSessionMode('long_break')" 
            class="mode-btn" 
            :class="{ active: currentMode === 'long_break' }"
            :disabled="timerRunning"
          >
            🌴 Nghỉ Dài (15p)
          </button>
        </div>
      </div>

      <!-- RIGHT PANEL: Lofi Soundscape & Distraction Logger -->
      <div class="sound-distraction-panel">
        
        <!-- Study Resources Widget -->
        <div v-if="selectedTaskId && taskAttachments.length > 0" class="resources-card glass-card" style="margin-bottom: 20px;">
          <h3>📚 Tài Liệu Học Tập Đi Kèm</h3>
          <p class="section-desc">Mở nhanh các tài liệu liên kết để học tập trong ca Pomodoro này.</p>

          <div class="focus-resources-list">
            <div v-for="att in taskAttachments" :key="att.id" class="focus-resource-row">
              <span class="resource-emoji">{{ getFileIconEmoji(att.filetype) }}</span>
              <div class="resource-info">
                <span class="resource-name" :title="att.filename">{{ att.filename }}</span>
              </div>
              <a 
                v-if="att.filetype === 'url'" 
                :href="att.filepath" 
                target="_blank" 
                class="resource-open-btn"
              >
                🌐 Mở Link
              </a>
              <a 
                v-else 
                :href="attachmentApi.downloadUrl(selectedTaskId, att.id)" 
                download 
                class="resource-open-btn"
              >
                📥 Tải Về
              </a>
            </div>
          </div>
        </div>

        <!-- Ambient Soundscape Player -->
        <div class="soundscape-card glass-card">
          <h3>🎧 Âm thanh Môi trường Thư giãn</h3>
          <p class="section-desc">Bật/tắt các âm thanh nền để tạo không gian cách âm hoàn hảo cho não bộ.</p>

          <div class="sounds-list">
            <div 
              v-for="sound in ambientSounds" 
              :key="sound.id" 
              class="sound-row"
              :class="{ 'sound-active': sound.isPlaying }"
            >
              <span class="sound-emoji">{{ sound.emoji }}</span>
              <div class="sound-info">
                <span class="sound-name">{{ sound.name }}</span>
                <span class="sound-status">{{ sound.isPlaying ? 'Đang phát' : 'Đã tắt' }}</span>
              </div>
              <div class="sound-controls">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  v-model="sound.volume" 
                  @input="adjustVolume(sound)"
                  class="volume-slider"
                  :disabled="!sound.isPlaying"
                />
                <button @click="toggleSound(sound)" class="sound-play-toggle-btn">
                  {{ sound.isPlaying ? '⏸' : '▶' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Distraction & Focus Quality Logger -->
        <div class="distraction-card glass-card">
          <h3>🚫 Trình Nhật Ký Phân Tâm</h3>
          <p class="section-desc">Mỗi khi bạn bị xao nhãng bởi Facebook, điện thoại... hãy nhấp nút này để ghi nhận kỷ luật.</p>

          <div class="distraction-body">
            <div class="distraction-stats">
              <div class="dist-stat-box">
                <span class="dist-stat-val">{{ distractionsCount }}</span>
                <span class="dist-stat-lbl">Lần phân tâm</span>
              </div>
              <div class="dist-stat-box">
                <span class="dist-stat-val" :style="{ color: focusQualityColor }">{{ focusQualityScore }}%</span>
                <span class="dist-stat-lbl">Chỉ số tập trung</span>
              </div>
            </div>

            <button 
              @click="logDistraction" 
              class="distract-btn"
              :disabled="!timerRunning || currentMode !== 'pomodoro'"
            >
              🚫 Tôi vừa bị phân tâm!
            </button>
            <small class="distract-tip" v-if="!timerRunning">Bắt đầu phiên tập trung để có thể ghi nhận phân tâm.</small>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { attachmentApi } from '@/api/taskApi'

const taskStore = useTaskStore()
const authStore = useAuthStore()

// State
const selectedTaskId = ref('')
const timerRunning = ref(false)
const taskAttachments = ref([])

const getFileIconEmoji = (filetype) => {
  if (filetype === 'url') return '🌐'
  if (!filetype) return '📁'
  if (filetype.includes('pdf')) return '📄'
  if (filetype.includes('word') || filetype.includes('officedocument.wordprocessingml')) return '📝'
  if (filetype.includes('excel') || filetype.includes('sheet')) return '📊'
  if (filetype.includes('image')) return '🖼️'
  return '📁'
}

const fetchSelectedTaskAttachments = async () => {
  if (!selectedTaskId.value) {
    taskAttachments.value = []
    return
  }
  try {
    const res = await attachmentApi.getAll(selectedTaskId.value)
    taskAttachments.value = res.data.data
  } catch (err) {
    console.error('Lỗi tải tài liệu đính kèm của task:', err)
  }
}

watch(selectedTaskId, fetchSelectedTaskAttachments)
const currentMode = ref('pomodoro') // pomodoro, short_break, long_break
const timeLeft = ref(25 * 60)
const distractionsCount = ref(0)

let timerInterval = null

// Circle SVG math
const strokeDasharray = 2 * Math.PI * 85 // 534
const strokeDashoffset = computed(() => {
  const duration = currentSessionDuration.value
  const progress = (duration - timeLeft.value) / duration
  return strokeDasharray * (1 - progress)
})

const activeTasks = computed(() => {
  return taskStore.tasks.filter(t => t.status !== 'done')
})

const currentSessionDuration = computed(() => {
  if (currentMode.value === 'short_break') return 5 * 60
  if (currentMode.value === 'long_break') return 15 * 60
  return 25 * 60
})

const currentSessionName = computed(() => {
  if (currentMode.value === 'short_break') return 'Giải Lao Ngắn'
  if (currentMode.value === 'long_break') return 'Giải Lao Dài'
  return 'Thời Gian Tập Trung'
})

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// Focus Quality Score
const focusQualityScore = computed(() => {
  if (distractionsCount.value === 0) return 100
  return Math.max(0, 100 - distractionsCount.value * 15)
})

const focusQualityColor = computed(() => {
  const score = focusQualityScore.value
  if (score >= 80) return '#10b981' // Green
  if (score >= 50) return '#f59e0b' // Orange
  return '#ef4444' // Red
})

// Ambient Audio Tracks State
const ambientSounds = ref([
  {
    id: 'lofi',
    name: 'Nhạc Lofi Chill',
    emoji: '🎧',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // royalty free track
    volume: 0.5,
    isPlaying: false,
    audioElement: null
  },
  {
    id: 'rain',
    name: 'Tiếng Mưa Rơi',
    emoji: '🌧️',
    url: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav', // royalty free loop wav
    volume: 0.4,
    isPlaying: false,
    audioElement: null
  },
  {
    id: 'birds',
    name: 'Tiếng Chim Hót',
    emoji: '🌲',
    url: 'https://assets.mixkit.co/active_storage/sfx/1127/1127-84.wav',
    volume: 0.3,
    isPlaying: false,
    audioElement: null
  }
])

onMounted(async () => {
  if (taskStore.tasks.length === 0) {
    await taskStore.fetchTasks()
  }
  timeLeft.value = currentSessionDuration.value
})

onUnmounted(() => {
  clearInterval(timerInterval)
  // Stop all active ambient playbacks
  ambientSounds.value.forEach(s => {
    if (s.audioElement) {
      s.audioElement.pause()
      s.audioElement = null
    }
  })
})

const setSessionMode = (mode) => {
  currentMode.value = mode
  timeLeft.value = currentSessionDuration.value
  timerRunning.value = false
  clearInterval(timerInterval)
}

const toggleTimer = () => {
  if (timerRunning.value) {
    // Pause
    timerRunning.value = false
    clearInterval(timerInterval)
  } else {
    // Start
    timerRunning.value = true
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        handleSessionComplete()
      }
    }, 1000)
  }
}

const resetTimer = () => {
  timerRunning.value = false
  clearInterval(timerInterval)
  timeLeft.value = currentSessionDuration.value
  distractionsCount.value = 0
}

const logDistraction = () => {
  if (timerRunning.value && currentMode.value === 'pomodoro') {
    distractionsCount.value++
    taskStore.showToast('⚠️ Đã ghi nhận phân tâm. Hãy hít sâu thở đều tập trung lại nhé!', 'warning')
  }
}

const handleSessionComplete = () => {
  timerRunning.value = false
  clearInterval(timerInterval)
  
  if (currentMode.value === 'pomodoro') {
    // Award rewards based on Focus Quality Score
    const finalScore = focusQualityScore.value
    const xpReward = finalScore >= 80 ? 50 : finalScore >= 50 ? 30 : 15
    const goldCoinsEarned = finalScore >= 80 ? 20 : finalScore >= 50 ? 10 : 5
    
    // Save rewards in LocalStorage RPG Profile
    const userId = authStore.user ? authStore.user.id : 'guest'
    const rpgSavedKey = `taskflow_rpg_profile_${userId}`
    const savedProfile = localStorage.getItem(rpgSavedKey)
    
    let profile = { goldCoins: 0 }
    if (savedProfile) {
      try {
        profile = JSON.parse(savedProfile)
      } catch (e) {}
    }
    
    profile.goldCoins = (profile.goldCoins || 0) + goldCoinsEarned
    localStorage.setItem(rpgSavedKey, JSON.stringify(profile))

    taskStore.showToast(`🎉 HOÀN THÀNH PHIÊN TẬP TRUNG! +${xpReward} XP & +${goldCoinsEarned} 🪙 Vàng! Điểm tập trung: ${finalScore}%`, 'success')
  } else {
    taskStore.showToast('🌴 Đã hết thời gian giải lao. Hãy sẵn sàng quay trở lại công việc nhé!', 'info')
  }

  // Switch modes automatically
  if (currentMode.value === 'pomodoro') {
    setSessionMode('short_break')
  } else {
    setSessionMode('pomodoro')
  }
}

// Ambient Audio Operations
const toggleSound = (sound) => {
  if (sound.isPlaying) {
    // Stop
    sound.isPlaying = false
    if (sound.audioElement) {
      sound.audioElement.pause()
    }
  } else {
    // Play
    sound.isPlaying = true
    if (!sound.audioElement) {
      sound.audioElement = new Audio(sound.url)
      sound.audioElement.loop = true
    }
    sound.audioElement.volume = sound.volume
    sound.audioElement.play().catch(e => {
      console.warn('Lỗi trình duyệt chặn tự phát âm thanh:', e)
    })
  }
}

const adjustVolume = (sound) => {
  if (sound.audioElement) {
    sound.audioElement.volume = sound.volume
  }
}

const getTaskPriorityEmoji = (p) => {
  if (p === 'high') return '🔴'
  if (p === 'low') return '🟢'
  return '🟠'
}
</script>

<style scoped>
.focus-room-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.focus-header {
  margin-bottom: 24px;
}

.focus-header h1 {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary, #94a3b8);
  margin: 0;
}

/* Glass Card */
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  padding: 24px;
}

/* 2-Column Grid Layout */
.focus-workspace-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .focus-workspace-grid {
    grid-template-columns: 1fr;
  }
}

/* Left Panel: Timer */
.timer-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.task-selector-wrapper {
  width: 100%;
  text-align: left;
}

.panel-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.task-select {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  padding: 10px 14px;
  outline: none;
  font-size: 14px;
  cursor: pointer;
}

.task-select:focus {
  border-color: var(--accent, #2dd4bf);
}

/* Circular SVG Timer Display */
.timer-display-circle {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 10px 0;
}

.circular-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.03);
  stroke-width: 6;
}

.circle-progress {
  fill: none;
  stroke: var(--accent, #2dd4bf);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 534; /* 2 * PI * 85 */
  transition: stroke-dashoffset 0.3s linear;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.6));
}

.timer-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.time-text {
  font-size: 46px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  font-feature-settings: "tnum"; /* Tabular numbers for perfect alignment */
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

.session-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--accent, #2dd4bf);
  font-weight: 700;
  margin-top: 8px;
}

/* Controls */
.timer-controls {
  display: flex;
  gap: 12px;
  width: 100%;
}

.control-btn {
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.play-btn {
  flex: 2;
  background: var(--accent, #2dd4bf);
  color: #1a1a2e;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);
}

.play-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.play-btn.paused {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: none;
}

.reset-btn {
  flex: 1;
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #f43f5e;
}

.reset-btn:hover:not(:disabled) {
  background: #f43f5e;
  color: #ffffff;
}

.reset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Session modes selectors */
.session-modes {
  display: flex;
  gap: 8px;
  width: 100%;
}

.mode-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.mode-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.mode-btn.active {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: var(--accent, #2dd4bf);
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Right Column: Sounds & Distractions */
.sound-distraction-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.soundscape-card h3, .distraction-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.section-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* Sounds List Rows */
.sounds-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sound-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 14px;
  gap: 14px;
  transition: all 0.3s ease;
}

.sound-row.sound-active {
  background: rgba(251, 191, 36, 0.03);
  border-color: rgba(251, 191, 36, 0.15);
}

.sound-emoji {
  font-size: 22px;
  line-height: 1;
}

.sound-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sound-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.sound-status {
  font-size: 11px;
  color: #64748b;
}

.sound-row.sound-active .sound-status {
  color: var(--accent, #2dd4bf);
  font-weight: 500;
}

.sound-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-slider {
  width: 70px;
  height: 4px;
  accent-color: var(--accent, #2dd4bf);
  cursor: pointer;
}

.sound-play-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #e2e8f0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.sound-play-toggle-btn:hover {
  background: var(--accent, #2dd4bf);
  color: #1a1a2e;
}

/* Distraction card body */
.distraction-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.distraction-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.dist-stat-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.dist-stat-val {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
}

.dist-stat-lbl {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.distract-btn {
  width: 100%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-weight: 600;
  font-size: 13px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.distract-btn:hover:not(:disabled) {
  background: #ef4444;
  color: white;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.distract-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.distract-tip {
  font-size: 11px;
  color: #475569;
  text-align: center;
}

/* Light Theme styles overrides inside focus room specifically */
:global(.light-theme) .task-select {
  background: var(--input-bg) !important;
}
:global(.light-theme) .timer-display-circle .time-text {
  color: #1a1a2e;
}
:global(.light-theme) .timer-display-circle .circle-bg {
  stroke: rgba(0, 0, 0, 0.03);
}
:global(.light-theme) .mode-btn {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .mode-btn.active {
  background: rgba(184, 134, 11, 0.08);
}
:global(.light-theme) .sound-row {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .dist-stat-box {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .dist-stat-val {
  color: #1a1a2e;
}
:global(.light-theme) .sound-play-toggle-btn {
  background: rgba(0, 0, 0, 0.04);
  color: #1a1a2e;
}
:global(.light-theme) .sound-play-toggle-btn:hover {
  background: #0e6b64;
  color: #ffffff;
}

/* Focus room resources styling */
.focus-resources-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.focus-resource-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.3s ease;
}
.focus-resource-row:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}
.resource-emoji {
  font-size: 1.25rem;
}
.resource-info {
  flex: 1;
  min-width: 0;
}
.resource-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resource-open-btn {
  background: linear-gradient(135deg, rgba(17,124,117, 0.15) 0%, rgba(17,124,117, 0.05) 100%);
  border: 1px solid rgba(17,124,117, 0.3);
  color: #117c75;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.resource-open-btn:hover {
  background: #117c75;
  color: #0d1220;
}
</style>
