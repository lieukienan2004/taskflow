<template>
  <div class="task-detail-container" v-if="task">
    <div class="ambient-bg" aria-hidden="true">
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>
    </div>

    <div class="detail-header-actions">
      <router-link to="/tasks" class="back-btn">
        <span class="back-btn-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </span>
        Quay lại Danh sách
      </router-link>
      <div class="header-badges">
        <span class="badge" :class="'priority-' + task.priority">
          <span class="badge-dot"></span>
          {{ formatPriority(task.priority) }}
        </span>
        <span class="badge" :class="'status-' + task.status">
          <span class="badge-dot"></span>
          {{ formatStatus(task.status) }}
        </span>
      </div>
    </div>

    <div class="title-section glass-card">
      <div class="title-row">
        <div v-if="!isEditingTitle" class="title-display">
          <h1>{{ task.title }}</h1>
          <button @click="startEditTitle" class="edit-icon-btn" title="Chỉnh sửa tiêu đề">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div v-else class="title-edit">
          <input ref="titleInputRef" v-model="editableTitle" @blur="saveTitle" @keyup.enter="saveTitle" @keyup.esc="cancelEditTitle" placeholder="Nhập tiêu đề công việc..." class="title-input" />
          <div class="edit-actions">
            <button @click="saveTitle" class="save-btn">Lưu</button>
            <button @click="cancelEditTitle" class="cancel-btn">Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs-nav">
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        Tổng Quan
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'subtasks' }" @click="activeTab = 'subtasks'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        Công Việc Con <span class="tab-badge">{{ subtasks.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'attachments' }" @click="activeTab = 'attachments'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        Tài Liệu <span class="tab-badge">{{ attachments.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Bình Luận <span class="tab-badge">{{ timeline.length }}</span>
      </button>
    </div>

    <div v-show="activeTab === 'overview'" class="tab-content">
      <div class="glass-card overview-card">
      <div class="task-info-card">
        <div class="info-card-header">
          <span class="info-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </span>
          <h3>Thông tin nhiệm vụ</h3>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Danh mục
              </label>
              <input v-model="task.category" @change="updateTaskField('category')" placeholder="Nhập danh mục..." class="field-input" />
            </div>
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                Dự án liên kết
              </label>
              <select v-model="task.subject_id" @change="updateTaskField('subject_id')" class="field-input field-select">
                <option value="">-- Không liên kết --</option>
                <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Thời gian bắt đầu
              </label>
              <input type="datetime-local" v-model="formattedStartTime" @change="saveStartTime" class="field-input field-date" />
            </div>
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Thời gian hoàn thành
              </label>
              <input type="datetime-local" v-model="formattedEndTime" @change="saveEndTime" class="field-input field-date" />
            </div>
          </div>

          <div class="form-row form-row-3">
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Độ ưu tiên
              </label>
              <select v-model="task.priority" @change="updateTaskField('priority')" class="field-input field-select" :class="'priority-select-' + task.priority">
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Trạng thái
              </label>
              <select v-model="task.status" @change="updateTaskStatus" class="field-input field-select" :class="'status-select-' + task.status">
                <option value="todo">Chưa thực hiện</option>
                <option value="in_progress">Đang làm</option>
                <option value="done">Hoàn thành</option>
                <option value="overdue">Trễ hạn</option>
              </select>
            </div>
            <div class="form-field">
              <label class="field-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                Lặp lại
              </label>
              <select v-model="task.recurrence" @change="updateTaskField('recurrence')" class="field-input field-select">
                <option value="none">Không lặp lại</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="yearly">Hàng năm</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="description-section">
        <div class="info-card-header">
          <span class="info-card-icon icon-desc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </span>
          <h3>Mô tả chi tiết</h3>
        </div>
        <div v-if="!isEditingDesc" @click="startEditDesc" class="desc-display" :class="{ 'empty-desc': !task.description }">
          <p v-if="task.description">{{ task.description }}</p>
          <p v-else>Nhấp vào đây để thêm mô tả chi tiết, hướng dẫn nộp khóa luận tốt nghiệp...</p>
        </div>
        <div v-else class="desc-edit">
          <textarea ref="descInputRef" v-model="editableDesc" @blur="saveDesc" @keyup.esc="cancelEditDesc" placeholder="Mô tả chi tiết nội dung công việc, tài liệu tham khảo..." rows="4" class="desc-textarea"></textarea>
          <div class="edit-actions">
            <button @mousedown.prevent="saveDesc" class="save-btn">Lưu</button>
            <button @mousedown.prevent="cancelEditDesc" class="cancel-btn">Hủy</button>
          </div>
        </div>
      </div>
    </div>
    </div>

    <div v-show="activeTab === 'subtasks'" class="tab-content">
      <div class="detail-panel glass-card subtasks-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon icon-subtasks">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </span>
            <div>
              <h3>Công việc con</h3>
              <span class="panel-subtitle">Subtasks</span>
            </div>
          </div>
          <div class="header-right-actions">
            <button @click="decomposeWithAI" class="ai-decompose-btn" :disabled="isDecomposing" title="Tự động phân tách thành các việc con bằng AI">
              <span v-if="isDecomposing" class="btn-spinner"></span>
              <template v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ai-icon"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 22l-.75-12.08A4.001 4.001 0 0 1 12 2z"/></svg>
                AI Tách Việc
              </template>
            </button>
            <span class="progress-ratio">{{ completedSubtasksCount }}/{{ subtasks.length }}</span>
          </div>
        </div>

        <div class="progress-bar-wrapper">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: subtaskProgressPercentage + '%' }"></div>
          </div>
          <span class="progress-percentage">{{ subtaskProgressPercentage }}%</span>
        </div>

        <div class="add-subtask-wrapper">
          <input v-model="newSubtaskTitle" @keyup.enter="createNewSubtask" placeholder="Thêm đầu việc nhỏ..." class="new-subtask-input" />
          <button @click="createNewSubtask" class="add-btn" :disabled="!newSubtaskTitle.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div class="subtasks-list" v-if="subtasks.length > 0">
          <div v-for="sub in subtasks" :key="sub.id" class="subtask-row" :class="{ 'subtask-completed': sub.is_completed }">
            <label class="checkbox-container">
              <input type="checkbox" :checked="!!sub.is_completed" @change="toggleSubtask(sub)" />
              <span class="custom-checkmark"></span>
            </label>
            <span class="subtask-title">{{ sub.title }}</span>
            <button @click="deleteSubtaskItem(sub.id)" class="delete-action-btn" title="Xóa công việc con">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <p>Chưa có công việc con nào</p>
          <span class="empty-hint">Thêm từng bước hoặc dùng AI để tách việc</span>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'attachments'" class="tab-content">
      <div class="detail-panel glass-card attachments-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon icon-attachments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </span>
            <div>
              <h3>Tài liệu đính kèm</h3>
              <span class="panel-subtitle">Files & Links</span>
            </div>
          </div>
          <span class="attachment-count">{{ attachments.length }} tệp</span>
        </div>

        <div class="drag-drop-zone" :class="{ dragover: isDragging }" @dragenter.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @dragover.prevent @drop.prevent="handleFileDrop" @click="triggerFileSelect">
          <input type="file" ref="fileInputRef" @change="handleFileSelect" class="hidden-file-input" multiple />
          <div class="drop-zone-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="upload-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p class="drop-main-text">Thả file khóa luận hoặc click để chọn</p>
            <p class="drop-sub-text">Hỗ trợ: PDF, Word, Excel, Ảnh, ZIP (Max 10MB)</p>
          </div>
        </div>

        <div class="link-attachment-binder">
          <div class="binder-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Thêm liên kết ngoài
          </div>
          <div class="binder-inputs">
            <input v-model="newLinkTitle" placeholder="Tên liên kết (Ví dụ: Slide bài giảng)..." class="binder-input-field" />
            <input v-model="newLinkUrl" placeholder="Địa chỉ URL (https://...)..." class="binder-input-field" />
            <button @click="addWebLink" class="binder-btn" :disabled="!newLinkTitle.trim() || !newLinkUrl.trim()">Lưu</button>
          </div>
        </div>

        <div v-if="isUploading" class="upload-loading-bar">
          <div class="spinner"></div>
          <span>Đang tải tệp lên hệ thống...</span>
        </div>

        <div class="attachments-list" v-if="attachments.length > 0">
          <div v-for="att in attachments" :key="att.id" class="attachment-row">
            <span class="file-icon-emoji">{{ getFileIconEmoji(att.filetype) }}</span>
            <div class="file-metadata">
              <span class="file-name" :title="att.filename">{{ att.filename }}</span>
              <span class="file-size">{{ formatBytes(att.filesize) }}</span>
            </div>
            <div class="attachment-actions">
              <a v-if="att.filetype === 'url'" :href="att.filepath" class="download-action-btn link-action-btn" title="Mở liên kết tài nguyên" target="_blank">🌐</a>
              <a v-else :href="attachmentApi.downloadUrl(task.id, att.id)" class="download-action-btn" title="Tải xuống tệp tin" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </a>
              <button @click="deleteAttachmentItem(att.id)" class="delete-action-btn" title="Xóa tệp đính kèm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <p>Chưa có tài liệu đính kèm</p>
          <span class="empty-hint">Kéo thả PDF, Word hoặc thêm liên kết</span>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'comments'" class="tab-content">
      <div class="detail-panel glass-card timeline-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon icon-timeline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <div>
              <h3>Bình luận & Hoạt động</h3>
              <span class="panel-subtitle">Comments & History</span>
            </div>
          </div>
        </div>

        <div class="add-comment-wrapper">
          <textarea v-model="newCommentText" placeholder="Viết bình luận, phản hồi của giảng viên..." class="comment-textarea" rows="2" @keyup.ctrl.enter="createNewComment"></textarea>
          <div class="comment-submit-row">
            <small class="tip-text">Ctrl + Enter để gửi</small>
            <button @click="createNewComment" class="comment-send-btn" :disabled="!newCommentText.trim()">Gửi bình luận</button>
          </div>
        </div>

        <div class="timeline-stream" v-if="timeline.length > 0">
          <div v-for="item in timeline" :key="item.id" class="timeline-item" :class="'item-type-' + item.type">
            <div class="timeline-bullet">
              <svg v-if="item.type === 'comment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div class="timeline-card">
              <div v-if="item.type === 'comment'" class="timeline-comment-body">
                <div class="timeline-card-header">
                  <div class="user-avatar-placeholder" :style="{ backgroundImage: item.user_avatar ? `url(${item.user_avatar})` : 'none' }">
                    <span v-if="!item.user_avatar">{{ item.user_name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="user-meta">
                    <span class="user-name">{{ item.user_name }}</span>
                    <span class="time-stamp">{{ formatRelativeTime(item.created_at) }}</span>
                  </div>
                  <button v-if="item.user_id === authStore.user?.id" @click="deleteCommentItem(item.db_id)" class="comment-delete-btn" title="Xóa bình luận">×</button>
                </div>
                <p class="comment-text-content">{{ item.content }}</p>
              </div>
              <div v-else class="timeline-activity-body">
                <span class="activity-actor">{{ item.user_name }}</span>
                <span class="activity-desc">{{ formatActivityText(item) }}</span>
                <span class="activity-time">{{ formatRelativeTime(item.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p>Chưa có hoạt động hay bình luận</p>
          <span class="empty-hint">Viết bình luận để bắt đầu thảo luận</span>
        </div>
      </div>
    </div>
  </div>

  <div class="loading-state-wrapper" v-else-if="loading">
    <div class="spinner large"></div>
    <p>Đang tải thông tin chi tiết công việc...</p>
  </div>

  <div class="error-state-wrapper" v-else>
    <div class="error-card glass-card">
      <h2>⚠️ Lỗi Không tìm thấy</h2>
      <p>Không tìm thấy công việc được yêu cầu hoặc bạn không có quyền truy cập.</p>
      <router-link to="/tasks" class="back-btn-filled">Quay lại danh sách</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { taskApi, subtaskApi, commentApi, attachmentApi, aiApi, subjectApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const taskId = route.params.id

const task = ref(null)
const subtasks = ref([])
const attachments = ref([])
const timeline = ref([])
const loading = ref(true)
const subjects = ref([])

const isEditingTitle = ref(false)
const editableTitle = ref('')
const titleInputRef = ref(null)
const isEditingDesc = ref(false)
const editableDesc = ref('')
const descInputRef = ref(null)

const formattedDueDate = ref('')
const formattedStartTime = ref('')
const formattedEndTime = ref('')
const newSubtaskTitle = ref('')

const fileInputRef = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const newLinkTitle = ref('')
const newLinkUrl = ref('')
const isDecomposing = ref(false)
const newCommentText = ref('')
const activeTab = ref('overview')

const completedSubtasksCount = computed(() => subtasks.value.filter(s => s.is_completed).length)
const subtaskProgressPercentage = computed(() => {
  if (subtasks.value.length === 0) return 0
  return Math.round((completedSubtasksCount.value / subtasks.value.length) * 100)
})

onMounted(async () => { await fetchAllDetails() })

const fetchAllDetails = async () => {
  loading.value = true
  try {
    const taskRes = await taskApi.getById(taskId)
    task.value = taskRes.data.data
    editableTitle.value = task.value.title
    editableDesc.value = task.value.description || ''
    const toLocalDatetime = (val) => {
      if (!val) return ''
      const d = new Date(val)
      const offset = d.getTimezoneOffset()
      return new Date(d.getTime() - offset * 60 * 1000).toISOString().slice(0, 16)
    }
    formattedDueDate.value = toLocalDatetime(task.value.due_date)
    formattedStartTime.value = toLocalDatetime(task.value.start_time)
    formattedEndTime.value = toLocalDatetime(task.value.end_time)
    try {
      const subjectsRes = await subjectApi.getAll()
      subjects.value = subjectsRes.data.data
    } catch (e) {
      console.warn('Lỗi tải môn học:', e)
    }
    await Promise.all([fetchSubtasks(), fetchAttachments(), fetchTimeline()])
  } catch (err) {
    console.error('Lỗi khi tải chi tiết công việc:', err)
    task.value = null
  } finally {
    loading.value = false
  }
}

const fetchSubtasks = async () => { subtasks.value = (await subtaskApi.getAll(taskId)).data.data }
const fetchAttachments = async () => { attachments.value = (await attachmentApi.getAll(taskId)).data.data }
const fetchTimeline = async () => { timeline.value = (await commentApi.getTimeline(taskId)).data.data }

const startEditTitle = () => {
  isEditingTitle.value = true
  editableTitle.value = task.value.title
  nextTick(() => { if (titleInputRef.value) titleInputRef.value.focus() })
}
const cancelEditTitle = () => { isEditingTitle.value = false }
const saveTitle = async () => {
  if (!editableTitle.value.trim()) { editableTitle.value = task.value.title; isEditingTitle.value = false; return }
  if (editableTitle.value.trim() === task.value.title) { isEditingTitle.value = false; return }
  try {
    const updated = await taskStore.updateTask(taskId, { title: editableTitle.value.trim() })
    task.value.title = updated.title
    isEditingTitle.value = false
    await fetchTimeline()
  } catch {
    editableTitle.value = task.value.title
    isEditingTitle.value = false
  }
}

const startEditDesc = () => {
  isEditingDesc.value = true
  editableDesc.value = task.value.description || ''
  nextTick(() => { if (descInputRef.value) descInputRef.value.focus() })
}
const cancelEditDesc = () => { isEditingDesc.value = false }
const saveDesc = async () => {
  if (editableDesc.value.trim() === (task.value.description || '')) { isEditingDesc.value = false; return }
  try {
    const updated = await taskStore.updateTask(taskId, { description: editableDesc.value.trim() })
    task.value.description = updated.description
    isEditingDesc.value = false
    await fetchTimeline()
  } catch {
    isEditingDesc.value = false
  }
}

const saveStartTime = async () => {
  try {
    const nextStartTime = formattedStartTime.value ? new Date(formattedStartTime.value).toISOString() : null
    const updated = await taskStore.updateTask(taskId, { start_time: nextStartTime })
    task.value.start_time = updated.start_time
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const saveEndTime = async () => {
  try {
    const nextEndTime = formattedEndTime.value ? new Date(formattedEndTime.value).toISOString() : null
    const updated = await taskStore.updateTask(taskId, { end_time: nextEndTime })
    task.value.end_time = updated.end_time
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const updateTaskField = async (field) => {
  try {
    const data = { [field]: task.value[field] }
    const updated = await taskStore.updateTask(taskId, data)
    task.value[field] = updated[field]
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const updateTaskStatus = async () => {
  try {
    const updated = await taskStore.updateTask(taskId, { status: task.value.status })
    task.value.status = updated.status
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const createNewSubtask = async () => {
  if (!newSubtaskTitle.value.trim()) return
  try {
    const res = await subtaskApi.create(taskId, { title: newSubtaskTitle.value.trim() })
    subtasks.value.push(res.data.data)
    newSubtaskTitle.value = ''
    taskStore.showToast('✅ Thêm công việc con thành công')
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const toggleSubtask = async (sub) => {
  try {
    const nextVal = !sub.is_completed
    const res = await subtaskApi.update(taskId, sub.id, { is_completed: nextVal })
    const idx = subtasks.value.findIndex(s => s.id === sub.id)
    if (idx !== -1) subtasks.value[idx] = res.data.data
    taskStore.showToast(nextVal ? '✓ Đã hoàn thành công việc con' : '↩ Đã mở lại công việc con')
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const deleteSubtaskItem = async (subId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa công việc con này?')) return
  try {
    await subtaskApi.delete(taskId, subId)
    subtasks.value = subtasks.value.filter(s => s.id !== subId)
    taskStore.showToast('🗑️ Đã xóa công việc con')
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const addWebLink = async () => {
  if (!newLinkTitle.value.trim() || !newLinkUrl.value.trim()) return
  try {
    const res = await attachmentApi.addLink(taskId, { filename: newLinkTitle.value.trim(), filepath: newLinkUrl.value.trim() })
    attachments.value.unshift(res.data.data)
    newLinkTitle.value = ''
    newLinkUrl.value = ''
    taskStore.showToast('✅ Đã thêm liên kết tài liệu thành công!')
    await fetchTimeline()
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Thêm liên kết thất bại', 'error')
  }
}

const decomposeWithAI = async () => {
  if (isDecomposing.value) return
  isDecomposing.value = true
  try {
    const res = await aiApi.decomposeTask(taskId)
    if (res.data?.success) {
      subtasks.value.push(...res.data.data)
      taskStore.showToast(`🤖 AI đã tự động phân tách thành công ${res.data.data.length} việc con!`)
      await fetchTimeline()
    } else {
      taskStore.showToast(res.data.message || 'Lỗi phân tách công việc', 'error')
    }
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Phân tách việc con bằng AI thất bại', 'error')
  } finally {
    isDecomposing.value = false
  }
}

const triggerFileSelect = () => { if (fileInputRef.value) fileInputRef.value.click() }
const handleFileSelect = (e) => { if (e.target.files.length > 0) uploadFiles(e.target.files) }
const handleFileDrop = (e) => { isDragging.value = false; if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files) }

const uploadFiles = async (files) => {
  isUploading.value = true
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 10 * 1024 * 1024) {
        taskStore.showToast(`❌ Tệp ${file.name} vượt quá dung lượng cho phép (10MB)`, 'error')
        continue
      }
      const formData = new FormData()
      formData.append('file', file)
      const res = await attachmentApi.upload(taskId, formData)
      attachments.value.unshift(res.data.data)
    }
    taskStore.showToast('✅ Tải tệp đính kèm lên thành công!')
    await fetchTimeline()
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Tải tệp lên thất bại. Loại tệp không được hỗ trợ!', 'error')
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const deleteAttachmentItem = async (attId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa tệp đính kèm này khỏi công việc?')) return
  try {
    await attachmentApi.delete(taskId, attId)
    attachments.value = attachments.value.filter(a => a.id !== attId)
    taskStore.showToast('🗑️ Đã xóa tệp đính kèm')
    await fetchTimeline()
  } catch (err) { console.error(err) }
}

const createNewComment = async () => {
  if (!newCommentText.value.trim()) return
  try {
    const res = await commentApi.create(taskId, { content: newCommentText.value.trim() })
    const rawComment = res.data.data
    timeline.value.unshift({
      id: `comment_${rawComment.id}`,
      db_id: rawComment.id,
      type: 'comment',
      task_id: rawComment.task_id,
      user_id: rawComment.user_id,
      user_name: rawComment.user_name || authStore.user?.name,
      user_avatar: rawComment.user_avatar || authStore.user?.avatar,
      content: rawComment.content,
      created_at: rawComment.created_at
    })
    newCommentText.value = ''
    taskStore.showToast('💬 Đã thêm bình luận')
  } catch (err) { console.error(err) }
}

const deleteCommentItem = async (commentId) => {
  if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return
  try {
    await commentApi.delete(taskId, commentId)
    timeline.value = timeline.value.filter(item => !(item.type === 'comment' && item.db_id === commentId))
    taskStore.showToast('🗑️ Đã xóa bình luận')
  } catch (err) { console.error(err) }
}

const formatPriority = (p) => ({ high: 'Cao', low: 'Thấp' }[p] || 'Trung bình')
const formatStatus = (s) => ({ todo: 'Chưa làm', in_progress: 'Đang làm', done: 'Hoàn thành', overdue: 'Trễ hạn' }[s] || s)

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const getFileIconEmoji = (mimetype) => {
  if (mimetype === 'url') return '🌐'
  if (!mimetype) return '📁'
  if (mimetype.includes('pdf')) return '📄'
  if (mimetype.includes('word') || mimetype.includes('wordprocessingml')) return '📝'
  if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊'
  if (mimetype.includes('image')) return '🖼️'
  if (mimetype.includes('zip') || mimetype.includes('compressed')) return '📦'
  return '📁'
}

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'Vừa xong'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hôm qua'
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatActivityText = (item) => {
  const { action, old_value, new_value } = item
  if (action === 'created') return `đã tạo công việc "${new_value || ''}"`
  if (action === 'status_changed') return `đã chuyển trạng thái từ "${formatStatus(old_value)}" sang "${formatStatus(new_value)}"`
  if (action === 'priority_changed') return `đã đổi độ ưu tiên từ "${formatPriority(old_value)}" sang "${formatPriority(new_value)}"`
  if (action === 'subtask_added') return `đã thêm công việc con: "${new_value}"`
  if (action === 'subtask_completed') return `đã hoàn thành công việc con: "${new_value}"`
  if (action === 'subtask_uncompleted') return `đã mở lại công việc con: "${new_value}"`
  if (action === 'subtask_removed') return `đã xóa công việc con: "${old_value || new_value || ''}"`
  if (action === 'attachment_added') return `đã thêm tệp đính kèm: "${new_value}"`
  if (action === 'attachment_removed') return `đã xóa tệp đính kèm: "${old_value || new_value}"`
  if (action === 'comment_added') return 'đã thêm bình luận mới'
  if (action === 'restored') return 'đã khôi phục công việc từ thùng rác'
  return `đã thực hiện: ${action}`
}
</script>

<style scoped>
.task-detail-container {
  padding: 0;
  min-height: 100vh;
  position: relative;
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.ambient-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.ambient-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45; animation: floatOrb 20s ease-in-out infinite; }
.orb-1 { width: 480px; height: 480px; background: radial-gradient(circle, rgba(17,124,117,0.25) 0%, transparent 70%); top: -120px; right: -80px; }
.orb-2 { width: 360px; height: 360px; background: radial-gradient(circle, rgba(17,124,117,0.2) 0%, transparent 70%); bottom: 10%; left: -60px; animation-delay: -7s; }
.orb-3 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%); top: 40%; right: 20%; animation-delay: -14s; }
@keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.95)} }
@keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.task-detail-container > *:not(.ambient-bg) { position: relative; z-index: 1; }
.detail-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 12px; }
.back-btn { display: inline-flex; align-items: center; gap: 10px; color: #64748b; font-weight: 600; text-decoration: none; font-size: 14px; transition: all 0.25s ease; padding: 8px 16px 8px 10px; border-radius: 12px; background: rgba(255,255,255,0.7); border: 1px solid rgba(226,232,240,0.8); backdrop-filter: blur(8px); }
.back-btn:hover { color: #117c75; background: #fff; border-color: rgba(17,124,117,0.3); box-shadow: 0 4px 16px rgba(17,124,117,0.12); transform: translateX(-2px); }
.back-btn-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(17,124,117,0.08); }
.back-btn-icon svg { width: 16px; height: 16px; }
.header-badges { display: flex; gap: 10px; flex-wrap: wrap; }
.badge { display: inline-flex; align-items: center; gap: 7px; padding: 7px 16px; border-radius: 100px; font-size: 12px; font-weight: 700; letter-spacing: 0.4px; }
.badge-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.priority-high { background: rgba(239,68,68,0.1); color: #dc2626; border: 1px solid rgba(239,68,68,0.25); }
.priority-high .badge-dot { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.6); }
.priority-medium { background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.25); }
.priority-medium .badge-dot { background: #f59e0b; }
.priority-low { background: rgba(16,185,129,0.1); color: #059669; border: 1px solid rgba(16,185,129,0.25); }
.priority-low .badge-dot { background: #10b981; }
.status-todo { background: rgba(148,163,184,0.12); color: #64748b; border: 1px solid rgba(148,163,184,0.3); }
.status-todo .badge-dot { background: #94a3b8; }
.status-in_progress { background: rgba(59,130,246,0.1); color: #2563eb; border: 1px solid rgba(59,130,246,0.25); }
.status-in_progress .badge-dot { background: #3b82f6; animation: pulse 2s infinite; }
.status-done { background: rgba(16,185,129,0.1); color: #059669; border: 1px solid rgba(16,185,129,0.25); }
.status-done .badge-dot { background: #10b981; }
.status-overdue { background: rgba(239,68,68,0.1); color: #dc2626; border: 1px solid rgba(239,68,68,0.25); }
.status-overdue .badge-dot { background: #ef4444; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.glass-card { background: rgba(255,255,255,0.82) !important; border: 1px solid rgba(255,255,255,0.9) !important; border-radius: 24px; box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 8px 32px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.8) !important; backdrop-filter: blur(20px) saturate(180%); transition: box-shadow 0.3s ease, border-color 0.3s ease; }
.glass-card:hover { box-shadow: 0 16px 48px rgba(17,124,117,0.1), inset 0 1px 0 rgba(255,255,255,0.9) !important; border-color: rgba(17,124,117,0.15) !important; }
/* Tab Navigation */
.tabs-nav { display: flex; gap: 6px; margin-bottom: 1.5rem; flex-wrap: wrap; padding: 6px; background: rgba(255,255,255,0.7); border-radius: 16px; border: 1px solid rgba(226,232,240,0.6); backdrop-filter: blur(10px); }
.tab-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; font-size: 14px; font-weight: 600; color: #64748b; background: transparent; border: none; cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); white-space: nowrap; }
.tab-btn svg { width: 16px; height: 16px; }
.tab-btn:hover { background: rgba(17,124,117,0.06); color: #117c75; }
.tab-btn.active { background: linear-gradient(135deg, #117c75 0%, #117c75 100%); color: white; box-shadow: 0 4px 14px rgba(17,124,117,0.35); }
.tab-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 100px; font-size: 11px; font-weight: 700; background: rgba(17,124,117,0.1); color: #117c75; }
.tab-btn.active .tab-badge { background: rgba(255,255,255,0.25); color: white; }
.tab-content { animation: fadeIn 0.4s ease both; }
.overview-card { padding: 1.75rem 2rem 1.5rem; margin-bottom: 1.5rem; }
.title-section { padding: 1.75rem 2rem 1.5rem; margin-bottom: 1.5rem; position: relative; overflow: hidden; }
.title-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #117c75, #2dd4bf, #ec4899); border-radius: 24px 24px 0 0; }
.title-row { margin-bottom: 1.25rem; }
.title-display { display: flex; align-items: flex-start; gap: 14px; }
.title-display h1 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin: 0; letter-spacing: -0.03em; line-height: 1.25; background: linear-gradient(135deg, #0f172a, #4338ca); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.edit-icon-btn { background: rgba(17,124,117,0.06); border: 1px solid rgba(17,124,117,0.15); color: #117c75; cursor: pointer; padding: 8px; border-radius: 10px; display: flex; margin-top: 4px; transition: all 0.25s ease; }
.edit-icon-btn:hover { background: rgba(17,124,117,0.12); transform: scale(1.05); }
.edit-icon-btn svg { width: 16px; height: 16px; }
.title-edit { display: flex; gap: 12px; width: 100%; align-items: center; }
.title-input { flex: 1; background: white !important; border: 2px solid #117c75 !important; border-radius: 12px; color: #0f172a !important; font-size: 1.25rem; font-weight: 700; padding: 10px 16px; outline: none; box-shadow: 0 0 0 4px rgba(17,124,117,0.1); }
.edit-actions { display: flex; gap: 8px; }
.save-btn { background: linear-gradient(135deg, #117c75, #5eead4); color: #fff; border: none; font-weight: 700; border-radius: 10px; padding: 10px 20px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 14px rgba(17,124,117,0.35); font-size: 14px; }
.save-btn:hover { transform: translateY(-1px); }
.cancel-btn { background: white !important; color: #64748b !important; border: 1.5px solid #e2e8f0 !important; font-weight: 600; border-radius: 10px; padding: 10px 20px; cursor: pointer; font-size: 14px; }
/* === Section card wrapper for grouped form fields === */
.task-info-card { position: relative; background: linear-gradient(135deg, rgba(17,124,117,0.03), rgba(17,124,117,0.02)); border: 1px solid rgba(17,124,117,0.12); border-radius: 16px; padding: 1.5rem 1.5rem 1.25rem; margin-bottom: 1rem; transition: all 0.3s ease; overflow: hidden; }
.task-info-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #117c75, #2dd4bf); border-radius: 16px 0 0 16px; }
.task-info-card:hover { border-color: rgba(17,124,117,0.2); box-shadow: 0 8px 28px rgba(17,124,117,0.08); }
.info-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; padding-bottom: 0.85rem; border-bottom: 1px solid rgba(17,124,117,0.1); }
.info-card-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #117c75, #5eead4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(17,124,117,0.25); }
.info-card-icon svg { width: 18px; height: 18px; stroke: #fff; }
.info-card-icon.icon-desc { background: linear-gradient(135deg, #ec4899, #f472b6); box-shadow: 0 4px 12px rgba(236,72,153,0.25); }
.info-card-header h3 { font-size: 15px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -0.02em; }
/* === Form rows: group fields into clean horizontal rows === */
.form-rows { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.form-field { display: flex; flex-direction: column; gap: 7px; }
.field-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.field-label svg { width: 13px; height: 13px; stroke: #117c75; flex-shrink: 0; }
/* Filled-style inputs — modern Material Design 3 look */
.field-input { width: 100%; background: #f1f5f9 !important; border: 1.5px solid transparent !important; border-radius: 10px; color: #0f172a !important; padding: 10px 14px; outline: none; font-size: 14px; font-weight: 500; font-family: inherit; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.field-input:hover { background: #e2e8f0 !important; }
.field-input:focus { background: #fff !important; border-color: #117c75 !important; box-shadow: 0 0 0 3px rgba(17,124,117,0.12) !important; }
.field-input::placeholder { color: #94a3b8; font-weight: 400; }
.field-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important; background-repeat: no-repeat !important; background-position: right 12px center !important; background-size: 14px !important; padding-right: 2.2rem !important; }
.field-select option { background: #fff; color: #0f172a; }
.field-date { color-scheme: light !important; }
/* Color-coded selects: filled background tint based on value */
.priority-select-high { background: #fef2f2 !important; color: #dc2626 !important; font-weight: 600; }
.priority-select-high:hover { background: #fee2e2 !important; }
.priority-select-high:focus { background: #fff !important; border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; color: #dc2626 !important; }
.priority-select-medium { background: #fffbeb !important; color: #d97706 !important; font-weight: 600; }
.priority-select-medium:hover { background: #fef3c7 !important; }
.priority-select-medium:focus { background: #fff !important; border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; color: #d97706 !important; }
.priority-select-low { background: #f0fdf4 !important; color: #059669 !important; font-weight: 600; }
.priority-select-low:hover { background: #dcfce7 !important; }
.priority-select-low:focus { background: #fff !important; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important; color: #059669 !important; }
.status-select-todo { background: #f8fafc !important; color: #64748b !important; font-weight: 600; }
.status-select-in_progress { background: #eff6ff !important; color: #2563eb !important; font-weight: 600; }
.status-select-in_progress:hover { background: #dbeafe !important; }
.status-select-in_progress:focus { background: #fff !important; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; color: #2563eb !important; }
.status-select-done { background: #f0fdf4 !important; color: #059669 !important; font-weight: 600; }
.status-select-done:hover { background: #dcfce7 !important; }
.status-select-done:focus { background: #fff !important; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important; color: #059669 !important; }
.status-select-overdue { background: #fef2f2 !important; color: #dc2626 !important; font-weight: 600; }
.status-select-overdue:hover { background: #fee2e2 !important; }
.status-select-overdue:focus { background: #fff !important; border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; color: #dc2626 !important; }
/* === Description section === */
.description-section { display: flex; flex-direction: column; gap: 10px; }
.desc-display { background: #f1f5f9 !important; border: 1.5px solid transparent !important; border-radius: 12px; padding: 16px 18px; color: #334155 !important; font-size: 14px; line-height: 1.75; cursor: pointer; transition: all 0.25s ease; min-height: 72px; }
.desc-display:hover { background: #e2e8f0 !important; }
.empty-desc { color: #94a3b8 !important; font-style: italic; }
.desc-edit { display: flex; flex-direction: column; gap: 10px; }
.desc-textarea { width: 100%; background: #f1f5f9 !important; border: 1.5px solid transparent !important; border-radius: 12px; color: #0f172a !important; padding: 14px 16px; outline: none; font-family: inherit; font-size: 14px; line-height: 1.7; resize: vertical; transition: all 0.2s ease; }
.desc-textarea:focus { background: #fff !important; border-color: #117c75 !important; box-shadow: 0 0 0 3px rgba(17,124,117,0.12); }
.detail-workspace-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.detail-panel { padding: 1.75rem 2rem; display: flex; flex-direction: column; min-height: auto; position: relative; overflow: hidden; animation: panelIn 0.5s cubic-bezier(0.16,1,0.3,1) both; margin-bottom: 1.5rem; }
.detail-panel:nth-child(1) { animation-delay: 0.1s; }
.detail-panel:nth-child(2) { animation-delay: 0.2s; }
.detail-panel:nth-child(3) { animation-delay: 0.3s; }
@keyframes panelIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.detail-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 24px 24px 0 0; }
.subtasks-panel::before { background: linear-gradient(90deg, #117c75, #5eead4); }
.attachments-panel::before { background: linear-gradient(90deg, #2dd4bf, #2dd4bf); }
.timeline-panel::before { background: linear-gradient(90deg, #ec4899, #f472b6); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(226,232,240,0.8); gap: 12px; }
.panel-title-group { display: flex; align-items: center; gap: 12px; }
.panel-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.25s ease; }
.detail-panel:hover .panel-icon { transform: scale(1.05); }
.panel-icon svg { width: 18px; height: 18px; }
.icon-subtasks { background: linear-gradient(135deg, rgba(17,124,117,0.12), rgba(17,124,117,0.06)); color: #117c75; }
.icon-attachments { background: linear-gradient(135deg, rgba(17,124,117,0.12), rgba(17,124,117,0.06)); color: #2dd4bf; }
.icon-timeline { background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(236,72,153,0.06)); color: #ec4899; }
.panel-header h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
.panel-subtitle { font-size: 11px; color: #94a3b8; font-weight: 500; }
.progress-ratio, .attachment-count { font-size: 12px; color: #117c75; background: rgba(17,124,117,0.08); padding: 5px 12px; border-radius: 100px; font-weight: 700; border: 1px solid rgba(17,124,117,0.15); white-space: nowrap; }
.progress-bar-wrapper { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
.progress-bar-track { flex: 1; height: 6px; background: rgba(226,232,240,0.8); border-radius: 100px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #117c75, #2dd4bf 60%, #ec4899); border-radius: 100px; transition: width 0.6s cubic-bezier(0.16,1,0.3,1); position: relative; }
.progress-bar-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmerBar 2s infinite; }
@keyframes shimmerBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
.progress-percentage { font-size: 12px; font-weight: 700; color: #117c75; min-width: 36px; text-align: right; }
.add-subtask-wrapper { display: flex; gap: 8px; margin-bottom: 1rem; }
.new-subtask-input { flex: 1; background: #f1f5f9; border: 1.5px solid transparent; border-radius: 10px; color: #0f172a; padding: 10px 14px; outline: none; font-size: 14px; font-weight: 500; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.new-subtask-input::placeholder { color: #94a3b8; }
.new-subtask-input:hover { background: #e2e8f0; }
.new-subtask-input:focus { background: #fff; border-color: #117c75; box-shadow: 0 0 0 3px rgba(17,124,117,0.12); }
.add-btn { background: linear-gradient(135deg, #117c75, #5eead4); border: none; color: #fff; border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 12px rgba(17,124,117,0.3); flex-shrink: 0; }
.add-btn:hover:not(:disabled) { transform: scale(1.05); }
.add-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.add-btn svg { width: 18px; height: 18px; }
.subtasks-list, .attachments-list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; max-height: 340px; padding-right: 4px; }
.attachments-list { max-height: 260px; }
.subtask-row, .attachment-row { display: flex; align-items: center; background: #f1f5f9; border: 1px solid transparent; border-radius: 10px; padding: 10px 13px; transition: all 0.2s ease; gap: 12px; }
.subtask-row:hover, .attachment-row:hover { background: #e2e8f0; }
.subtask-row:hover { border-color: rgba(17,124,117,0.1); }
.attachment-row:hover { border-color: rgba(17,124,117,0.1); }
.subtask-title { flex: 1; color: #334155; font-size: 14px; font-weight: 500; line-height: 1.4; }
.subtask-completed .subtask-title { text-decoration: line-through; color: #94a3b8; }
.checkbox-container { display: block; position: relative; width: 20px; height: 20px; cursor: pointer; flex-shrink: 0; }
.checkbox-container input { position: absolute; opacity: 0; height: 0; width: 0; }
.custom-checkmark { position: absolute; top: 0; left: 0; height: 20px; width: 20px; background: white; border: 2px solid #cbd5e1; border-radius: 6px; transition: all 0.2s ease; }
.checkbox-container:hover input ~ .custom-checkmark { border-color: #117c75; }
.checkbox-container input:checked ~ .custom-checkmark { background: linear-gradient(135deg, #117c75, #5eead4); border-color: #117c75; }
.custom-checkmark:after { content: ""; position: absolute; display: none; left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.checkbox-container input:checked ~ .custom-checkmark:after { display: block; }
.delete-action-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 5px; border-radius: 8px; display: flex; opacity: 0; transition: all 0.2s ease; }
.subtask-row:hover .delete-action-btn, .attachment-row:hover .delete-action-btn { opacity: 1; }
.delete-action-btn:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
.delete-action-btn svg { width: 15px; height: 15px; }
.drag-drop-zone { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 22px 20px; text-align: center; cursor: pointer; background: #f1f5f9; transition: all 0.25s ease; margin-bottom: 1rem; }
.drag-drop-zone:hover, .drag-drop-zone.dragover { border-color: #117c75; background: rgba(17,124,117,0.05); box-shadow: 0 4px 20px rgba(17,124,117,0.08); }
.hidden-file-input { display: none; }
.drop-zone-content { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.upload-icon { width: 36px; height: 36px; color: #117c75; margin-bottom: 4px; transition: transform 0.25s ease; }
.drag-drop-zone:hover .upload-icon { transform: translateY(-3px); }
.drop-main-text { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0; }
.drop-sub-text { font-size: 11px; color: #94a3b8; margin: 0; }
.link-attachment-binder { margin-bottom: 1rem; background: #f1f5f9; border: 1px solid rgba(17,124,117,0.08); border-radius: 12px; padding: 14px; }
.binder-title { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
.binder-title svg { width: 14px; height: 14px; stroke: #117c75; }
.binder-inputs { display: flex; flex-direction: column; gap: 8px; }
.binder-input-field { background: #f1f5f9; border: 1.5px solid transparent; border-radius: 10px; padding: 9px 13px; color: #0f172a; font-size: 13px; outline: none; width: 100%; transition: all 0.2s ease; }
.binder-input-field::placeholder { color: #94a3b8; }
.binder-input-field:hover { background: #e2e8f0; }
.binder-input-field:focus { background: #fff; border-color: #117c75; box-shadow: 0 0 0 3px rgba(17,124,117,0.12); }
.binder-btn { background: linear-gradient(135deg, #117c75, #5eead4); border: none; color: white; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 12px rgba(17,124,117,0.25); }
.binder-btn:hover:not(:disabled) { transform: translateY(-1px); }
.binder-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.upload-loading-bar { display: flex; align-items: center; gap: 10px; background: rgba(17,124,117,0.08); border: 1px solid rgba(17,124,117,0.15); border-radius: 12px; padding: 10px 14px; margin-bottom: 1rem; font-size: 13px; color: #117c75; font-weight: 500; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(17,124,117,0.2); border-top-color: #117c75; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.file-icon-emoji { font-size: 22px; line-height: 1; flex-shrink: 0; }
.file-metadata { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.file-name { color: #334155; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-size { font-size: 11px; color: #94a3b8; font-weight: 500; }
.attachment-actions { display: flex; align-items: center; gap: 4px; }
.download-action-btn { color: #64748b; padding: 5px; border-radius: 8px; display: flex; transition: all 0.2s ease; }
.download-action-btn:hover { color: #117c75; background: rgba(17,124,117,0.08); }
.download-action-btn svg { width: 15px; height: 15px; }
.link-action-btn { font-size: 1rem; text-decoration: none; align-items: center; justify-content: center; }
.add-comment-wrapper { background: #f1f5f9; border: 1.5px solid transparent; border-radius: 12px; padding: 13px 15px; margin-bottom: 1rem; transition: all 0.25s ease; }
.add-comment-wrapper:hover { background: #e2e8f0; }
.add-comment-wrapper:focus-within { background: #fff; border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236,72,153,0.1); }
.comment-textarea { width: 100%; background: transparent; border: none; color: #0f172a; padding: 0; outline: none; font-family: inherit; font-size: 14px; line-height: 1.6; resize: none; }
.comment-submit-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(226,232,240,0.8); }
.tip-text { font-size: 11px; color: #94a3b8; }
.comment-send-btn { background: linear-gradient(135deg, #ec4899, #f472b6); color: #fff; border: none; font-weight: 700; font-size: 12px; border-radius: 10px; padding: 8px 16px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
.comment-send-btn:hover:not(:disabled) { transform: translateY(-1px); }
.comment-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.timeline-stream { overflow-y: auto; max-height: 360px; padding-right: 4px; display: flex; flex-direction: column; gap: 12px; position: relative; padding-left: 8px; }
.timeline-stream::before { content: ""; position: absolute; top: 12px; left: 22px; bottom: 12px; width: 2px; background: linear-gradient(180deg, rgba(17,124,117,0.3), rgba(236,72,153,0.2)); border-radius: 2px; }
.timeline-item { display: flex; gap: 12px; position: relative; }
.timeline-bullet { width: 28px; height: 28px; background: white; border: 2px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.timeline-bullet svg { width: 13px; height: 13px; stroke: #94a3b8; }
.item-type-comment .timeline-bullet { background: linear-gradient(135deg, #117c75, #5eead4); border-color: transparent; box-shadow: 0 4px 12px rgba(17,124,117,0.3); }
.item-type-comment .timeline-bullet svg { stroke: white; }
.timeline-card { flex: 1; background: #f1f5f9; border: 1px solid transparent; border-radius: 12px; padding: 12px 14px; transition: all 0.2s ease; }
.timeline-card:hover { background: #e2e8f0; }
.item-type-comment .timeline-card { background: rgba(17,124,117,0.05); border-color: rgba(17,124,117,0.1); }
.timeline-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; position: relative; }
.user-avatar-placeholder { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #117c75, #2dd4bf); color: white; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; flex-shrink: 0; }
.user-meta { display: flex; flex-direction: column; }
.user-name { font-size: 13px; font-weight: 700; color: #0f172a; }
.time-stamp, .activity-time { font-size: 11px; color: #94a3b8; font-weight: 500; }
.comment-delete-btn { position: absolute; right: 0; top: -2px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.comment-delete-btn:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
.comment-text-content { font-size: 14px; color: #334155; margin: 0; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.timeline-activity-body { font-size: 13px; color: #64748b; display: flex; flex-direction: column; gap: 3px; }
.activity-actor { font-weight: 700; color: #334155; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2.5rem 1rem; flex: 1; gap: 6px; }
.empty-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(17,124,117,0.06); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.empty-icon svg { width: 24px; height: 24px; stroke: #117c75; opacity: 0.6; }
.empty-state p { font-size: 14px; font-weight: 600; color: #64748b; margin: 0; }
.empty-hint { font-size: 12px; color: #94a3b8; }
.loading-state-wrapper, .error-state-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 380px; text-align: center; }
.loading-state-wrapper p { color: #94a3b8; margin-top: 16px; font-weight: 500; }
.error-card { padding: 2.5rem; max-width: 420px; text-align: center; }
.error-card h2 { color: #ef4444; margin-top: 0; font-size: 1.25rem; }
.error-card p { color: #94a3b8; margin-bottom: 1.5rem; }
.back-btn-filled { display: inline-block; background: linear-gradient(135deg, #117c75, #5eead4); color: white; font-weight: 600; border-radius: 12px; padding: 11px 24px; text-decoration: none; transition: all 0.25s ease; box-shadow: 0 4px 14px rgba(17,124,117,0.3); }
.back-btn-filled:hover { transform: translateY(-1px); }
.spinner.large { width: 40px; height: 40px; border-width: 3px; }
.header-right-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ai-decompose-btn { background: linear-gradient(135deg, rgba(17,124,117,0.1), rgba(17,124,117,0.08)); border: 1px solid rgba(17,124,117,0.25); color: #117c75; padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.25s ease; white-space: nowrap; }
.ai-decompose-btn .ai-icon { width: 14px; height: 14px; }
.ai-decompose-btn:hover:not(:disabled) { background: linear-gradient(135deg, #117c75, #5eead4); color: white; border-color: transparent; box-shadow: 0 4px 14px rgba(17,124,117,0.35); transform: translateY(-1px); }
.ai-decompose-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner { width: 12px; height: 12px; border: 2px solid rgba(17,124,117,0.2); border-top-color: #117c75; border-radius: 50%; animation: btn-spin 0.8s linear infinite; }
@keyframes btn-spin { to { transform: rotate(360deg); } }
@media (max-width: 1100px) { .form-row-3 { grid-template-columns: 1fr 1fr; } .tabs-nav { gap: 4px; } .tab-btn { padding: 8px 14px; font-size: 13px; } }
@media (max-width: 768px) {
  .task-detail-container { padding: 0.75rem; }
  .detail-header-actions { flex-direction: column; align-items: flex-start; gap: 10px; }
  .back-btn { display: inline-flex; width: 100%; justify-content: center; min-height: 44px; }
  .header-badges { width: 100%; justify-content: flex-start; }

  .title-section { padding: 1rem; margin-bottom: 1rem; }
  .title-display h1 { font-size: 1.25rem; }
  .title-edit { flex-direction: column; gap: 10px; }
  .title-input { font-size: 1.1rem; }
  .edit-actions { width: 100%; }
  .edit-actions .save-btn,
  .edit-actions .cancel-btn { flex: 1; min-height: 44px; }

  .tabs-nav { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap; padding: 4px; gap: 4px; margin-bottom: 1rem; }
  .tab-btn { padding: 8px 12px; font-size: 12px; min-height: 40px; flex-shrink: 0; white-space: nowrap; }
  .tab-btn svg { width: 14px; height: 14px; }

  .overview-card { padding: 1rem; }
  .detail-workspace-grid { grid-template-columns: 1fr; }
  .detail-panel { min-height: auto; padding: 1rem; }

  .task-info-card { padding: 0.85rem; }
  .info-card-header h3 { font-size: 13px; }

  .form-row, .form-row-3 { grid-template-columns: 1fr; gap: 12px; }
  .form-field { min-width: 0; }
  .field-input { min-height: 42px; font-size: 15px; }
  .field-select { min-height: 42px; }

  .desc-display { padding: 12px 14px; min-height: 56px; }
  .desc-textarea { min-height: 100px; }

  .panel-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .panel-title-group { gap: 10px; }
  .panel-icon { width: 34px; height: 34px; }
  .header-right-actions { width: 100%; justify-content: flex-end; }
  .ai-decompose-btn { min-height: 40px; flex: 1; justify-content: center; }

  .add-subtask-wrapper { flex-direction: column; gap: 8px; }
  .new-subtask-input { min-height: 44px; font-size: 15px; }
  .add-btn { width: 100%; height: 44px; }

  .subtasks-list, .attachments-list { max-height: none; }
  .subtask-row, .attachment-row { padding: 10px 11px; }
  .delete-action-btn { opacity: 1; }

  .drag-drop-zone { padding: 18px 14px; }
  .drop-main-text { font-size: 12px; }
  .drop-sub-text { font-size: 10px; }

  .link-attachment-binder { padding: 10px; }
  .binder-inputs { gap: 6px; }
  .binder-input-field { min-height: 40px; font-size: 14px; }
  .binder-btn { width: 100%; min-height: 44px; }

  .add-comment-wrapper { padding: 10px 12px; }
  .comment-textarea { font-size: 15px; }
  .comment-send-btn { width: 100%; min-height: 44px; }
  .comment-submit-row { flex-direction: column-reverse; gap: 8px; align-items: stretch; }

  .timeline-stream { max-height: none; padding-left: 6px; }
  .timeline-stream::before { left: 18px; }
  .timeline-bullet { width: 26px; height: 26px; }
  .timeline-card { padding: 10px 12px; }
  .comment-text-content { font-size: 13px; }
}
@media (max-width: 480px) { .form-row, .form-row-3 { grid-template-columns: 1fr; } .header-badges { width: 100%; } }
</style>
