# ProjectDetail.vue CSS Improvements

Thêm các CSS sau vào cuối file `ProjectDetail.vue` trong thẻ `<style scoped>`:

```css
/* Members Section */
.members-section {
  padding: 2.5rem;
  margin-bottom: 2rem;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.member-item:hover {
  background: white;
  border-color: #667eea;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.member-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.member-subtext {
  font-size: 0.875rem;
  color: #6b7280;
}

.member-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.member-badge.owner {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.3);
}

.remove-member-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.member-item:hover .remove-member-btn {
  opacity: 1;
}

.remove-member-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: rotate(90deg);
}

/* Chat Section */
.chat-section {
  padding: 2.5rem;
  margin-bottom: 2rem;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.chat-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.chat-messages-container {
  height: 400px;
  overflow-y: auto;
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.chat-messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-message-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: messageSlideIn 0.3s ease;
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

.chat-message-item.mine {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-bubble-wrap {
  max-width: 70%;
}

.message-sender-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 0.25rem;
  padding-left: 0.75rem;
}

.message-bubble {
  background: white;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.chat-message-item.mine .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.message-text {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.chat-input-form {
  display: flex;
  gap: 1rem;
}

.chat-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.btn-send {
  padding: 1rem 2.5rem;
  border-radius: 50px;
}

/* Milestones Section */
.milestones-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.milestone-card {
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
}

.milestone-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.milestone-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.milestone-status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.milestone-status-badge.pending {
  background: #f3f4f6;
  color: #6b7280;
}

.milestone-status-badge.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.milestone-status-badge.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.milestone-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.milestone-desc {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.milestone-due {
  color: #9ca3af;
  font-size: 0.875rem;
}

.milestone-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #667eea;
  border-color: #667eea;
  transform: translateY(-2px) rotate(5deg);
}

.action-btn.delete:hover {
  background: #ef4444;
  border-color: #ef4444;
}

/* Empty States */
.empty-milestones {
  padding: 5rem 3rem;
  text-align: center;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

.empty-milestones h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
}

.empty-milestones p {
  font-size: 1.05rem;
  color: #6b7280;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto 2rem;
}
```

## Hướng dẫn áp dụng:

1. Mở file `ProjectDetail.vue`
2. Tìm thẻ `</style>` ở cuối file
3. Thêm CSS trên vào TRƯỚC thẻ đóng `</style>`
4. Save file

Giao diện sẽ đẹp hơn nhiều với:
- Background sáng như Habit Tracker
- White cards với subtle shadows
- Smooth animations
- Modern typography
- Better spacing
