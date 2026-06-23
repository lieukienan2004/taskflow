<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">👤 Hồ Sơ Cá Nhân</h1>
        <p class="page-subtitle">Quản lý thông tin tài khoản của bạn</p>
      </div>
    </div>

    <div class="profile-layout">
      <!-- Left: Avatar & Info Card -->
      <div class="profile-left">
        <div class="avatar-card">
          <div class="avatar-accent"></div>
          <!-- Clickable Avatar Upload -->
          <div class="avatar-upload-wrap" @click="triggerFileInput" :class="{ uploading: avatarLoading }">
            <!-- Show image if avatar exists, else show initials -->
            <img v-if="avatarSrc" :src="avatarSrc" class="big-avatar-img" alt="Avatar" />
            <div v-else class="big-avatar" :style="{ background: avatarGradient }">
              {{ initials }}
            </div>
            <!-- Overlay on hover -->
            <div class="avatar-overlay">
              <svg v-if="!avatarLoading" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div v-else class="avatar-spinner"></div>
              <span>{{ avatarLoading ? 'Đang tải...' : 'Đổi ảnh' }}</span>
            </div>
          </div>

          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style="display:none"
            @change="handleAvatarChange"
          />

          <h2 class="profile-name">{{ user?.name }}</h2>
          <p class="profile-email">{{ user?.email }}</p>
          <div class="meta-divider"></div>
          <p class="profile-joined">Tham gia {{ joinedDate }}</p>
        </div>

        <!-- Stats mini -->
        <div class="mini-stats glass-card">
          <div class="mini-stat">
            <span class="mini-val" style="color:#117c75">{{ store.taskCounts.all }}</span>
            <span class="mini-lbl">Tổng task</span>
          </div>
          <div class="mini-stat">
            <span class="mini-val" style="color:#10b981">{{ store.taskCounts.done }}</span>
            <span class="mini-lbl">Hoàn thành</span>
          </div>
          <div class="mini-stat">
            <span class="mini-val" style="color:#f59e0b">{{ store.taskCounts.in_progress }}</span>
            <span class="mini-lbl">Đang làm</span>
          </div>
          <div class="mini-stat">
            <span class="mini-val" style="color:#ef4444">{{ store.taskCounts.overdue }}</span>
            <span class="mini-lbl">Quá hạn</span>
          </div>
        </div>

        <!-- Completion Ring -->
        <div class="ring-card glass-card">
          <div class="ring-wrap">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="10"/>
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#ringGrad)" stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="`${completionArc} 264`"
                transform="rotate(-90 50 50)"
                style="transition: stroke-dasharray 1s cubic-bezier(0.25, 0.8, 0.25, 1); filter: drop-shadow(0 0 4px rgba(17,124,117, 0.3));"
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#5eead4"/>
                  <stop offset="100%" stop-color="#117c75"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-center">
              <span class="ring-pct">{{ completionPct }}%</span>
              <span class="ring-lbl">Hiệu suất</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Edit Forms -->
      <div class="profile-right">
        <!-- Tab Navigation -->
        <div class="tabs-header glass-card">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'info' }" 
            @click="activeTab = 'info'"
          >
            👤 Thông tin cá nhân
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'friends' }" 
            @click="activeTab = 'friends'"
          >
            👥 Mạng lưới bạn bè
          </button>
        </div>

        <div v-if="activeTab === 'info'" class="tab-content fade-in">
          <!-- Unified Profile Card -->
          <div class="form-card">
            <!-- Profile Edit Section -->
            <div class="card-section">
              <div class="section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Thông Tin Cá Nhân</span>
              </div>
              <form @submit.prevent="saveProfile" class="edit-form">
                <div class="form-group">
                  <label class="form-label">Họ và tên</label>
                  <input v-model="profileForm.name" type="text" class="form-input" placeholder="Nhập tên của bạn" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input :value="user?.email" type="email" class="form-input disabled-input" disabled title="Email không thể thay đổi" />
                  <span class="input-hint">Email không thể thay đổi</span>
                </div>
                <button type="submit" class="btn btn-primary" :disabled="profileLoading || (profileForm.name === user?.name)">
                  <span v-if="profileLoading">⏳ Đang lưu...</span>
                  <span v-else>Lưu Thay Đổi</span>
                </button>
              </form>
            </div>

            <div class="card-divider"></div>

            <!-- Toggle Password Section -->
            <div class="card-section">
              <button type="button" class="section-header toggle-header" @click="showPasswordSection = !showPasswordSection">
                <div class="section-header-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <span>Đổi Mật Khẩu</span>
                </div>
                <svg class="chevron" :class="{ open: showPasswordSection }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <transition name="slide-toggle">
                <form v-if="showPasswordSection" @submit.prevent="savePassword" class="edit-form">
                  <div class="form-group">
                    <label class="form-label">Mật khẩu hiện tại</label>
                    <div class="pw-wrap">
                      <input v-model="pwForm.current" :type="showPw.current ? 'text' : 'password'" class="form-input" placeholder="Mật khẩu hiện tại" required />
                      <button type="button" class="pw-toggle" @click="showPw.current = !showPw.current">
  <svg v-if="!showPw.current" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Mật khẩu mới</label>
                    <div class="pw-wrap">
                      <input v-model="pwForm.new" :type="showPw.new ? 'text' : 'password'" class="form-input" placeholder="Tối thiểu 6 ký tự" required />
                      <button type="button" class="pw-toggle" @click="showPw.new = !showPw.new">
  <svg v-if="!showPw.new" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
