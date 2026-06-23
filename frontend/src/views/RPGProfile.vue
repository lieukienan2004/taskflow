<template>
  <div class="rpg-profile-container" v-if="authStore.user">
    <!-- Header -->
    <div class="rpg-header">
      <h1>⚔️ Đấu Trường & Đồ Bản RPG</h1>
      <p class="subtitle">Biến việc hoàn thành nhiệm vụ thực tế thành sức mạnh phiêu lưu và thăng cấp chỉ số nhân vật của bạn!</p>
    </div>

    <!-- CLASS SELECTION SCREEN (If no class selected yet) -->
    <div v-if="!profile.classType" class="class-selection-container glass-card">
      <h2>🔮 Lựa chọn Hệ Anh Hùng của bạn</h2>
      <p class="selection-desc">Chọn một Lớp nhân vật để bắt đầu hành trình kỷ luật. Mỗi hệ sẽ có thuộc tính cơ bản tối ưu riêng!</p>

      <div class="classes-grid">
        <div 
          v-for="cls in classes" 
          :key="cls.type" 
          class="class-select-card"
          :class="cls.type"
          @click="selectClass(cls.type)"
        >
          <span class="class-icon-emoji">{{ cls.icon }}</span>
          <h3>{{ cls.name }}</h3>
          <p class="class-description">{{ cls.desc }}</p>
          <div class="class-bonus-badge">{{ cls.bonus }}</div>
        </div>
      </div>
    </div>

    <!-- MAIN RPG HUB (If class already selected) -->
    <div v-else class="rpg-workspace-grid">
      
      <!-- COLUMN 1: Character Stats Sheet -->
      <div class="character-sheet-card glass-card">
        <div class="profile-title-bar">
          <span class="class-avatar-emoji">{{ currentClassIcon }}</span>
          <div class="character-identity">
            <span class="rpg-active-title" v-if="profile.activeTitle">🏆 {{ profile.activeTitle }}</span>
            <span class="rpg-active-title unequipped" v-else>Chưa trang bị danh hiệu</span>
            <h3 class="character-name">{{ authStore.user.name }}</h3>
            <span class="character-class-badge">Hệ: {{ currentClassName }}</span>
          </div>
        </div>

        <!-- Experience Level Bar -->
        <div class="rpg-level-section">
          <div class="level-badge">Cấp {{ taskStore.level }}</div>
          <div class="xp-bar-wrapper">
            <div class="xp-bar-track">
              <div class="xp-bar-fill" :style="{ width: xpProgressPercent + '%' }"></div>
            </div>
            <div class="xp-stats">
              <span>Tiến độ kinh nghiệm</span>
              <span>{{ taskStore.xp % 300 }}/300 XP</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Attributes Radar Stats -->
        <h4 class="sheet-section-title">📊 Chỉ số Sức mạnh thuộc tính</h4>
        <div class="attributes-grid">
          <div class="attribute-box">
            <span class="attr-icon">⚔️</span>
            <div class="attr-details">
              <span class="attr-name">Sức mạnh (STR)</span>
              <div class="attr-bar-track">
                <div class="attr-bar-fill str" :style="{ width: Math.min(100, stats.str * 3) + '%' }"></div>
              </div>
              <span class="attr-value">{{ stats.str }} điểm</span>
            </div>
          </div>

          <div class="attribute-box">
            <span class="attr-icon">🔮</span>
            <div class="attr-details">
              <span class="attr-name">Trí tuệ (INT)</span>
              <div class="attr-bar-track">
                <div class="attr-bar-fill int" :style="{ width: Math.min(100, stats.int * 3) + '%' }"></div>
              </div>
              <span class="attr-value">{{ stats.int }} điểm</span>
            </div>
          </div>

          <div class="attribute-box">
            <span class="attr-icon">🔥</span>
            <div class="attr-details">
              <span class="attr-name">Thể lực (VIT)</span>
              <div class="attr-bar-track">
                <div class="attr-bar-fill vit" :style="{ width: Math.min(100, stats.vit * 3) + '%' }"></div>
              </div>
              <span class="attr-value">{{ stats.vit }} điểm</span>
            </div>
          </div>

          <div class="attribute-box">
            <span class="attr-icon">🎯</span>
            <div class="attr-details">
              <span class="attr-name">Ý chí (WIL)</span>
              <div class="attr-bar-track">
                <div class="attr-bar-fill wil" :style="{ width: Math.min(100, stats.wil * 3) + '%' }"></div>
              </div>
              <span class="attr-value">{{ stats.wil }} điểm</span>
            </div>
          </div>
        </div>

        <div class="reset-class-row">
          <button @click="resetClass" class="reset-class-btn">Chọn lại hệ nhân vật</button>
        </div>
      </div>

      <!-- COLUMN 2: Gold Shop & Inventory -->
      <div class="gold-shop-panel">
        
        <!-- Purse Card -->
        <div class="purse-card glass-card">
          <span class="purse-emoji">🪙</span>
          <div class="purse-info">
            <span class="purse-lbl">Tài sản hiện có</span>
            <span class="purse-val">{{ profile.goldCoins }} Vàng</span>
          </div>
          <small class="purse-tip">Hoàn thành nhiệm vụ hoặc Pomodoro để nhận thêm Vàng!</small>
        </div>

        <!-- Gold Items Shop -->
        <div class="shop-items-card glass-card">
          <h3>🛒 Cửa Hàng Vật Phẩm & Danh Hiệu Kỷ Luật</h3>
          <p class="section-desc">Sử dụng Tiền Vàng bạn kiếm được để mua sắm danh hiệu độc quyền trang bị bên cạnh tên của bạn.</p>

          <div class="shop-items-list">
            <div 
              v-for="item in shopItems" 
              :key="item.id" 
              class="shop-item-row"
              :class="{ 'item-owned': isOwned(item.id) }"
            >
              <span class="item-emoji">🏷️</span>
              <div class="item-details">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-desc">{{ item.desc }}</span>
              </div>
              
              <div class="item-shop-actions">
                <!-- If already owned, show equip/equipped button -->
                <template v-if="isOwned(item.id)">
                  <button 
                    v-if="profile.activeTitle === item.name" 
                    class="shop-btn btn-equipped" 
                    disabled
                  >
                    Đang dùng
                  </button>
                  <button 
                    v-else 
                    @click="equipTitle(item.name)" 
                    class="shop-btn btn-equip"
                  >
                    Trang bị
                  </button>
                </template>
                <!-- If not owned, show buy button -->
                <button 
                  v-else 
                  @click="purchaseItem(item)" 
                  class="shop-btn btn-buy"
                  :disabled="profile.goldCoins < item.cost"
                >
                  🪙 {{ item.cost }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'

const taskStore = useTaskStore()
const authStore = useAuthStore()

// State
const profile = ref({
  classType: '',
  goldCoins: 0,
  purchasedItems: [],
  activeTitle: ''
})

const classes = [
  { 
    type: 'knight', 
    name: 'Chiến binh (Knight)', 
    icon: '⚔️', 
    desc: 'Thiên về hành động mạnh mẽ, dứt khoát. Nhận chỉ số Sức mạnh (STR) vượt bậc.', 
    bonus: '+10 Sức mạnh ban đầu' 
  },
  { 
    type: 'mage', 
    name: 'Pháp sư (Mage)', 
    icon: '🔮', 
    desc: 'Thiên về học tập, nghiên cứu và sáng tạo ý tưởng. Nhận chỉ số Trí tuệ (INT) vượt bậc.', 
    bonus: '+10 Trí tuệ ban đầu' 
  },
  { 
    type: 'assassin', 
    name: 'Sát thủ (Assassin)', 
    icon: '🏹', 
    desc: 'Tập trung vào tốc độ hoàn thành nhanh và duy trì kỷ luật dài hạn. Nhận chỉ số Thể lực (VIT) vượt bậc.', 
    bonus: '+10 Thể lực ban đầu' 
  }
]

const shopItems = [
  { id: 'title_discipline', name: 'Kỷ Luật Thép', desc: 'Danh hiệu dành cho người hoàn thành nhiệm vụ xuất sắc.', cost: 60 },
  { id: 'title_pomodoro', name: 'Bậc Thầy Tập Trung', desc: 'Dành riêng cho các cao thủ Pomodoro.', cost: 100 },
  { id: 'title_warrior', name: 'Chiến Binh Kỷ Luật', desc: 'Trang bị danh hiệu oai nghiêm dũng mãnh.', cost: 160 },
  { id: 'title_archmage', name: 'Pháp Sư Tối Thượng', desc: 'Dành cho các học viên sáng tạo xuất sắc nhất.', cost: 220 },
  { id: 'title_thunder', name: 'Thần Sấm Pomodoro', desc: 'Danh hiệu tối thượng chói lọi trong thế giới TaskFlow.', cost: 300 }
]

const rpgKey = computed(() => {
  const userId = authStore.user ? authStore.user.id : 'guest'
  return `taskflow_rpg_profile_${userId}`
})

// Load Profile
const loadRPGProfile = () => {
  const saved = localStorage.getItem(rpgKey.value)
  if (saved) {
    try {
      profile.value = JSON.parse(saved)
      // Fix potential missing properties
      if (!profile.value.purchasedItems) profile.value.purchasedItems = []
      if (profile.value.goldCoins === undefined) profile.value.goldCoins = 0
    } catch (e) {
      console.error(e)
    }
  } else {
    // Fresh profile: start with 50 gold coins
    profile.value = {
      classType: '',
      goldCoins: 50,
      purchasedItems: [],
      activeTitle: ''
    }
    saveRPGProfile()
  }

  // Award Gold Coins for past tasks completed inside Pinia taskStore
  syncGoldWithCompletedTasks()
}

// Keep completed tasks synchronized with gold coins (award +10 gold for each completed task)
const syncGoldWithCompletedTasks = () => {
  const completedCount = taskStore.tasks.filter(t => t.status === 'done').length
  const calculatedGold = 50 + completedCount * 10
  
  // Only override if calculated gold is greater than currently stored gold (prevents double deducting if bought items)
  // Let's keep a history of spent gold:
  let totalSpent = 0
  profile.value.purchasedItems.forEach(itemId => {
    const matchedItem = shopItems.find(i => i.id === itemId)
    if (matchedItem) totalSpent += matchedItem.cost
  })

  // Current Gold = Base (50) + Earned (completed * 10) + Pomodoro (if any) - Spent
  // Since Pomodoro sessions directly write to goldCoins in localStorage, let's just make sure they don't lose gold!
  const currentStoredGold = profile.value.goldCoins || 0
  const baselineGold = Math.max(0, calculatedGold - totalSpent)
  
  if (currentStoredGold < baselineGold) {
    profile.value.goldCoins = baselineGold
    saveRPGProfile()
  }
}

const saveRPGProfile = () => {
  localStorage.setItem(rpgKey.value, JSON.stringify(profile.value))
}

onMounted(async () => {
  if (taskStore.tasks.length === 0) {
    await taskStore.fetchTasks()
  }
  loadRPGProfile()
})

// XP progress percent
const xpProgressPercent = computed(() => {
  return Math.round(((taskStore.xp % 300) / 300) * 100)
})

// Dynamic stats sheet calculation based on tasks completed
const stats = computed(() => {
  const doneTasks = taskStore.tasks.filter(t => t.status === 'done')
  const highCompleted = doneTasks.filter(t => t.priority === 'high').length
  const totalNotes = taskStore.convertedNotesCount || 0
  
  // Base stats depending on Class
  let baseStr = 10
  let baseInt = 10
  let baseVit = 10
  let baseWil = 10

  if (profile.value.classType === 'knight') baseStr += 10
  if (profile.value.classType === 'mage') baseInt += 10
  if (profile.value.classType === 'assassin') baseVit += 10

  // Stat Increments
  const str = baseStr + highCompleted * 2
  const int = baseInt + totalNotes * 3
  const vit = baseVit + (taskStore.streak * 4)
  const wil = baseWil + Math.round(doneTasks.length * 1.5) // total completed tasks boosts willpower

  return { str, int, vit, wil }
})

// Class details helpers
const currentClassName = computed(() => {
  const matched = classes.find(c => c.type === profile.value.classType)
  return matched ? matched.name : ''
})

const currentClassIcon = computed(() => {
  const matched = classes.find(c => c.type === profile.value.classType)
  return matched ? matched.icon : '🛡️'
})

// Actions
const selectClass = (type) => {
  profile.value.classType = type
  saveRPGProfile()
  taskStore.showToast(`⚔️ Đã chọn Hệ nhân vật! Chúc bạn bắt đầu cuộc hành trình kỷ luật đầy vinh quang!`, 'success')
}

const resetClass = () => {
  if (confirm('Bạn có chắc chắn muốn lựa chọn lại Hệ nhân vật của mình? Tất cả thuộc tính cơ bản sẽ được phân phối lại.')) {
    profile.value.classType = ''
    saveRPGProfile()
  }
}

const isOwned = (itemId) => {
  return profile.value.purchasedItems.includes(itemId)
}

const purchaseItem = (item) => {
  if (profile.value.goldCoins < item.cost) {
    taskStore.showToast('❌ Bạn không có đủ Tiền Vàng để mua vật phẩm này!', 'error')
    return
  }

  profile.value.goldCoins -= item.cost
  profile.value.purchasedItems.push(item.id)
  saveRPGProfile()
  
  taskStore.showToast(`🛍️ Đã mua thành công danh hiệu "${item.name}"!`, 'success')
}

const equipTitle = (titleName) => {
  profile.value.activeTitle = titleName
  saveRPGProfile()
  taskStore.showToast(`🏆 Đã trang bị danh hiệu: "${titleName}"!`, 'success')
  
  // Set custom title next to user in localStorage to persist across components if needed
  const user = JSON.parse(localStorage.getItem('taskflow_user') || 'null')
  if (user) {
    user.activeTitle = titleName
    localStorage.setItem('taskflow_user', JSON.stringify(user))
    authStore.updateUser(user)
  }
}
</script>

<style scoped>
.rpg-profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.rpg-header {
  margin-bottom: 30px;
}

.rpg-header h1 {
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

/* CLASS SELECTION VIEW */
.class-selection-container {
  text-align: center;
  max-width: 800px;
  margin: 40px auto 0 auto;
}

.class-selection-container h2 {
  font-size: 22px;
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 8px;
}

.selection-desc {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 30px;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 700px) {
  .classes-grid {
    grid-template-columns: 1fr;
  }
}

.class-select-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.class-select-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}

.class-select-card.knight:hover { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15); }
.class-select-card.mage:hover { border-color: rgba(17,124,117, 0.4); box-shadow: 0 10px 25px rgba(17,124,117, 0.15); }
.class-select-card.assassin:hover { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15); }

