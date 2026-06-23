<template>
  <div class="project-detail-page" v-if="project">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-back-wrap">
        <router-link to="/projects" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Quay lại danh sách
        </router-link>
        <h1 class="page-title" :style="{ '--proj-color': project.color || '#117c75' }">
          📁 {{ project.name }}
        </h1>
        <p class="page-subtitle">{{ project.description || 'Không có mô tả cho dự án này.' }}</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="openCreateMilestoneModal">
          🚩 Thêm Mốc Tiến Độ
        </button>
      </div>
    </div>

    <!-- Overall Project Progress -->
    <div class="project-summary-card glass-card">
      <div class="summary-grid">
        <!-- Progress Ring -->
        <div class="summary-ring-wrap">
          <svg viewBox="0 0 120 120" class="progress-ring-svg">
            <circle cx="60" cy="60" r="52" class="ring-bg" />
            <circle 
              cx="60" cy="60" r="52" 
              class="ring-fill" 
              :style="{ 
                strokeDashoffset: 327 - (327 * projectProgress / 100),
                stroke: project.color || '#117c75'
              }"
            />
          </svg>
          <div class="ring-center">
            <span class="ring-percent" :style="{ color: project.color || '#117c75' }">{{ projectProgress }}%</span>
            <span class="ring-label">Hoàn thành</span>
          </div>
        </div>
        <!-- Stats Grid -->
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-icon stat-icon-blue">📋</div>
            <div class="stat-info">
              <span class="stat-value">{{ projectTasks.length }}</span>
              <span class="stat-label">Tổng công việc</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon stat-icon-green">✅</div>
            <div class="stat-info">
              <span class="stat-value">{{ completedTasksCount }}</span>
              <span class="stat-label">Đã hoàn thành</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon stat-icon-purple">🚩</div>
            <div class="stat-info">
              <span class="stat-value">{{ store.milestones.length }}</span>
              <span class="stat-label">Mốc tiến độ</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon stat-icon-orange">👥</div>
            <div class="stat-info">
              <span class="stat-value">{{ store.projectMembers.length }}</span>
              <span class="stat-label">Thành viên</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-nav">
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
        📊 Tổng Quan
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'slots' }" @click="activeTab = 'slots'">
        🏫 Lịch Học Nhóm
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">
        👥 Thành Viên <span class="tab-badge">{{ store.projectMembers.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">
        💬 Thảo Luận
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'contributions' }" @click="loadContributions">
        🏆 Đóng Góp
      </button>
    </div>

    <!-- Study Slot Finder Section -->
    <div class="study-slots-section glass-card" v-show="activeTab === 'slots'">
      <div class="slots-header">
        <div>
          <h3 class="section-title slots-title">🏫 Tìm Lịch Trống Học Nhóm</h3>
          <p class="section-desc">Tự động đối chiếu Lịch trình của tất cả thành viên trong nhóm để tìm các buổi rảnh chung trong tuần.</p>
        </div>
        <div class="slots-header-actions">
          <button class="btn btn-secondary btn-sm" @click="refreshStudySlots" :disabled="loadingSlots">
            🔄 Đối Chiếu Lại
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingSlots" class="slots-loading">
        <span class="slots-spinner">⏳</span>
        <p>Đang đối chiếu thời khóa biểu nhóm...</p>
      </div>

      <!-- No Members Alert -->
      <div v-else-if="store.projectMembers.length <= 1" class="no-members-alert">
        <div class="no-members-icon">👥</div>
        <h4>Chưa có thành viên khác trong nhóm</h4>
        <p>Tính năng so khớp lịch yêu cầu nhóm có từ <strong>2 thành viên trở lên</strong>. Hãy mời thêm bạn học tham gia nhóm để đối chiếu thời khóa biểu và tìm lịch học nhóm trống chung.</p>
        <button v-if="isOwner" class="btn btn-primary btn-sm" @click="showInviteModal = true">Mời Thành Viên</button>
      </div>

      <!-- Grid Display -->
      <div v-else class="study-slots-grid-wrapper">
        <div class="study-slots-grid">
          <!-- Column headers (Days) -->
          <div class="grid-header-cell">Buổi \ Thứ</div>
          <div class="grid-header-cell" v-for="day in studySlots" :key="day.dayValue">
            {{ day.dayLabel }}
          </div>

          <!-- Morning Row -->
          <div class="grid-row-header-cell">
            <span>🌅 Sáng</span>
            <small class="slot-time-label">07:00 - 11:30</small>
          </div>
          <div 
            v-for="day in studySlots" 
            :key="'morning-' + day.dayValue" 
            class="grid-slot-cell"
            :class="{ 
              'free': day.slots[0].isFullyFree, 
              'busy': !day.slots[0].isFullyFree 
            }"
          >
            <div v-if="day.slots[0].isFullyFree" class="slot-free-content">
              <span class="slot-badge-free">Rảnh 🎉</span>
              <button class="btn-schedule-quick" @click="quickScheduleMeeting(day, day.slots[0])" title="Lên lịch họp nhóm buổi này">
                📅 Lên Lịch
              </button>
            </div>
            <div v-else class="slot-busy-content">
              <span class="slot-badge-busy">Bận ({{ day.slots[0].busyMembers.length }})</span>
              <div class="busy-tooltip">
                <div class="tooltip-header">Thành viên bận:</div>
                <div v-for="m in day.slots[0].busyMembers" :key="m.user_id" class="tooltip-member-item">
                  🔴 <strong>{{ m.name }}</strong>: <small>{{ m.reason }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Afternoon Row -->
          <div class="grid-row-header-cell">
            <span>☀️ Chiều</span>
            <small class="slot-time-label">13:00 - 17:30</small>
          </div>
          <div 
            v-for="day in studySlots" 
            :key="'afternoon-' + day.dayValue" 
            class="grid-slot-cell"
            :class="{ 
              'free': day.slots[1].isFullyFree, 
              'busy': !day.slots[1].isFullyFree 
            }"
          >
            <div v-if="day.slots[1].isFullyFree" class="slot-free-content">
              <span class="slot-badge-free">Rảnh 🎉</span>
              <button class="btn-schedule-quick" @click="quickScheduleMeeting(day, day.slots[1])" title="Lên lịch họp nhóm buổi này">
                📅 Lên Lịch
              </button>
            </div>
            <div v-else class="slot-busy-content">
              <span class="slot-badge-busy">Bận ({{ day.slots[1].busyMembers.length }})</span>
              <div class="busy-tooltip">
                <div class="tooltip-header">Thành viên bận:</div>
                <div v-for="m in day.slots[1].busyMembers" :key="m.user_id" class="tooltip-member-item">
                  🔴 <strong>{{ m.name }}</strong>: <small>{{ m.reason }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Evening Row -->
          <div class="grid-row-header-cell">
            <span>🌙 Tối</span>
            <small class="slot-time-label">18:00 - 22:00</small>
          </div>
          <div 
            v-for="day in studySlots" 
            :key="'evening-' + day.dayValue" 
            class="grid-slot-cell"
            :class="{ 
              'free': day.slots[2].isFullyFree, 
              'busy': !day.slots[2].isFullyFree 
            }"
          >
            <div v-if="day.slots[2].isFullyFree" class="slot-free-content">
              <span class="slot-badge-free">Rảnh 🎉</span>
              <button class="btn-schedule-quick" @click="quickScheduleMeeting(day, day.slots[2])" title="Lên lịch họp nhóm buổi này">
                📅 Lên Lịch
              </button>
            </div>
            <div v-else class="slot-busy-content">
              <span class="slot-badge-busy">Bận ({{ day.slots[2].busyMembers.length }})</span>
              <div class="busy-tooltip">
                <div class="tooltip-header">Thành viên bận:</div>
                <div v-for="m in day.slots[2].busyMembers" :key="m.user_id" class="tooltip-member-item">
                  🔴 <strong>{{ m.name }}</strong>: <small>{{ m.reason }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Group Members Section -->
    <div class="members-section glass-card" v-show="activeTab === 'members'">
      <div class="members-header">
        <h3 class="section-title">👥 Thành Viên Nhóm ({{ store.projectMembers.length }})</h3>
        <button v-if="isOwner" class="btn btn-secondary btn-sm" @click="showInviteModal = true">
          ➕ Mời Thành Viên
        </button>
      </div>
      
      <div class="members-list">
        <div v-for="member in store.projectMembers" :key="member.user_id" class="member-item">
          <div class="member-avatar">
            <img v-if="member.avatar" :src="`${getHost() || 'http://localhost:3001'}${member.avatar}`" alt="Avatar" />
            <div v-else class="avatar-placeholder">
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="member-info">
            <span class="member-name">{{ member.name }}</span>
            <span class="member-subtext">{{ member.email }}</span>
          </div>
          <div class="member-badge" :class="[member.role, member.status]">
            {{ member.role === 'owner' ? 'Trưởng nhóm' : member.status === 'pending' ? 'Đang chờ' : 'Thành viên' }}
          </div>
          <button v-if="isOwner && member.role !== 'owner'" class="remove-member-btn" @click="handleRemoveMember(member.user_id)" title="Xóa khỏi nhóm">
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Group Chat & Discussion Section -->
    <div class="chat-section glass-card" v-show="activeTab === 'chat'">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-header-icon">💬</div>
          <div>
            <h3 class="section-title chat-title">Thảo Luận & Báo Cáo Nhóm</h3>
            <span class="chat-subtitle">Trao đổi công việc và báo cáo tiến độ trực tuyến</span>
          </div>
        </div>
        <div class="chat-online-indicator">
          <span class="online-dot"></span>
          <span class="online-text">{{ store.projectMembers.length }} thành viên</span>
        </div>
      </div>

      <div class="chat-messages-container" ref="chatMessagesContainer">
        <div v-if="store.loadingChats && store.projectChats.length === 0" class="chat-loading">
          <div class="chat-loading-spinner">⏳</div>
          <p>Đang tải tin nhắn...</p>
        </div>
        <div v-else-if="store.projectChats.length === 0" class="chat-empty">
          <div class="chat-empty-icon">💬</div>
          <h4>Chưa có tin nhắn nào</h4>
          <p>Hãy gửi tin nhắn đầu tiên để bắt đầu thảo luận!</p>
        </div>
        <div v-else class="chat-messages-list">
          <div 
            v-for="msg in store.projectChats" 
            :key="msg.id" 
            class="chat-message-item"
            :class="{ 'mine': msg.user_id === authStore.user?.id }"
          >
            <!-- Avatar for other users -->
            <div v-if="msg.user_id !== authStore.user?.id" class="message-avatar">
              <img v-if="msg.user_avatar" :src="`${getHost() || 'http://localhost:3001'}${msg.user_avatar}`" alt="Avatar" />
              <div v-else class="avatar-placeholder">
                {{ msg.user_name.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="message-bubble-wrap">
              <div v-if="msg.user_id !== authStore.user?.id" class="message-sender-name">
                {{ msg.user_name }}
              </div>
              <div class="message-bubble">
                <p class="message-text">{{ msg.message }}</p>
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat input -->
      <form @submit.prevent="handleSendChatMessage" class="chat-input-form">
        <div class="chat-input-wrap">
          <input 
            v-model="newMessage" 
            type="text" 
            placeholder="Nhập tin nhắn hoặc báo cáo tiến độ..." 
            class="chat-input"
            :disabled="sendingMessage"
          />
          <button 
            type="submit" 
            class="chat-send-btn" 
            :disabled="!newMessage.trim() || sendingMessage"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>

    <!-- Contributions Section -->
    <div class="contributions-section glass-card" v-show="activeTab === 'contributions'">
      <div class="contrib-header">
        <div>
          <h3 class="section-title">🏆 Bảng Xếp Hạng Đóng Góp</h3>
          <p class="section-desc">Thống kê chi tiết mức độ đóng góp của từng thành viên trong dự án.</p>
        </div>
        <button class="btn btn-secondary btn-sm" @click="loadContributions" :disabled="loadingContrib">
          🔄 Làm mới
        </button>
      </div>

      <div v-if="loadingContrib" class="contrib-loading">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu đóng góp...</p>
      </div>

      <div v-else-if="contribData && contribData.members.length > 0" class="contrib-content">
        <!-- Top 3 Podium -->
        <div class="podium" v-if="contribData.members.length >= 2">
          <div class="podium-item podium-2" v-if="contribData.members[1]">
            <div class="podium-avatar">
              <img v-if="contribData.members[1].avatar" :src="`${getHost() || 'http://localhost:3001'}${contribData.members[1].avatar}`" alt="" />
              <div v-else class="avatar-placeholder">{{ contribData.members[1].name.charAt(0) }}</div>
            </div>
            <div class="podium-rank">🥈</div>
            <div class="podium-name">{{ contribData.members[1].name }}</div>
            <div class="podium-score">{{ contribData.members[1].stats.contribution_score }} điểm</div>
            <div class="podium-bar bar-2"></div>
          </div>
          <div class="podium-item podium-1" v-if="contribData.members[0]">
            <div class="podium-avatar podium-avatar-big">
              <img v-if="contribData.members[0].avatar" :src="`${getHost() || 'http://localhost:3001'}${contribData.members[0].avatar}`" alt="" />
              <div v-else class="avatar-placeholder">{{ contribData.members[0].name.charAt(0) }}</div>
            </div>
            <div class="podium-rank">🥇</div>
            <div class="podium-name">{{ contribData.members[0].name }}</div>
            <div class="podium-score">{{ contribData.members[0].stats.contribution_score }} điểm</div>
            <div class="podium-bar bar-1"></div>
          </div>
          <div class="podium-item podium-3" v-if="contribData.members[2]">
            <div class="podium-avatar">
              <img v-if="contribData.members[2].avatar" :src="`${getHost() || 'http://localhost:3001'}${contribData.members[2].avatar}`" alt="" />
              <div v-else class="avatar-placeholder">{{ contribData.members[2].name.charAt(0) }}</div>
            </div>
            <div class="podium-rank">🥉</div>
            <div class="podium-name">{{ contribData.members[2].name }}</div>
            <div class="podium-score">{{ contribData.members[2].stats.contribution_score }} điểm</div>
            <div class="podium-bar bar-3"></div>
          </div>
        </div>

        <!-- Detailed Stats Table -->
        <div class="contrib-table-wrap">
          <table class="contrib-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Thành viên</th>
                <th>Vai trò</th>
                <th>Task được giao</th>
                <th>Hoàn thành</th>
                <th>Đang làm</th>
                <th>Quá hạn</th>
                <th>Task tạo</th>
                <th>Tin nhắn</th>
                <th>Tỷ lệ</th>
                <th>Điểm</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in contribData.members" :key="m.id" :class="{ 'row-highlight': m.id === authStore.user?.id }">
                <td>
                  <span class="rank-badge" :class="'rank-' + m.rank">{{ m.rank }}</span>
                </td>
                <td>
                  <div class="contrib-member-cell">
                    <div class="contrib-avatar-sm">
                      <img v-if="m.avatar" :src="`${getHost() || 'http://localhost:3001'}${m.avatar}`" alt="" />
                      <div v-else class="avatar-placeholder-sm">{{ m.name.charAt(0) }}</div>
                    </div>
                    <div>
                      <div class="contrib-member-name">{{ m.name }}</div>
                      <div class="contrib-member-sub">{{ m.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-tag" :class="'role-' + m.role">{{ m.role === 'owner' ? 'Trưởng nhóm' : 'Thành viên' }}</span>
                </td>
                <td class="num-cell">{{ m.stats.total_tasks }}</td>
                <td class="num-cell done-cell">{{ m.stats.completed_tasks }}</td>
                <td class="num-cell progress-cell">{{ m.stats.in_progress_tasks }}</td>
                <td class="num-cell overdue-cell">{{ m.stats.overdue_tasks }}</td>
                <td class="num-cell">{{ m.stats.created_tasks }}</td>
                <td class="num-cell">{{ m.stats.messages_sent }}</td>
                <td>
                  <div class="rate-bar-wrap">
                    <div class="rate-bar-track">
                      <div class="rate-bar-fill" :style="{ width: m.stats.completion_rate + '%' }"></div>
                    </div>
                    <span class="rate-text">{{ m.stats.completion_rate }}%</span>
                  </div>
                </td>
                <td>
                  <span class="score-badge">{{ m.stats.contribution_score }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Score Legend -->
        <div class="contrib-legend">
          <span class="legend-title">Công thức tính điểm:</span>
          <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Hoàn thành task +10</span>
          <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>Đang làm +3</span>
          <span class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>Tạo task +2</span>
          <span class="legend-item"><span class="legend-dot" style="background:#94a3b8"></span>Tin nhắn +1</span>
        </div>
      </div>

      <div v-else class="contrib-empty">
        <span class="empty-icon">🏆</span>
        <p>Chưa có dữ liệu đóng góp. Hãy bắt đầu giao task và thảo luận!</p>
      </div>
    </div>

    <!-- Overview Tab Content -->
    <div class="tab-overview" v-show="activeTab === 'overview'">
    <!-- Visual Roadmap Timeline -->
    <div class="roadmap-section glass-card" v-if="store.milestones.length > 0">
      <h3 class="section-title">🗺️ Lộ Trình Giai Đoạn (Roadmap)</h3>
      <div class="roadmap-timeline">
        <div class="timeline-line-background"></div>
        <div 
          class="timeline-line-fill" 
          :style="{ 
            width: milestonesProgress + '%', 
            backgroundColor: project.color || '#117c75',
            boxShadow: '0 0 10px ' + (project.color || '#117c75')
          }"
        ></div>
        <div 
          v-for="(milestone, idx) in store.milestones" 
          :key="milestone.id"
          class="timeline-node"
          :class="milestone.status"
          @click="scrollToMilestone(milestone.id)"
          title="Nhấp để đi đến giai đoạn này"
        >
          <div class="node-circle" :style="{ borderColor: project.color || '#117c75' }">
            <span v-if="milestone.status === 'completed'">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <div class="node-content">
            <div class="node-title">{{ milestone.name }}</div>
            <div class="node-date" v-if="milestone.due_date">
              📅 {{ formatDate(milestone.due_date) }}
            </div>
            <div class="node-progress">
              {{ calculateMilestoneProgress(milestone) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Milestones List Grid -->
    <div class="milestones-grid" v-if="store.milestones.length > 0">
      <div 
        v-for="milestone in store.milestones" 
        :key="milestone.id" 
        :id="'milestone-' + milestone.id"
        class="milestone-card glass-card"
        :class="{ 'completed': milestone.status === 'completed' }"
      >
        <div class="milestone-card-header">
          <div class="milestone-info">
            <div class="milestone-status-badge" :class="milestone.status">
              {{ formatStatus(milestone.status) }}
            </div>
            <h3 class="milestone-title">{{ milestone.name }}</h3>
            <p class="milestone-desc" v-if="milestone.description">{{ milestone.description }}</p>
            <p class="milestone-due" v-if="milestone.due_date">📅 Hạn hoàn thành: {{ formatDate(milestone.due_date) }}</p>
          </div>
          <div class="milestone-actions">
            <button class="action-btn" @click="openEditMilestoneModal(milestone)" title="Chỉnh sửa">
              ✏️
            </button>
            <button class="action-btn delete" @click="handleDeleteMilestone(milestone.id)" title="Xóa">
              🗑️
            </button>
          </div>
        </div>

        <!-- Progress bar of this milestone -->
        <div class="milestone-progress-wrap">
          <div class="progress-header">
            <span>Tiến độ giai đoạn</span>
            <span>{{ calculateMilestoneProgress(milestone) }}% ({{ milestone.task_done || 0 }}/{{ milestone.task_count || 0 }})</span>
          </div>
          <div class="progress-track-mini">
            <div 
              class="progress-fill-mini" 
              :style="{ width: calculateMilestoneProgress(milestone) + '%', backgroundColor: project.color || '#117c75' }"
            ></div>
          </div>
        </div>

        <!-- Tasks inside this Milestone -->
        <div class="milestone-tasks">
          <div 
            v-for="task in getMilestoneTasks(milestone.id)" 
            :key="task.id" 
            class="milestone-task-item"
            :class="{ 'done': task.status === 'done' }"
          >
            <label class="task-checkbox-wrap">
              <input 
                type="checkbox" 
                :checked="task.status === 'done'" 
                @change="toggleTaskStatus(task)"
                class="task-checkbox"
              />
              <span class="checkbox-custom"></span>
            </label>
            <div class="task-info-wrap" @click="viewTaskDetails(task.id)">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <span class="task-priority" :class="task.priority">
                  {{ task.priority === 'high' ? '🔴 Cao' : task.priority === 'low' ? '🟢 Thấp' : '🟡 TB' }}
                </span>
                <span class="task-due" v-if="task.due_date">
                  ⏰ {{ formatDate(task.due_date) }}
                </span>
              </div>
            </div>
            <div class="task-actions-wrap">
              <select 
                :value="task.milestone_id" 
                @change="moveTaskMilestone(task.id, $event.target.value)" 
                class="move-select"
                title="Di chuyển sang mốc khác"
              >
                <option :value="null">Không phân giai đoạn</option>
                <option v-for="m in store.milestones" :key="m.id" :value="m.id">
                  {{ m.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="getMilestoneTasks(milestone.id).length === 0" class="empty-tasks">
            Chưa có công việc nào trong giai đoạn này.
          </div>
        </div>

        <!-- Add Task to Milestone Button -->
        <button class="btn btn-add-task" @click="openCreateTaskModal(milestone.id)">
          ➕ Thêm công việc vào giai đoạn
        </button>
      </div>
    </div>

    <!-- Unassigned Tasks section -->
    <div class="unassigned-section glass-card" v-if="unassignedTasks.length > 0">
      <h3 class="section-title">📂 Công việc chưa phân giai đoạn ({{ unassignedTasks.length }})</h3>
      <div class="milestone-tasks">
        <div 
          v-for="task in unassignedTasks" 
          :key="task.id" 
          class="milestone-task-item"
          :class="{ 'done': task.status === 'done' }"
        >
          <label class="task-checkbox-wrap">
            <input 
              type="checkbox" 
              :checked="task.status === 'done'" 
              @change="toggleTaskStatus(task)"
              class="task-checkbox"
            />
            <span class="checkbox-custom"></span>
          </label>
          <div class="task-info-wrap" @click="viewTaskDetails(task.id)">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-meta">
              <span class="task-priority" :class="task.priority">
                {{ task.priority === 'high' ? '🔴 Cao' : task.priority === 'low' ? '🟢 Thấp' : '🟡 TB' }}
              </span>
              <span class="task-due" v-if="task.due_date">
                ⏰ {{ formatDate(task.due_date) }}
              </span>
            </div>
          </div>
          <div class="task-actions-wrap">
            <select 
              :value="null" 
              @change="moveTaskMilestone(task.id, $event.target.value)" 
              class="move-select"
            >
              <option :value="null">Chọn giai đoạn...</option>
              <option v-for="m in store.milestones" :key="m.id" :value="m.id">
                {{ m.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state for milestones -->
    <div class="empty-milestones glass-card" v-if="store.milestones.length === 0">
      <div class="empty-icon">🚩</div>
      <h2>Chưa có mốc tiến độ nào</h2>
      <p>Hãy chia đồ án/bài tập này thành các giai đoạn cụ thể (Ví dụ: Giai đoạn 1: Đề cương, Giai đoạn 2: Lập trình...) để làm việc khoa học hơn!</p>
      <button class="btn btn-primary" @click="openCreateMilestoneModal">Tạo mốc tiến độ đầu tiên</button>
    </div>
    </div>

    <!-- Modal Tạo/Sửa Mốc Tiến Độ -->
    <div class="modal-overlay" v-if="showMilestoneModal" @click.self="closeMilestoneModal">
      <div class="modal-content glass-card form-modal">
        <div class="modal-header">
          <h2>{{ isEditingMilestone ? '✏️ Sửa Mốc Tiến Độ' : '🚩 Tạo Mốc Tiến Độ Mới' }}</h2>
          <button class="close-btn" @click="closeMilestoneModal">×</button>
        </div>
        
        <form @submit.prevent="handleSaveMilestone" class="milestone-form">
          <div class="form-group">
            <label>Tên mốc tiến độ <span class="required">*</span></label>
            <input 
              v-model="milestoneForm.name" 
              type="text" 
              required
              placeholder="VD: Giai đoạn 1: Lập đề cương chi tiết" 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>Mô tả ngắn</label>
            <textarea 
              v-model="milestoneForm.description" 
              placeholder="Mô tả các mục tiêu cần đạt được trong giai đoạn này..." 
              rows="3"
              class="form-input"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Hạn hoàn thành</label>
              <input 
                v-model="milestoneForm.due_date" 
                type="datetime-local" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="milestoneForm.status" class="form-select">
                <option value="pending">⏸ Chờ làm</option>
                <option value="active">▶ Đang thực hiện</option>
                <option value="completed">✅ Đã hoàn thành</option>
              </select>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeMilestoneModal">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="!milestoneForm.name.trim()">
              {{ isEditingMilestone ? 'Cập nhật' : 'Tạo Mốc' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Mời Thành Viên -->
    <div class="modal-overlay" v-if="showInviteModal" @click.self="showInviteModal = false">
      <div class="modal-content glass-card form-modal">
        <div class="modal-header">
          <h2>👥 Mời Thành Viên Mới</h2>
          <button class="close-btn" @click="showInviteModal = false">×</button>
        </div>
        
        <form @submit.prevent="handleInviteMember" class="invite-form">
          <div class="form-group">
            <label>Nhập Email <span class="required">*</span></label>
            <input 
              v-model="inviteEmailOrId" 
              type="text" 
              required
              placeholder="VD: an123@gmail.com" 
              class="form-input"
            />
          </div>

          <!-- Gợi ý từ danh sách bạn bè -->
          <div class="form-group friend-suggest-group" v-if="nonMemberFriends.length > 0">
            <label>Hoặc chọn nhanh từ bạn bè</label>
            <select @change="selectFriendToInvite" class="form-select">
              <option value="">-- Chọn bạn --</option>
              <option v-for="friend in nonMemberFriends" :key="friend.user_id" :value="friend.email">
                {{ friend.name }} ({{ friend.email }})
              </option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showInviteModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="!inviteEmailOrId.trim() || loadingInvite">
              {{ loadingInvite ? 'Đang gửi...' : 'Gửi lời mời' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Form Modal -->
    <TaskForm
      v-if="showTaskForm"
      :project-id="project.id"
      :milestone-id="targetMilestoneId"
      :initial-title="prefilledTaskTitle"
      :initial-description="prefilledTaskDesc"
      :initial-due-date="prefilledTaskDueDate"
      @close="closeTaskForm"
      @saved="refreshTasks"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { useFriendStore } from '@/stores/friendStore'
import TaskForm from '@/components/TaskForm.vue'
import { projectApi } from '@/api/taskApi'
import { getSocket, joinProjectRoom, leaveProjectRoom, sendProjectMessage } from '@/utils/socketService'
import { getHost } from '@/utils/serverConfig'

const route = useRoute()
const router = useRouter()
const store = useTaskStore()
const authStore = useAuthStore()

// --- Tab Navigation ---
const activeTab = ref('overview')

// --- Group Chat State & Methods (Real-time via Socket.io) ---
const chatMessagesContainer = ref(null)
const newMessage = ref('')
const sendingMessage = ref(false)

const scrollToBottom = () => {
  if (chatMessagesContainer.value) {
    setTimeout(() => {
      chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
    }, 50)
  }
}

const setupSocketListeners = () => {
  const socket = getSocket()
  if (!socket) return

  joinProjectRoom(projectId.value)

  socket.on('new-message', (msg) => {
    const exists = store.projectChats.some(m => m.id === msg.id)
    if (!exists) {
      store.projectChats.push(msg)
      scrollToBottom()
    }
  })
}

const cleanupSocketListeners = () => {
  const socket = getSocket()
  if (socket) {
    socket.off('new-message')
  }
  leaveProjectRoom(projectId.value)
}

const initChat = () => {
  store.fetchProjectChats(projectId.value).then(() => {
    scrollToBottom()
  })
  setupSocketListeners()
}

const handleSendChatMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value) return
  const msgText = newMessage.value.trim()
  newMessage.value = ''
  sendingMessage.value = true
  try {
    // Send via socket for real-time, fallback to REST
    const socket = getSocket()
    if (socket?.connected) {
      sendProjectMessage(projectId.value, msgText)
      scrollToBottom()
    } else {
      await store.sendProjectChatMessage(projectId.value, msgText)
      scrollToBottom()
    }
  } catch (err) {
    console.error(err)
  } finally {
    sendingMessage.value = false
  }
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return `Hôm nay lúc ${hours}:${minutes}`
  }
  return `${hours}:${minutes} - ${day}/${month}`
}

// --- Contributions State ---
const contribData = ref(null)
const loadingContrib = ref(false)

const loadContributions = async () => {
  activeTab.value = 'contributions'
  if (contribData.value) return
  loadingContrib.value = true
  try {
    const res = await projectApi.getContributions(projectId.value)
    contribData.value = res.data.data
  } catch (err) {
    console.error('Lỗi tải đóng góp:', err)
  } finally {
    loadingContrib.value = false
  }
}

const milestonesProgress = computed(() => {
  if (store.milestones.length <= 1) {
    if (store.milestones.length === 1) {
      return store.milestones[0].status === 'completed' ? 100 : 0
    }
    return 0
  }
  
  let lastCompletedIdx = -1
  for (let i = 0; i < store.milestones.length; i++) {
    if (store.milestones[i].status === 'completed') {
      lastCompletedIdx = i
    }
  }
  
  if (lastCompletedIdx === -1) return 0
  return (lastCompletedIdx / (store.milestones.length - 1)) * 100
})

const scrollToMilestone = (milestoneId) => {
  const el = document.getElementById(`milestone-${milestoneId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-flash')
    setTimeout(() => {
      el.classList.remove('highlight-flash')
    }, 2000)
  }
}

const projectId = computed(() => route.params.id)
const project = computed(() => store.projects.find(p => p.id === parseInt(projectId.value)))

// Tasks under this project
const projectTasks = computed(() => store.tasks.filter(t => t.project_id === parseInt(projectId.value)))

const completedTasksCount = computed(() => projectTasks.value.filter(t => t.status === 'done').length)

const projectProgress = computed(() => {
  if (projectTasks.value.length === 0) return 0
  return Math.round((completedTasksCount.value / projectTasks.value.length) * 100)
})

// Unassigned tasks (under project but milestone_id is null)
const unassignedTasks = computed(() => projectTasks.value.filter(t => t.milestone_id === null))

// Milestone management states
const showMilestoneModal = ref(false)
const isEditingMilestone = ref(false)
const editingMilestoneId = ref(null)
const milestoneForm = ref({
  name: '',
  description: '',
  due_date: '',
  status: 'pending'
})

// Task creation states
const showTaskForm = ref(false)
const targetMilestoneId = ref(null)
const prefilledTaskTitle = ref('')
const prefilledTaskDesc = ref('')
const prefilledTaskDueDate = ref('')

// Study Slot Finder States
const studySlots = ref([])
const loadingSlots = ref(false)

const fetchStudySlots = async () => {
  loadingSlots.value = true
  try {
    const res = await projectApi.getStudySlots(projectId.value)
    if (res.data.success) {
      studySlots.value = res.data.data
    }
  } catch (err) {
    console.error('Error fetching study slots:', err)
  } finally {
    loadingSlots.value = false
  }
}

const refreshStudySlots = async () => {
  await fetchStudySlots()
  store.showToast('🔄 Đã đối chiếu lại thời khóa biểu mới nhất!', 'success')
}

const getNextOccurrenceOfWeekday = (dayOfWeek) => {
  const resultDate = new Date()
  const currentDay = resultDate.getDay()
  
  let daysToAdd = dayOfWeek - currentDay
  if (daysToAdd <= 0) {
    daysToAdd += 7
  }
  resultDate.setDate(resultDate.getDate() + daysToAdd)
  return resultDate
}

const quickScheduleMeeting = (day, slot) => {
  const nextDate = getNextOccurrenceOfWeekday(day.dayValue)
  
  let hour = 18
  let minute = 0
  if (slot.sessionKey === 'morning') {
    hour = 7
  } else if (slot.sessionKey === 'afternoon') {
    hour = 13
  }
  nextDate.setHours(hour, minute, 0, 0)
  
  const pad = n => String(n).padStart(2, '0')
  const localFormattedDate = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}T${pad(hour)}:${pad(minute)}`

  prefilledTaskTitle.value = `👥 Họp nhóm: ${project.value?.name || ''}`
  prefilledTaskDesc.value = `Buổi họp nhóm học tập thống nhất vào buổi ${slot.sessionLabel} ${day.dayLabel}. Các thành viên tham gia thảo luận đầy đủ.`
  prefilledTaskDueDate.value = localFormattedDate
  targetMilestoneId.value = null
  showTaskForm.value = true
}

// Collaborative States
const showInviteModal = ref(false)
const inviteEmailOrId = ref('')
const loadingInvite = ref(false)

const friendStore = useFriendStore()

const nonMemberFriends = computed(() => {
  return friendStore.friends.filter(f => {
    return !store.projectMembers.some(m => m.user_id === f.user_id)
  })
})

const selectFriendToInvite = (e) => {
  inviteEmailOrId.value = e.target.value
}

const isOwner = computed(() => {
  return project.value && project.value.user_id === authStore.user?.id
})

onMounted(async () => {
  if (store.projects.length === 0) {
    await store.fetchProjects()
  }
  await store.fetchMilestones(projectId.value)
  await store.fetchTasks()
  await store.fetchProjectMembers(projectId.value)
  await friendStore.fetchFriendships()
  await fetchStudySlots()
  initChat()
})

onUnmounted(() => {
  cleanupSocketListeners()
})

const handleInviteMember = async () => {
  if (!inviteEmailOrId.value.trim()) return
  loadingInvite.value = true
  try {
    await store.inviteProjectMember(projectId.value, inviteEmailOrId.value.trim())
    showInviteModal.value = false
    inviteEmailOrId.value = ''
  } catch (err) {
    console.error(err)
  } finally {
    loadingInvite.value = false
  }
}

const handleRemoveMember = async (userId) => {
  if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm học tập / hủy lời mời?')) {
    try {
      await store.removeProjectMember(projectId.value, userId)
    } catch (err) {
      console.error(err)
    }
  }
}

const getMilestoneTasks = (milestoneId) => {
  return projectTasks.value.filter(t => t.milestone_id === milestoneId)
}

const calculateMilestoneProgress = (milestone) => {
  const tasks = getMilestoneTasks(milestone.id)
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'done').length
  return Math.round((completed / tasks.length) * 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status) => {
  switch (status) {
    case 'completed': return '✅ Hoàn thành'
    case 'active': return '⚡ Đang thực hiện'
    default: return '⏸ Chờ làm'
  }
}

// Milestone actions
const openCreateMilestoneModal = () => {
  isEditingMilestone.value = false
  editingMilestoneId.value = null
  milestoneForm.value = {
    name: '',
    description: '',
    due_date: '',
    status: 'pending'
  }
  showMilestoneModal.value = true
}

const openEditMilestoneModal = (milestone) => {
  isEditingMilestone.value = true
  editingMilestoneId.value = milestone.id
  
  // Format due date for datetime-local input
  let formattedDate = ''
  if (milestone.due_date) {
    const d = new Date(milestone.due_date)
    const pad = n => String(n).padStart(2, '0')
    formattedDate = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  milestoneForm.value = {
    name: milestone.name,
    description: milestone.description || '',
    due_date: formattedDate,
    status: milestone.status || 'pending'
  }
  showMilestoneModal.value = true
}

const closeMilestoneModal = () => {
  showMilestoneModal.value = false
}

const handleSaveMilestone = async () => {
  try {
    const payload = {
      ...milestoneForm.value,
      due_date: milestoneForm.value.due_date ? new Date(milestoneForm.value.due_date).toISOString() : null
    }

    if (isEditingMilestone.value) {
      await store.updateMilestone(projectId.value, editingMilestoneId.value, payload)
    } else {
      await store.createMilestone(projectId.value, payload)
    }
    showMilestoneModal.value = false
    await store.fetchMilestones(projectId.value) // refresh statistics
  } catch (e) {
    console.error(e)
  }
}

const handleDeleteMilestone = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa mốc tiến độ này? Các công việc liên quan sẽ KHÔNG bị xóa mà chỉ bị đưa vào trạng thái chưa phân giai đoạn.')) {
    await store.deleteMilestone(projectId.value, id)
    await store.fetchTasks() // refresh task lists
  }
}

// Task actions within project details
const openCreateTaskModal = (milestoneId) => {
  targetMilestoneId.value = milestoneId
  showTaskForm.value = true
}

const closeTaskForm = () => {
  showTaskForm.value = false
  targetMilestoneId.value = null
  prefilledTaskTitle.value = ''
  prefilledTaskDesc.value = ''
  prefilledTaskDueDate.value = ''
}

const refreshTasks = async () => {
  await store.fetchTasks()
  await store.fetchMilestones(projectId.value) // refresh completion percentages
}

const toggleTaskStatus = async (task) => {
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  await store.changeStatus(task.id, newStatus)
  await store.fetchMilestones(projectId.value) // refresh completion percentages
}

const viewTaskDetails = (taskId) => {
  router.push(`/tasks/${taskId}`)
}

const moveTaskMilestone = async (taskId, milestoneIdVal) => {
  const mId = milestoneIdVal === '' || milestoneIdVal === null ? null : parseInt(milestoneIdVal)
  await store.updateTask(taskId, { milestone_id: mId })
  await store.fetchMilestones(projectId.value)
}
</script>

<style scoped>
.project-detail-page {
  animation: fadeIn 0.6s ease both;
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f7f5 50%, #e6f7f5 100%);
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-detail-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(17,124,117, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(17,124,117, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(17,124,117, 0.03) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.project-detail-page > * {
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  animation: fadeInDown 0.6s ease both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-back-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
}

.btn-back:hover {
  color: #117c75;
  transform: translateX(-4px);
}

.btn-back svg {
  transition: transform 0.3s ease;
}

.btn-back:hover svg {
  transform: translateX(-2px);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--proj-color, #117c75) 0%, #2dd4bf 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
  line-height: 1.2;
  filter: drop-shadow(0 2px 8px rgba(17,124,117, 0.15));
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* Glass Card Base */
.glass-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 6px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1.5rem;
}

.glass-card:hover {
  box-shadow: 0 4px 12px rgba(17,124,117, 0.08), 0 12px 40px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* Overall Project Summary Card */
.project-summary-card {
  padding: 1.75rem 2rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fafbff 100%);
}

.project-summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--proj-color, #117c75) 0%, #2dd4bf 100%);
}

.summary-grid {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Progress Ring */
.summary-ring-wrap {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.progress-ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 10;
}

.ring-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 327;
  stroke-dashoffset: 327;
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 6px rgba(17,124,117, 0.2));
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-percent {
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1;
}

.ring-label {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
}

/* Stats Grid */
.summary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  background: #fff;
  border-color: rgba(17,124,117, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stat-icon-blue { background: rgba(59, 130, 246, 0.1); }
.stat-icon-green { background: rgba(16, 185, 129, 0.1); }
.stat-icon-purple { background: rgba(17,124,117, 0.1); }
.stat-icon-orange { background: rgba(249, 115, 22, 0.1); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

@media (max-width: 768px) {
  .summary-grid {
    flex-direction: column;
    gap: 1.25rem;
  }
}

/* Tab Navigation */
.tabs-nav {
  display: flex;
  gap: 4px;
  margin-bottom: 1.5rem;
  background: white;
  padding: 5px;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-family: inherit;
  position: relative;
}

.tab-btn:hover:not(.active) {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(17,124,117, 0.35);
}

.tab-badge {
  background: rgba(17,124,117, 0.1);
  color: #117c75;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  min-width: 20px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.tab-overview {
  display: contents;
}

/* ===== CONTRIBUTIONS SECTION ===== */
.contributions-section {
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}
.contributions-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f59e0b, #10b981);
}
.contrib-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}
.contrib-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 3rem;
  color: #94a3b8;
}
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #117c75;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Podium */
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  margin-bottom: 2rem;
  padding: 1.5rem 0;
}
.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  max-width: 180px;
}
.podium-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e2e8f0;
  margin-bottom: 6px;
}
.podium-avatar-big {
  width: 64px; height: 64px;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245,158,11,0.2);
}
.podium-avatar img { width: 100%; height: 100%; object-fit: cover; }
.podium-avatar .avatar-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #e2e8f0; color: #64748b; font-weight: 700; font-size: 1.1rem;
}
.podium-rank { font-size: 1.5rem; margin-bottom: 4px; }
.podium-name { font-size: 0.82rem; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.podium-score { font-size: 0.72rem; color: #94a3b8; font-weight: 500; margin-bottom: 8px; }
.podium-bar {
  width: 100%;
  border-radius: 8px 8px 0 0;
}
.bar-1 { height: 80px; background: linear-gradient(180deg, #f59e0b, #fbbf24); }
.bar-2 { height: 60px; background: linear-gradient(180deg, #94a3b8, #cbd5e1); }
.bar-3 { height: 44px; background: linear-gradient(180deg, #cd7f32, #daa520); }

/* Table */
.contrib-table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  margin-bottom: 1.5rem;
}
.contrib-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.contrib-table thead {
  background: #f8fafc;
}
.contrib-table th {
  padding: 12px 14px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border-bottom: 1px solid #e2e8f0;
}
.contrib-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
}
.contrib-table tr:last-child td { border-bottom: none; }
.contrib-table tr:hover td { background: #f8fafc; }
.row-highlight td { background: rgba(17,124,117,0.04) !important; }

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.72rem;
  color: #64748b;
  background: #f1f5f9;
}
.rank-1 { background: #fef3c7; color: #d97706; }
.rank-2 { background: #f1f5f9; color: #64748b; }
.rank-3 { background: #fef2f2; color: #b45309; }

.contrib-member-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.contrib-avatar-sm {
  width: 32px; height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.contrib-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder-sm {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #e2e8f0; color: #64748b; font-weight: 600; font-size: 0.75rem;
}
.contrib-member-name { font-weight: 600; color: #0f172a; }
.contrib-member-sub { font-size: 0.68rem; color: #94a3b8; }

.role-tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 600;
}
.role-owner { background: #fef3c7; color: #d97706; }
.role-member { background: #f0fdf4; color: #16a34a; }

.num-cell { text-align: center; font-weight: 600; }
.done-cell { color: #10b981; }
.progress-cell { color: #f59e0b; }
.overdue-cell { color: #ef4444; }

.rate-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rate-bar-track {
  width: 60px;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.rate-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #117c75, #2dd4bf);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.rate-text {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.score-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.78rem;
  background: linear-gradient(135deg, rgba(17,124,117,0.1), rgba(17,124,117,0.05));
  color: #117c75;
}

.contrib-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}
.legend-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #94a3b8;
}
.legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.contrib-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #94a3b8;
}
.contrib-empty .empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }
.contrib-empty p { font-size: 0.82rem; margin: 0; }

@media (max-width: 640px) {
  .tabs-nav {
    flex-wrap: wrap;
  }
  .tab-btn {
    flex: 1 1 calc(50% - 3px);
  }
}

/* Roadmap Horizontal Scrollable Timeline */
.roadmap-section {
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.roadmap-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--proj-color, #117c75) 0%, #117c75 100%);
}

/* Section Titles */
.section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  letter-spacing: 0.2px;
}

.btn-primary {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(17,124,117, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(17,124,117, 0.4);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #fff;
  border-color: #117c75;
  color: #117c75;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.12);
}

.btn-sm {
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
}
.roadmap-timeline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow-x: auto;
  padding: 10px 0;
  gap: 32px;
}
.timeline-line-background {
  position: absolute;
  top: 25px;
  left: 50px;
  right: 50px;
  height: 4px;
  background: #e5e7eb;
  z-index: 1;
  border-radius: 2px;
}
.timeline-line-fill {
  position: absolute;
  top: 25px;
  left: 50px;
  height: 4px;
  z-index: 1.5;
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  min-width: 140px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.timeline-node:hover {
  transform: translateY(-2px);
}
.node-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.timeline-node:hover .node-circle {
  transform: scale(1.15);
  border-color: var(--proj-color, #117c75) !important;
  color: var(--proj-color, #117c75);
  box-shadow: 0 6px 20px rgba(17,124,117, 0.3);
}
.timeline-node.active .node-circle {
  border-color: #117c75 !important;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(17,124,117, 0.4);
  transform: scale(1.1);
}
.timeline-node.completed .node-circle {
  border-color: #10b981 !important;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

@keyframes flash-highlight {
  0% {
    box-shadow: 0 0 0 0 rgba(17,124,117, 0.4);
    border-color: rgba(17,124,117, 0.4);
  }
  50% {
    box-shadow: 0 0 25px 10px rgba(17,124,117, 0.3);
    border-color: #117c75;
    background: rgba(17,124,117, 0.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(17,124,117, 0);
  }
}
.milestone-card.highlight-flash {
  animation: flash-highlight 1.5s ease-out;
}
.node-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.node-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1f2937;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.node-date {
  font-size: 0.75rem;
  color: #6b7280;
}
.node-progress {
  font-size: 0.8rem;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

/* Milestones Grid */
.milestones-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}
.milestone-card {
  padding: 1.75rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.milestone-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--proj-color, #117c75) 0%, #117c75 100%);
}

.milestone-card.completed::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.milestone-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}
.milestone-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}
.milestone-status-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
  align-self: flex-start;
  letter-spacing: 0.5px;
}
.milestone-status-badge.pending { 
  background: #f3f4f6; 
  color: #6b7280; 
  border: 2px solid #e5e7eb; 
}
.milestone-status-badge.active { 
  background: rgba(17,124,117, 0.1); 
  color: #117c75; 
  border: 2px solid rgba(17,124,117, 0.3); 
}
.milestone-status-badge.completed { 
  background: rgba(16, 185, 129, 0.1); 
  color: #10b981; 
  border: 2px solid rgba(16, 185, 129, 0.3); 
}

.milestone-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.3px;
}
.milestone-desc {
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.5;
  font-weight: 500;
}
.milestone-due {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

.milestone-actions {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.action-btn:hover {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  border-color: transparent;
  transform: translateY(-2px) rotate(5deg);
  box-shadow: 0 6px 20px rgba(17,124,117, 0.3);
}
.action-btn.delete:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

/* Milestone Progress Mini */
.milestone-progress-wrap {
  margin-bottom: 1.5rem;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-weight: 600;
}
.progress-track-mini {
  height: 8px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}
.progress-fill-mini {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Tasks list styling inside milestone */
.milestone-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.milestone-task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.125rem;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.milestone-task-item:hover {
  background: #e2e8f0;
  border-color: rgba(17,124,117, 0.12);
  transform: translateX(3px);
}
.milestone-task-item.done {
  opacity: 0.55;
  background: #f1f5f9;
}

.task-checkbox-wrap {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.task-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0; width: 0;
}
.checkbox-custom {
  height: 22px;
  width: 22px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: inline-block;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.checkbox-custom:hover {
  border-color: #117c75;
}
.task-checkbox:checked ~ .checkbox-custom {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
}
.task-checkbox:checked ~ .checkbox-custom:after {
  display: block;
}

.task-info-wrap {
  flex: 1;
  cursor: pointer;
  text-align: left;
}
.task-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  transition: color 0.2s;
}
.milestone-task-item.done .task-title {
  text-decoration: line-through;
  color: #9ca3af;
}
.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-weight: 600;
}
.task-priority.high { color: #ef4444; font-weight: 700; }
.task-priority.medium { color: #f59e0b; font-weight: 700; }
.task-priority.low { color: #10b981; font-weight: 700; }

.task-actions-wrap {
  display: flex;
  align-items: center;
}
.move-select {
  background: #f1f5f9;
  border: 1.5px solid transparent;
  border-radius: 10px;
  color: #4b5563;
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  outline: none;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  max-width: 160px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.move-select:hover {
  background: #e2e8f0;
}
.move-select:focus {
  background: #fff;
  border-color: #117c75;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.12);
}

.empty-tasks {
  text-align: center;
  font-size: 0.85rem;
  color: #9ca3af;
  padding: 2rem 0;
  font-weight: 500;
}

.btn-add-task {
  width: 100%;
  padding: 1rem;
  background: rgba(17,124,117, 0.05);
  border: 2px dashed #117c75;
  border-radius: 16px;
  color: #117c75;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}
.btn-add-task:hover {
  background: linear-gradient(135deg, rgba(17,124,117, 0.1) 0%, rgba(17,124,117, 0.1) 100%);
  border-style: solid;
  border-color: #117c75;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.2);
}

/* Unassigned tasks section */
.unassigned-section {
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.unassigned-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
}

.empty-milestones {
  text-align: center;
  padding: 4rem 2rem;
  margin-top: 2rem;
}

.empty-milestones .empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.empty-milestones h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 800;
}
.empty-milestones p {
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-actions {
    margin-top: 12px;
  }
}

/* Collaborative Members Section styling */
.members-section {
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.members-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #117c75 0%, #117c75 100%);
}
.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.members-header .section-title {
  margin-bottom: 0;
}
.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  min-width: 260px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.member-item:hover {
  background: white;
  border-color: #117c75;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(17,124,117, 0.15);
}
.member-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}
.member-item:hover .member-avatar {
  border-color: #117c75;
  transform: scale(1.1);
}
.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
}
.member-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
}
.member-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
}
.member-subtext {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-weight: 500;
}
.member-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.3px;
}
.member-badge.owner {
  background: rgba(17,124,117, 0.1);
  color: #117c75;
  border: 2px solid rgba(17,124,117, 0.3);
}
.member-badge.member.accepted {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 2px solid rgba(16, 185, 129, 0.3);
}
.member-badge.member.pending {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}
.remove-member-btn {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  line-height: 1;
}
.remove-member-btn:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: transparent;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}
.invite-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

/* Group Chat Section Styling */
.chat-section {
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.chat-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #117c75 0%, #117c75 100%);
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.chat-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(17,124,117, 0.25);
  flex-shrink: 0;
}
.chat-title {
  margin-bottom: 2px !important;
  font-size: 1.05rem !important;
}
.chat-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}
.chat-online-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f0fdf4;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  border: 1px solid rgba(16, 185, 129, 0.15);
}
.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.1); }
}
.online-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #059669;
}
.chat-messages-container {
  height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 18px;
  padding: 1.5rem;
  border: none;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
}

/* Custom Scrollbar for Chat */
.chat-messages-container::-webkit-scrollbar {
  width: 8px;
}
.chat-messages-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 6px;
}
.chat-messages-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  border-radius: 6px;
}
.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
}

.chat-loading, .chat-empty {
  margin: auto;
  text-align: center;
  padding: 2rem 0;
}
.chat-loading-spinner {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: spin 1s linear infinite;
  display: inline-block;
}
.chat-loading p {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}
.chat-empty-icon {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 4px 12px rgba(17,124,117, 0.15));
}
.chat-empty h4 {
  color: #475569;
  font-weight: 800;
  margin-bottom: 0.375rem;
  font-size: 1.05rem;
}
.chat-empty p {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 300px;
}
.chat-messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.chat-message-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  max-width: 75%;
  align-self: flex-start;
  animation: messageSlideIn 0.3s ease-out;
}
.chat-message-item.mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.chat-message-item .message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #117c75, #117c75) padding-box, linear-gradient(135deg, #117c75, #117c75) border-box;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.15);
}
.chat-message-item .message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.chat-message-item .avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
}
.message-bubble-wrap {
  display: flex;
  flex-direction: column;
  text-align: left;
}
.chat-message-item.mine .message-bubble-wrap {
  text-align: right;
}
.message-sender-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #117c75;
  margin-bottom: 0.3rem;
  margin-left: 0.25rem;
  letter-spacing: 0.2px;
}
.sender-mssv {
  color: #9ca3af;
  font-weight: 600;
}
.message-bubble {
  padding: 0.75rem 1.125rem;
  border-radius: 4px 18px 18px 18px;
  background: white;
  border: none;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.message-bubble:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.chat-message-item.mine .message-bubble {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  border: none;
  border-radius: 18px 4px 18px 18px;
  box-shadow: 0 2px 12px rgba(17,124,117, 0.25);
}
.chat-message-item.mine .message-bubble:hover {
  box-shadow: 0 4px 18px rgba(17,124,117, 0.35);
}
.message-text {
  font-size: 0.9rem;
  color: #1f2937;
  line-height: 1.45;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-weight: 500;
}
.chat-message-item.mine .message-text {
  color: white;
}
.message-time {
  display: block;
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 0.375rem;
  text-align: right;
  font-weight: 600;
}
.chat-message-item.mine .message-time {
  color: rgba(255, 255, 255, 0.7);
}
.chat-input-form {
  display: flex;
  padding-top: 0.25rem;
}
.chat-input-wrap {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  align-items: center;
  background: #f1f5f9;
  border-radius: 50px;
  padding: 0.3rem 0.3rem 0.3rem 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid transparent;
}
.chat-input-wrap:focus-within {
  background: #fff;
  border-color: #117c75;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.12);
}
.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 50px;
  padding: 0.75rem 1.25rem;
  color: #1f2937;
  font-size: 0.95rem;
  outline: none;
  transition: none;
  font-weight: 500;
  font-family: inherit;
}
.chat-input::placeholder {
  color: #9ca3af;
}
.chat-send-btn {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(17,124,117, 0.3);
}
.chat-send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(17,124,117, 0.4);
}
.chat-send-btn:active:not(:disabled) {
  transform: scale(0.95);
}
.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* Study Slots grid styles */
.study-slots-grid-wrapper {
  overflow-x: auto;
  padding: 8px 0;
  width: 100%;
}
.study-slots-grid {
  display: grid;
  grid-template-columns: 120px repeat(7, minmax(110px, 1fr));
  gap: 8px;
  min-width: 900px;
}
.grid-header-cell {
  background: linear-gradient(135deg, rgba(17,124,117,0.06), rgba(17,124,117,0.04));
  border: 1px solid rgba(17,124,117,0.12);
  padding: 12px 6px;
  font-weight: 700;
  font-size: 0.85rem;
  color: #117c75;
  text-align: center;
  border-radius: 10px;
}
.grid-row-header-cell {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 14px 8px;
  font-weight: 700;
  font-size: 0.88rem;
  color: #334155;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  text-align: center;
}
.grid-slot-cell {
  position: relative;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.grid-slot-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.grid-slot-cell.free {
  background: #f0fdf4;
  border-color: rgba(16, 185, 129, 0.2);
}
.grid-slot-cell.free:hover {
  background: #dcfce7;
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.12);
}

.grid-slot-cell.busy {
  background: #fef2f2;
  border-color: rgba(239, 68, 68, 0.15);
}
.grid-slot-cell.busy:hover {
  background: #fee2e2;
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
}

.slot-free-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.slot-badge-free {
  font-size: 0.75rem;
  font-weight: 800;
  color: #059669;
}
.btn-schedule-quick {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #059669;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}
.btn-schedule-quick:hover {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.slot-busy-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center;
  cursor: help;
}
.slot-badge-busy {
  font-size: 0.72rem;
  font-weight: 700;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Tooltip on hover */
.busy-tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 12px;
  width: 220px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  z-index: 100;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.busy-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}
.grid-slot-cell.busy:hover .busy-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}
.tooltip-header {
  font-size: 0.7rem;
  font-weight: 800;
  color: #f87171;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 4px;
}
.tooltip-member-item {
  font-size: 0.75rem;
  color: #e2e8f0;
  text-align: left;
  line-height: 1.4;
}
.tooltip-member-item small {
  color: #94a3b8;
  display: block;
  margin-left: 14px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* No Members Alert */
.no-members-alert { padding: 2rem 1.5rem; text-align: center; color: #64748b; background: #f1f5f9; border-radius: 16px; border: 1.5px dashed #cbd5e1; }
.no-members-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.no-members-alert h4 { color: #1e293b; font-weight: 700; margin-bottom: 0.5rem; font-size: 1rem; }
.no-members-alert p { font-size: 0.85rem; max-width: 450px; margin: 0 auto 1rem; line-height: 1.6; color: #64748b; }

/* Study Slots Section Enhanced */
.study-slots-section { padding: 1.75rem !important; border-radius: 20px !important; }
.slots-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem !important; border-bottom: 1px solid #f1f5f9 !important; padding-bottom: 1rem !important; }
.slots-title { margin-bottom: 4px !important; }
.slots-header-actions { display: flex; gap: 8px; }
.section-desc { color: #64748b !important; font-size: 0.82rem !important; margin: 0 !important; }
.slots-loading { padding: 2.5rem; text-align: center; color: #94a3b8; }
.slots-spinner { display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px; font-size: 1.5rem; }
.slot-time-label { font-size: 0.65rem; color: #94a3b8; display: block; font-weight: 400; }

/* Friend Suggest Group in Invite Modal */
.friend-suggest-group { margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px; }

/* ===== ENHANCED PROFESSIONAL STYLING ===== */

/* Members Section Enhanced */
.members-section {
  padding: 1.75rem;
  margin-bottom: 1.5rem;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #f1f5f9;
  border-radius: 14px;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.member-item:hover {
  background: #e2e8f0;
  border-color: rgba(17,124,117, 0.15);
  transform: translateX(3px);
}

.member-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.member-subtext {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Chat Enhanced */
.chat-messages-container {
  height: 420px;
  overflow-y: auto;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 18px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  border: none;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
}

.message-bubble {
  background: white;
  border-radius: 4px 18px 18px 18px;
  padding: 0.75rem 1.125rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: none;
  transition: all 0.2s ease;
}

.chat-message-item.mine .message-bubble {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  border: none;
  border-radius: 18px 4px 18px 18px;
  box-shadow: 0 2px 12px rgba(17,124,117, 0.25);
}

.chat-message-item.mine .message-bubble:hover {
  box-shadow: 0 4px 18px rgba(17,124,117, 0.35);
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  transition: none;
  font-weight: 500;
  outline: none;
}

/* Milestones Enhanced */
.milestone-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1f2937;
  margin-bottom: 0.75rem;
  letter-spacing: -0.3px;
}

.milestone-desc {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 0.625rem;
  font-weight: 500;
}

.action-btn:hover {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  border-color: #117c75;
  color: white;
  transform: translateY(-2px) rotate(5deg);
  box-shadow: 0 6px 16px rgba(17,124,117, 0.4);
}

/* ===== MODAL AND FORM STYLING ===== */

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeInOverlay 0.3s ease-out;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: white;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.close-btn {
  background: #f9fafb;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 400;
  line-height: 1;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
  transform: scale(1.05);
}

/* Form Styling */
.milestone-form,
.invite-form {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  background: white;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.required {
  color: #ef4444;
  font-weight: 700;
  font-size: 1rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1.125rem;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: #f1f5f9;
  font-size: 0.9375rem;
  color: #1f2937;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 400;
  font-family: inherit;
  outline: none;
}

.form-input:hover,
.form-select:hover {
  background: #e2e8f0;
}

.form-input:focus,
.form-select:focus {
  background: #fff;
  border-color: #117c75;
  box-shadow: 0 0 0 3px rgba(17,124,117, 0.12);
}

.form-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
  font-family: inherit;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 2rem;
  border-top: 1px solid #f3f4f6;
}

.form-actions .btn {
  min-width: 130px;
  padding: 0.875rem 2rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.2px;
  border: none;
}

.form-actions .btn-primary {
  background: linear-gradient(135deg, #117c75 0%, #117c75 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(17,124,117, 0.3);
}

.form-actions .btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17,124,117, 0.4);
}

.form-actions .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-actions .btn-secondary {
  background: white;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
}

.form-actions .btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

/* Custom Scrollbar for Modal */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 8px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 8px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive contributions */
@media (max-width: 768px) {
  .podium { flex-direction: column; align-items: center; }
  .podium-item { max-width: 100%; }
  .podium-bar { height: 30px !important; width: 80%; }
  .contrib-header { flex-direction: column; gap: 12px; align-items: flex-start; }
}

/* ===== COMPREHENSIVE MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .project-detail-page {
    background: #f8fafc;
    min-height: auto;
  }

  .project-detail-page::before {
    display: none;
  }

  .page-header {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0 0.25rem;
  }

  .header-actions {
    width: 100%;
    margin-top: 0;
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }

  .btn-back {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .page-title {
    font-size: 1.4rem;
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: 0.82rem;
  }

  .summary-grid {
    flex-direction: column;
    gap: 1.25rem;
  }

  .summary-ring-wrap {
    width: 100px;
    height: 100px;
  }

  .ring-percent {
    font-size: 1.4rem;
  }

  .summary-stats {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .stat-item {
    padding: 0.65rem 0.75rem;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 34px;
    height: 34px;
    font-size: 0.95rem;
  }

  .stat-value {
    font-size: 1.05rem;
  }

  .stat-label {
    font-size: 0.68rem;
  }

  .glass-card {
    border-radius: 14px;
    margin-bottom: 0.75rem;
  }

  .project-summary-card {
    padding: 1.25rem 1rem;
  }

  .tabs-nav {
    gap: 3px;
    padding: 4px;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tabs-nav::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    flex: 0 0 auto;
    padding: 0.55rem 0.75rem;
    font-size: 0.78rem;
    border-radius: 8px;
    white-space: nowrap;
  }

  .tab-badge {
    font-size: 0.6rem;
    padding: 1px 5px;
  }

  .milestone-card {
    padding: 1.1rem;
    border-radius: 14px;
  }

  .milestone-card-header {
    flex-direction: column;
    gap: 0.6rem;
  }

  .milestone-actions {
    align-self: flex-end;
  }

  .action-btn {
    width: 34px;
    height: 34px;
    font-size: 0.9rem;
  }

  .milestone-title {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .milestone-desc {
    font-size: 0.85rem;
  }

  .milestone-due {
    font-size: 0.78rem;
  }

  .milestone-tasks {
    gap: 0.5rem;
  }

  .milestone-task-item {
    flex-wrap: wrap;
    gap: 0.6rem;
    padding: 0.7rem;
    border-radius: 10px;
  }

  .task-info-wrap {
    flex: 1 1 calc(100% - 80px);
    min-width: 0;
  }

  .task-title {
    font-size: 0.88rem;
  }

  .task-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.72rem;
  }

  .task-actions-wrap {
    width: 100%;
  }

  .move-select {
    width: 100%;
    max-width: none;
    font-size: 0.78rem;
    padding: 0.45rem 0.6rem;
    min-height: 44px;
  }

  .btn-add-task {
    padding: 0.75rem;
    font-size: 0.82rem;
    min-height: 44px;
    border-radius: 12px;
  }

  .roadmap-section {
    padding: 1.1rem;
    border-radius: 14px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .roadmap-timeline {
    min-width: 600px;
    padding: 10px 0;
    gap: 24px;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .members-header {
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
  }

  .members-list {
    flex-direction: column;
    gap: 0.5rem;
  }

  .member-item {
    padding: 0.75rem;
    min-width: 0;
    border-radius: 12px;
    gap: 0.6rem;
  }

  .member-avatar {
    width: 38px;
    height: 38px;
  }

  .member-name {
    font-size: 0.88rem;
  }

  .member-subtext {
    font-size: 0.72rem;
  }

  .member-badge {
    font-size: 0.6rem;
    padding: 3px 7px;
  }

  .chat-section {
    padding: 1.1rem;
    border-radius: 14px;
  }

  .chat-header {
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
  }

  .chat-messages-container {
    height: 300px;
    padding: 1rem;
    border-radius: 14px;
  }

  .chat-message-item {
    max-width: 85%;
  }

  .message-bubble {
    padding: 0.6rem 0.9rem;
  }

  .message-text {
    font-size: 0.85rem;
  }

  .chat-input-wrap {
    border-radius: 50px;
  }

  .chat-input {
    padding: 0.6rem 1rem;
    font-size: 0.88rem;
  }

  .chat-send-btn {
    width: 38px;
    height: 38px;
    min-height: 44px;
    min-width: 44px;
  }

  .study-slots-section {
    padding: 1.1rem !important;
    border-radius: 14px !important;
  }

  .slots-header {
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
  }

  .study-slots-grid {
    min-width: 700px;
  }

  .contributions-section {
    padding: 1.1rem;
    border-radius: 14px;
  }

  .contrib-table-wrap {
    border-radius: 8px;
  }

  .contrib-table {
    font-size: 0.72rem;
  }

  .contrib-table th,
  .contrib-table td {
    padding: 8px 6px;
  }

  .unassigned-section {
    padding: 1.1rem;
    border-radius: 14px;
  }

  .empty-milestones {
    padding: 2rem 1rem;
  }

  .empty-milestones h2 {
    font-size: 1.15rem;
  }

  .empty-milestones p {
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .modal-overlay {
    padding: 0.75rem;
  }

  .modal-content {
    border-radius: 16px;
    max-height: 85vh;
    width: 95%;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.15rem;
  }

  .milestone-form,
  .invite-form {
    padding: 1.5rem;
    gap: 1.25rem;
  }

  .form-group label {
    font-size: 0.8rem;
  }

  .form-input,
  .form-select {
    padding: 0.7rem 0.9rem;
    font-size: 0.88rem;
    border-radius: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-actions {
    padding-top: 1.25rem;
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .form-actions .btn {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    justify-content: center;
    padding: 0.75rem 1.5rem;
  }

  .btn {
    min-height: 44px;
  }

  .btn-sm {
    min-height: 36px;
    padding: 0.4rem 0.75rem;
    font-size: 0.78rem;
  }

  .close-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