</button>
                    </div>
                    <div class="strength-bar" v-if="pwForm.new">
                      <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPct + '%' }"></div>
                    </div>
                    <span class="strength-text" v-if="pwForm.new" :class="strengthClass">{{ strengthLabel }}</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Xác nhận mật khẩu mới</label>
                    <div class="pw-wrap">
                      <input v-model="pwForm.confirm" :type="showPw.confirm ? 'text' : 'password'" class="form-input" :class="{ 'input-error': pwForm.confirm && pwForm.new !== pwForm.confirm }" placeholder="Nhập lại mật khẩu mới" required />
                      <button type="button" class="pw-toggle" @click="showPw.confirm = !showPw.confirm">
  <svg v-if="!showPw.confirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
</button>
                    </div>
                    <span v-if="pwForm.confirm && pwForm.new !== pwForm.confirm" class="error-text">❌ Mật khẩu không khớp</span>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="pwLoading || !pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm">
                    <span v-if="pwLoading">⏳ Đang đổi...</span>
                    <span v-else>Đổi Mật Khẩu</span>
                  </button>
                </form>
              </transition>
            </div>

            <div class="card-divider"></div>

            <!-- Logout Section -->
            <div class="card-section logout-section">
              <button class="btn-logout-text" @click="authStore.logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

      <div v-else class="tab-content fade-in">
        <div class="form-card">
          <div class="card-section">
            <div class="section-header" style="margin-bottom: 16px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Kết Nối Bạn Học & Nhóm Lớp
            </div>

            <div class="search-box">
              <div class="search-box-bg"></div>
              <div class="search-box-content">
                <div class="search-box-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
                <form @submit.prevent="handleSendRequest" class="search-box-form">
                  <input 
                    v-model="friendQuery" 
                    type="text" 
                    placeholder="Nhập Email..."
                    class="search-box-input"
                    required
                  />
                  <button type="submit" class="btn-search" :disabled="sendingFriendRequest">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    <span>{{ sendingFriendRequest ? 'Đang gửi...' : 'Gửi lời mời' }}</span>
                  </button>
                </form>
              </div>
            </div>

            <!-- Pending Requests -->
            <div class="sub-section" style="margin-top: 24px;">
              <div class="sub-section-header">
                <div class="sub-section-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Lời mời đang chờ</span>
                </div>
                <span class="count-badge" :class="{ 'has-items': friendStore.pendingRequests.length > 0, pulse: friendStore.pendingRequests.length > 0 }">{{ friendStore.pendingRequests.length }}</span>
              </div>
              <div v-if="friendStore.pendingRequests.length === 0" class="empty-state">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p class="empty-text">Không có lời mời nào</p>
              </div>
              <div v-else class="friends-grid">
                <div v-for="req in friendStore.pendingRequests" :key="req.friendship_id" class="friend-card">
                  <div class="friend-avatar-wrap">
                    <img v-if="req.avatar" :src="req.avatar" class="friend-avatar" />
                    <div v-else class="friend-avatar">{{ getInitials(req.name) }}</div>
                  </div>
                  <div class="friend-info">
                    <div class="friend-name">{{ req.name }}</div>
                    <div class="friend-details">{{ req.email }}</div>
                  </div>
                  <div class="friend-actions">
                    <button class="friend-btn-accept" @click="handleAcceptFriend(req.friendship_id)">Chấp nhận</button>
                    <button class="friend-btn-decline" @click="handleRemoveFriend(req.friendship_id, req.name)">Từ chối</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-divider"></div>

            <!-- Friends List -->
            <div class="sub-section">
              <div class="sub-section-header">
                <div class="sub-section-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Bạn bè của tôi</span>
                </div>
                <span class="count-badge" :class="{ pulse: friendStore.friends.length > 0 }">{{ friendStore.friends.length }}</span>
              </div>
              <div v-if="friendStore.friends.length === 0" class="empty-state">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p class="empty-text">Chưa có bạn bè — hãy gửi lời mời ở trên</p>
              </div>
              <div v-else class="friends-grid">
                <div v-for="friend in friendStore.friends" :key="friend.friendship_id" class="friend-card">
                  <div class="friend-avatar-wrap">
                    <img v-if="friend.avatar" :src="friend.avatar" class="friend-avatar" />
                    <div v-else class="friend-avatar">{{ getInitials(friend.name) }}</div>
                    <span class="online-dot" :class="{ 'is-online': getFriendStatus(friend.user_id).online }"></span>
                  </div>
                  <div class="friend-info">
                    <div class="friend-name">{{ friend.name }}</div>
                    <div class="friend-status-text" :class="{ 'status-online': getFriendStatus(friend.user_id).online }">
                      {{ getFriendStatus(friend.user_id).online ? 'Đang online' : getFriendStatus(friend.user_id).text }}
                    </div>
                  </div>
                  <div class="friend-actions">
                    <button class="friend-btn-decline" @click="handleRemoveFriend(friend.friendship_id, friend.name)">Hủy</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      </div>

    </div>

    <!-- Heatmap Widget (Full width at bottom) -->
    <HeatmapWidget style="margin-top: 24px;" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { useFriendStore } from '@/stores/friendStore'