.class-icon-emoji {
  font-size: 40px;
  line-height: 1;
}

.class-select-card h3 {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.class-description {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.class-bonus-badge {
  font-size: 10px;
  font-weight: 700;
  background: rgba(251, 191, 36, 0.15);
  color: var(--accent, #2dd4bf);
  padding: 4px 8px;
  border-radius: 12px;
}

/* MAIN RPG WORKSPACE */
.rpg-workspace-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .rpg-workspace-grid {
    grid-template-columns: 1fr;
  }
}

/* Column 1: Character Sheet */
.character-sheet-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.class-avatar-emoji {
  font-size: 50px;
  line-height: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(251, 191, 36, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.character-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rpg-active-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent, #2dd4bf);
  background: rgba(251, 191, 36, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
  border: 0.5px solid rgba(251, 191, 36, 0.3);
}

.rpg-active-title.unequipped {
  color: #64748b;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.05);
}

.character-name {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.character-class-badge {
  font-size: 12px;
  color: #94a3b8;
}

.divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
}

/* Level */
.rpg-level-section {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-badge {
  background: linear-gradient(135deg, #fde047, var(--accent, #2dd4bf));
  color: #1a1a2e;
  font-weight: 800;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
  flex-shrink: 0;
}

.xp-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.xp-bar-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.xp-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

/* Stats Radar Sheet */
.sheet-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.attributes-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attribute-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 10px 14px;
}

.attr-icon {
  font-size: 22px;
}

.attr-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attr-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.attr-bar-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.attr-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.attr-bar-fill.str { background: #f43f5e; box-shadow: 0 0 6px rgba(244, 63, 94, 0.4); }
.attr-bar-fill.int { background: #117c75; box-shadow: 0 0 6px rgba(17,124,117, 0.4); }
.attr-bar-fill.vit { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4); }
.attr-bar-fill.wil { background: #fbbf24; box-shadow: 0 0 6px rgba(251, 191, 36, 0.4); }

.attr-value {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  align-self: flex-end;
}

.reset-class-row {
  margin-top: 10px;
  text-align: right;
}

.reset-class-btn {
  background: none;
  border: none;
  color: #475569;
  font-size: 11px;
  text-decoration: underline;
  cursor: pointer;
}

.reset-class-btn:hover {
  color: #f43f5e;
}

/* Purse Card */
.purse-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  border-color: rgba(251, 191, 36, 0.15);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(251, 191, 36, 0.02) 100%);
}

.purse-emoji {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
}

.purse-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.purse-lbl {
  font-size: 12px;
  color: #94a3b8;
}

.purse-val {
  font-size: 24px;
  font-weight: 800;
  color: var(--accent, #2dd4bf);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.purse-tip {
  display: block;
  width: 100%;
  font-size: 10px;
  color: #475569;
  margin-top: 4px;
}

/* Shop items */
.shop-items-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.section-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.shop-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-item-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 12px 14px;
  gap: 14px;
  transition: all 0.3s ease;
}

.shop-item-row.item-owned {
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.03);
}

.item-emoji {
  font-size: 22px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.item-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.item-shop-actions {
  flex-shrink: 0;
}

.shop-btn {
  border: none;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.btn-buy {
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.25);
  color: var(--accent, #2dd4bf);
}

.btn-buy:hover:not(:disabled) {
  background: var(--accent, #2dd4bf);
  color: #1a1a2e;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.btn-buy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-equip {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.btn-equip:hover {
  background: #3b82f6;
  color: white;
}

.btn-equipped {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  cursor: default;
}

/* Light Theme overrides inside RPG Profile specifically */
:global(.light-theme) .class-select-card {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .level-badge {
  color: #ffffff;
}
:global(.light-theme) .attribute-box {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .rpg-level-section {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .shop-item-row {
  background: rgba(0, 0, 0, 0.02);
}
:global(.light-theme) .attr-name {
  color: #1a1a2e;
}
:global(.light-theme) .item-name {
  color: #1a1a2e;
}
:global(.light-theme) .character-name {
  color: #1a1a2e;
}
:global(.light-theme) .purse-lbl {
  color: #4a4a6a;
}
</style>