import { authApi } from '@/api/taskApi'
import HeatmapWidget from '@/components/HeatmapWidget.vue'
import { getSocket } from '@/utils/socketService'
import axios from 'axios'
import { getHost } from '@/utils/serverConfig'

const authStore = useAuthStore()
const store = useTaskStore()

const user = computed(() => authStore.user)

// Avatar Handlers
const fileInput = ref(null)
const previewAvatar = ref(null)

const avatarLoading = ref(false)

// Avatar src — show uploaded image or null
const avatarSrc = computed(() => user.value?.avatar || null)

// Avatar initials fallback
const initials = computed(() => {
  const name = user.value?.name || ''
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})
const avatarGradient = 'linear-gradient(135deg, #5eead4, #2dd4bf)'

const joinedDate = computed(() => {
  if (!user.value?.created_at) return ''
  return new Date(user.value.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
})

// Trigger file input click
const triggerFileInput = () => {
  if (!avatarLoading.value) fileInput.value?.click()
}

// Handle file selection & upload
const handleAvatarChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Validate client-side
  if (file.size > 5 * 1024 * 1024) {
    store.showToast('❌ Ảnh không được vượt quá 5MB', 'error')
    return
  }

  avatarLoading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await authApi.uploadAvatar(formData)
    authStore.updateUser(res.data.data)
    store.showToast('🖼️ Cập nhật ảnh đại diện thành công!')
  } catch (e) {
    store.showToast('❌ ' + (e.response?.data?.message || 'Lỗi upload ảnh'), 'error')
  } finally {
    avatarLoading.value = false
    // Reset input so same file can be selected again
    if (fileInput.value) fileInput.value.value = ''
  }
}

// Completion Ring
const completionPct = computed(() => {
  const total = store.taskCounts.all
  if (!total) return 0
  return Math.round((store.taskCounts.done / total) * 100)
})
const completionArc = computed(() => (completionPct.value / 100) * 264)

// Profile Form
const profileForm = ref({ name: '' })
const profileLoading = ref(false)

const friendStore = useFriendStore()
const activeTab = ref('info')
const friendQuery = ref('')
const sendingFriendRequest = ref(false)

const handleSendRequest = async () => {
  if (!friendQuery.value.trim()) return
  sendingFriendRequest.value = true
  const success = await friendStore.sendFriendRequest(friendQuery.value)
  if (success) friendQuery.value = ''
  sendingFriendRequest.value = false
}

const handleAcceptFriend = async (id) => {
  await friendStore.acceptFriendRequest(id)
}

const handleRemoveFriend = async (id, name) => {
  if (confirm(`Bạn có chắc muốn xóa bạn bè với ${name}?`)) {
    await friendStore.removeFriendship(id)
  }
}

const getInitials = (name) => {
  if (!name) return ''
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// Online status
const friendStatuses = ref([])
const onlineUserIds = ref([])

const fetchFriendStatus = async () => {
  try {
    const apiBase = getHost() || 'http://localhost:3001'
    const res = await axios.get(`${apiBase}/api/friendships/status`)
    friendStatuses.value = res.data.data || []
  } catch (e) { /* ignore */ }
}

const getFriendStatus = (friendId) => {
  const isOnline = onlineUserIds.value.includes(friendId)
  if (isOnline) return { online: true, text: '' }
  const status = friendStatuses.value.find(s => s.id === friendId)
  if (!status?.last_seen) return { online: false, text: 'Chưa từng online' }
  return { online: false, text: formatLastSeen(status.last_seen) }
}

const formatLastSeen = (dateStr) => {
  const now = new Date()
  const lastSeen = new Date(dateStr)
  const diffMs = now - lastSeen
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Vừa rời đi'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} giờ trước`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} ngày trước`
}

let socketOffFn = null

onMounted(async () => {
  profileForm.value.name = user.value?.name || ''
  if (!store.tasks.length) store.fetchTasks()
  await friendStore.fetchFriendships()
  await fetchFriendStatus()

  const socket = getSocket()
  if (socket) {
    socket.on('online-users', (ids) => {
      onlineUserIds.value = ids
    })
    socketOffFn = () => socket.off('online-users')
  }
})

onUnmounted(() => {
  if (socketOffFn) socketOffFn()
})

const saveProfile = async () => {
  profileLoading.value = true
  try {
    const res = await authApi.updateProfile({ 
      name: profileForm.value.name
    })
    authStore.updateUser(res.data.data)
    store.showToast('✅ Cập nhật hồ sơ thành công!')
  } catch (e) {
    store.showToast('❌ ' + (e.response?.data?.message || 'Lỗi cập nhật'), 'error')
  } finally {
    profileLoading.value = false
  }
}

// Password Form
const pwForm = ref({ current: '', new: '', confirm: '' })
const pwLoading = ref(false)
const showPw = ref({ current: false, new: false, confirm: false })
const showPasswordSection = ref(false)

const strengthPct = computed(() => {
  const p = pwForm.value.new
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s += 25
  if (p.length >= 10) s += 25
  if (/[A-Z]/.test(p)) s += 25
  if (/[0-9!@#$%^&*]/.test(p)) s += 25
  return s
})
const strengthClass = computed(() => {
  if (strengthPct.value <= 25) return 'weak'
  if (strengthPct.value <= 50) return 'fair'
  if (strengthPct.value <= 75) return 'good'
  return 'strong'
})
const strengthLabel = computed(() => {
  return { weak: '🔴 Yếu', fair: '🟡 Trung bình', good: '🟢 Khá tốt', strong: '💪 Mạnh' }[strengthClass.value]
})

const savePassword = async () => {
  if (pwForm.value.new !== pwForm.value.confirm) return
  pwLoading.value = true
  try {
    await authApi.changePassword({ currentPassword: pwForm.value.current, newPassword: pwForm.value.new })
    pwForm.value = { current: '', new: '', confirm: '' }
    store.showToast('🔐 Đổi mật khẩu thành công!')
  } catch (e) {
    store.showToast('❌ ' + (e.response?.data?.message || 'Lỗi đổi mật khẩu'), 'error')
  } finally {
    pwLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-header { display: flex; align-items: flex-end; justify-content: space-between; }
.page-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
.page-subtitle { color: #64748b; font-size: 0.9rem; }

/* Layout */
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  align-items: start;
}

/* Left */
.profile-left { display: flex; flex-direction: column; gap: 16px; }

.avatar-card {
  padding: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  overflow: hidden;
  position: relative;
}
.avatar-accent {
  width: 100%;
  height: 64px;
  background: linear-gradient(135deg, #117c75, #14b8a6, #2dd4bf);
  flex-shrink: 0;
}
.avatar-upload-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -40px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.avatar-upload-wrap::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #117c75, #2dd4bf);
  z-index: -1;
}
.avatar-upload-wrap:hover .avatar-overlay,
.avatar-upload-wrap.uploading .avatar-overlay {
  opacity: 1;
}

.big-avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid #ffffff;
}

.big-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  border: 3px solid #ffffff;
}

/* Hover overlay */
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.25s ease;
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
}

/* Loading spinner */
.avatar-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin-top: 4px;
}
.student-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
  align-items: center;
  padding: 0 20px;
}
.meta-tag {
  font-size: 0.78rem;
  color: #334155;
  padding: 6px 14px;
  border-radius: 8px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: background 0.2s ease;
}
.meta-tag:hover { background: #f1f5f9; }
.meta-icon {
  font-size: 0.6rem;
  font-weight: 700;
  color: #ffffff;
  background: #117c75;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  line-height: 1.3;
}
.meta-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 12px auto 8px;
}
.profile-email { font-size: 0.82rem; color: #64748b; }
.profile-joined { font-size: 0.75rem; color: #94a3b8; padding-bottom: 20px; }

/* Mini Stats */
.mini-stats {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.mini-stat { text-align: center; }
.mini-val { font-size: 1.6rem; font-weight: 700; display: block; letter-spacing: -0.02em; }
.mini-lbl { font-size: 0.72rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

/* Ring */
.ring-card {
  padding: 20px;
  display: flex;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.ring-wrap { position: relative; width: 140px; height: 140px; }
.ring-svg { width: 100%; height: 100%; }
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-pct { font-size: 1.6rem; font-weight: 800; color: #0f172a; }
.ring-lbl { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }

/* Right */
.profile-right { display: flex; flex-direction: column; gap: 16px; }

.form-card {
  padding: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  overflow: hidden;
}
.card-section { padding: 24px; }
.card-section + .card-divider { margin-top: 0; }
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.toggle-header {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  justify-content: space-between;
  padding: 0;
  border-radius: 8px;
  transition: background 0.15s ease;
}
.toggle-header:hover { background: #f8fafc; margin: -4px -6px; padding: 4px 6px; }
.section-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chevron { transition: transform 0.3s ease; }
.chevron.open { transform: rotate(180deg); }
.card-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 24px;
}

/* Slide toggle animation */
.slide-toggle-enter-active { transition: all 0.3s ease; overflow: hidden; max-height: 500px; }
.slide-toggle-leave-active { transition: all 0.25s ease; overflow: hidden; max-height: 500px; }
.slide-toggle-enter-from { opacity: 0; max-height: 0; }
.slide-toggle-leave-to { opacity: 0; max-height: 0; }

/* Form */
.edit-form { display: flex; flex-direction: column; gap: 18px; margin-top: 16px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #334155; letter-spacing: 0.01em; }
.form-input {
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #0f172a;
  font-family: inherit;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-input::placeholder { color: #cbd5e1; }
.form-input:hover { border-color: #cbd5e1; }
.form-input:focus { border-color: #117c75; box-shadow: 0 0 0 3px rgba(17,124,117,0.1); }
.form-input.input-error { border-color: #ef4444; }
.form-input.input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
.disabled-input { opacity: 0.45; cursor: not-allowed; background: #f8fafc; }
.input-hint { font-size: 0.73rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.error-text { font-size: 0.78rem; color: #ef4444; font-weight: 500; }

/* Password wrap */
.pw-wrap { position: relative; }
.pw-wrap .form-input { width: 100%; padding-right: 44px; box-sizing: border-box; }
.pw-toggle {
  position: absolute;
  right: 10px; top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.15s ease;
}
.pw-toggle:hover { background: #f1f5f9; }

/* Strength bar */
.strength-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 6px;
}
.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease, background 0.4s ease;
}
.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #117c75; }
.strength-fill.strong { background: #10b981; }
.strength-text { font-size: 0.75rem; font-weight: 600; }
.strength-text.weak { color: #ef4444; }
.strength-text.fair { color: #f59e0b; }
.strength-text.good { color: #117c75; }
.strength-text.strong { color: #10b981; }

/* Logout */
.logout-section { padding: 16px 24px; display: flex; justify-content: center; }
.btn-logout-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.btn-logout-text:hover { background: #fee2e2; border-color: #fca5a5; color: #b91c1c; }
.btn-logout-text:active { background: #fca5a5; border-color: #f87171; color: #991b1b; transform: scale(0.97); }

/* Form submit buttons */
.edit-form .btn-primary { width: 100%; justify-content: center; padding: 12px 20px; border-radius: 10px; font-size: 0.88rem; }

@media (max-width: 900px) {
  .profile-layout { grid-template-columns: 1fr; }
  .profile-left { flex-direction: row; flex-wrap: wrap; }
  .avatar-card { flex: 1; min-width: 240px; }
}

/* Tab Navigation */
.tabs-header {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: #f1f5f9;
  border-radius: 12px;
  margin-bottom: 16px;
}
.tab-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.tab-btn:hover {
  color: #0f172a;
  background: rgba(255,255,255,0.5);
}
.tab-btn.active {
  color: #0e6b64;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* Friends section */
.search-box {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 4px;
}
.search-box-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e6f7f5, #e6f7f5, #fdf2f8);
  opacity: 0.6;
}
.search-box-content {
  position: relative;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.search-box-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #117c75, #2dd4bf);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(17,124,117,0.25);
}
.search-box-form {
  flex: 1;
  display: flex;
  gap: 10px;
  flex-direction: column;
}
.search-box-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 10px;
  color: #0f172a;
  font-family: inherit;
  font-size: 0.88rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.search-box-input::placeholder { color: #94a3b8; }
.search-box-input:focus { border-color: #117c75; background: #ffffff; box-shadow: 0 0 0 3px rgba(17,124,117,0.1); }
.btn-search {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #117c75, #14b8a6);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(17,124,117,0.2);
}
.btn-search:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(17,124,117,0.3); transform: translateY(-1px); }
.btn-search:disabled { opacity: 0.5; cursor: not-allowed; }

.sub-section { }
.sub-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.sub-section-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}
.count-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: #ffffff;
  background: #117c75;
  padding: 1px 9px;
  border-radius: 10px;
  line-height: 1.6;
}
.count-badge.has-items { background: #ef4444; }
.count-badge.pulse { animation: badgePulse 2s ease-in-out infinite; }
@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
  margin: 20px 0;
}

.empty-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}
.empty-text {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.friend-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}
.friend-card:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transform: translateY(-1px);
}
.friend-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid #fff;
  transition: background 0.3s;
}
.online-dot.is-online {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
  animation: pulse-online 2s infinite;
}
@keyframes pulse-online {
  0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
  50% { box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
}
.friend-avatar-wrap::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5eead4, #2dd4bf);
  z-index: -1;
}
.friend-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5eead4, #2dd4bf);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.8rem;
  object-fit: cover;
  border: 2px solid #ffffff;
}
.friend-info { flex: 1; min-width: 0; }
.friend-name {
  font-size: 0.83rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.friend-details {
  font-size: 0.68rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.friend-status-text {
  font-size: 0.68rem;
  color: #94a3b8;
  white-space: nowrap;
}
.friend-status-text.status-online {
  color: #10b981;
  font-weight: 600;
}
.friend-actions {
  display: flex;
  gap: 4px;
}
.friend-btn-accept,
.friend-btn-decline {
  padding: 4px 10px;
  font-size: 0.68rem;
  border-radius: 6px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}
.friend-btn-accept { background: #d1fae5; color: #065f46; }
.friend-btn-accept:hover { background: #a7f3d0; }
.friend-btn-decline { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.friend-btn-decline:hover { background: #fee2e2; }
</style>
