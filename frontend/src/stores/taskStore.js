import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskApi, milestoneApi, gamificationApi } from '@/api/taskApi'
import { useAuthStore } from './authStore'
import { audioService } from '@/utils/audioService'
import { fireConfetti as confetti } from '@/utils/confettiHelper'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)
  const toasts = ref([])
  const filters = ref({ status: '', priority: '', category: '', search: '', view: '' })
  const pagination = ref({ page: 1, limit: 50, total: 0, totalPages: 0 })

  // --- Gamification States ---
  const xp = ref(0)
  const level = ref(1)
  const streak = ref(0)
  const lastCompletedDate = ref(null)
  const achievements = ref([]) // Unlocked badges IDs
  const convertedNotesCount = ref(0)
  const isMuted = ref(audioService.isMuted)
  const showAchievementsModal = ref(false)

  const toggleAchievementsModal = () => {
    showAchievementsModal.value = !showAchievementsModal.value
  }

  const allAchievements = [
    { id: 'first_task', name: 'Bước Chân Đầu Tiên', icon: '🚀', desc: 'Hoàn thành công việc đầu tiên trên hệ thống.' },
    { id: 'three_notes', name: 'Nhà Sáng Tạo Ý Tưởng', icon: '📑', desc: 'Chuyển đổi thành công 3 ghi chú nhanh thành công việc.' },
    { id: 'high_priority', name: 'Chiến Binh Dũng Cảm', icon: '⚡', desc: 'Hoàn thành 3 công việc độ ưu tiên Cao (High).' },
    { id: 'streak_3', name: 'Kỷ Luật Thép', icon: '🎯', desc: 'Duy trì chuỗi Streak hoàn thành liên tục từ 3 ngày trở lên.' }
  ]

  // Filtered tasks
  const filteredTasks = computed(() => {
    let list = [...tasks.value]
    if (filters.value.status) list = list.filter(t => t.status === filters.value.status)
    if (filters.value.priority) list = list.filter(t => t.priority === filters.value.priority)
    if (filters.value.category) list = list.filter(t => t.category === filters.value.category)
    if (filters.value.search) {
      const q = filters.value.search.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
    }
    return list
  })

  // Task counts by status
  const taskCounts = computed(() => ({
    all: tasks.value.length,
    todo: tasks.value.filter(t => t.status === 'todo').length,
    in_progress: tasks.value.filter(t => t.status === 'in_progress').length,
    done: tasks.value.filter(t => t.status === 'done').length,
    overdue: tasks.value.filter(t => t.status === 'overdue').length,
  }))

  // Due soon (within 72h, not done/overdue)
  const dueSoon = computed(() => {
    const now = new Date()
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)
    return tasks.value.filter(t => {
      if (!t.due_date || ['done', 'overdue'].includes(t.status)) return false
      const due = new Date(t.due_date)
      return due > now && due <= in72h
    })
  })

  // Toast system
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3500)
  }

  // --- Gamification Helpers (Server-backed) ---
  const loadGamification = async () => {
    try {
      const res = await gamificationApi.getProfile()
      if (res.data.success) {
        const d = res.data.data
        xp.value = d.xp || 0
        level.value = d.level || 1
        streak.value = d.streak || 0
        lastCompletedDate.value = d.last_completed_date || null
        achievements.value = d.achievements ? (typeof d.achievements === 'string' ? JSON.parse(d.achievements) : d.achievements) : []
        convertedNotesCount.value = d.converted_notes_count || 0
      }
    } catch (err) {
      console.error('Lỗi load gamification từ server:', err)
      xp.value = 0; level.value = 1; streak.value = 0
      lastCompletedDate.value = null; achievements.value = []; convertedNotesCount.value = 0
    }
  }

  const syncGamification = async () => {
    try {
      await gamificationApi.updateProfile({
        xp: xp.value, level: level.value, streak: streak.value,
        last_completed_date: lastCompletedDate.value,
        achievements: achievements.value,
        converted_notes_count: convertedNotesCount.value
      })
    } catch (err) {
      console.error('Lỗi sync gamification:', err)
    }
  }

  const awardXP = async (amount, priority) => {
    try {
      const res = await gamificationApi.awardXP(amount, priority)
      if (res.data.success) {
        const result = res.data.data
        const prevLevel = level.value
        xp.value = result.xp
        level.value = result.level
        audioService.playSuccessSound()
        if (result.leveledUp) {
          audioService.playLevelUpSound()
          confetti({
            particleCount: 180, spread: 100, origin: { y: 0.6 },
            colors: ['#D4AF37', '#34d399', '#6366F1', '#F43F5E', '#A855F7']
          })
          showToast(`🎉 CHÚC MỪNG! Bạn đã THĂNG CẤP thành Cấp ${level.value}! 🛡️`)
        } else {
          showToast(`+${amount} XP! (${priority === 'high' ? '🔴 Cao' : priority === 'low' ? '🟡 Thấp' : '🟠 Trung bình'})`)
        }
        // Update streak from server
        const streakRes = await gamificationApi.updateProfile({})
        if (streakRes.data.success) {
          streak.value = streakRes.data.data.streak || 0
          lastCompletedDate.value = streakRes.data.data.last_completed_date || null
        }
        await loadGamification()
        checkAchievements()
      }
    } catch (err) {
      console.error('Lỗi award XP:', err)
      // Fallback local
      xp.value += amount
    }
  }

  const deductXP = async (amount) => {
    try {
      const res = await gamificationApi.deductXP(amount)
      if (res.data.success) {
        xp.value = res.data.data.xp
      }
    } catch (err) {
      xp.value = Math.max(0, xp.value - amount)
    }
    showToast(`-${amount} XP (Hoàn tác công việc hoàn thành)`)
  }

  const checkAchievements = () => {
    const completedTasks = tasks.value.filter(t => t.status === 'done')
    if (!achievements.value.includes('first_task') && completedTasks.length >= 1) {
      unlockAchievement('first_task')
    }
    if (!achievements.value.includes('streak_3') && streak.value >= 3) {
      unlockAchievement('streak_3')
    }
    const highCompleted = completedTasks.filter(t => t.priority === 'high').length
    if (!achievements.value.includes('high_priority') && highCompleted >= 3) {
      unlockAchievement('high_priority')
    }
    if (!achievements.value.includes('three_notes') && convertedNotesCount.value >= 3) {
      unlockAchievement('three_notes')
    }
  }

  const unlockAchievement = (id) => {
    achievements.value.push(id)
    audioService.playLevelUpSound()
    syncGamification()
    confetti({
      particleCount: 150, spread: 80, origin: { y: 0.5 },
      colors: ['#D4AF37', '#ffffff', '#A855F7', '#14B8A6']
    })
    const achievement = allAchievements.find(a => a.id === id)
    if (achievement) {
      showToast(`🏆 THÀNH TỰU: Đã mở khóa "${achievement.name}"! ${achievement.icon}`)
    }
  }

  const incrementConvertedNotes = () => {
    convertedNotesCount.value++
    syncGamification()
    checkAchievements()
  }

  const toggleMute = () => {
    const muted = audioService.toggleMute()
    isMuted.value = muted
    showToast(muted ? '🔇 Đã tắt âm thanh phản hồi' : '🔊 Đã bật âm thanh phản hồi')
  }

  // --- Task API Operations ---
  const checkAndNotifyDueTasks = () => {
    console.log('[DEBUG] checkAndNotifyDueTasks triggered');
    console.log('[DEBUG] dueSoon tasks list:', dueSoon.value);
    console.log('[DEBUG] Browser Notification Permission:', typeof window !== 'undefined' ? Notification.permission : 'N/A');

    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[DEBUG] Notifications not supported in window context');
      return
    }
    
    if (Notification.permission === 'default') {
      console.log('[DEBUG] Notification permission is default. Requesting permission...');
      Notification.requestPermission().then(permission => {
        console.log('[DEBUG] Permission request result:', permission);
        if (permission === 'granted') {
          checkAndNotifyDueTasks()
        }
      })
      return
    }

    if (Notification.permission === 'granted') {
      const userId = getUserId()
      const notifiedKey = `taskflow_notified_tasks_${userId}`
      let notifiedIds = []
      try {
        const saved = localStorage.getItem(notifiedKey)
        if (saved) notifiedIds = JSON.parse(saved)
      } catch (e) {
        console.error('Lỗi đọc danh sách nhiệm vụ đã thông báo:', e)
      }

      const tasksToNotify = dueSoon.value.filter(t => !notifiedIds.includes(t.id))

      if (tasksToNotify.length > 0) {
        tasksToNotify.forEach(task => {
          const formattedDate = new Date(task.due_date).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          })
          const notif = new Notification("⏰ Nhiệm Vụ Học Tập Sắp Đến Hạn!", {
            body: `Nhiệm vụ: ${task.title}\nHạn chót: ${formattedDate}`,
            icon: '/favicon.ico'
          })

          notif.onclick = () => {
            window.focus()
          }

          notifiedIds.push(task.id)
        })
        localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds))
      }
    }
  }

  const fetchTasks = async (page = 1, append = false) => {
    loading.value = true
    error.value = null
    try {
      const params = { ...filters.value, page, limit: 50 }
      const res = await taskApi.getAll(params)
      if (append) {
        tasks.value = [...tasks.value, ...res.data.data]
      } else {
        tasks.value = res.data.data
      }
      if (res.data.pagination) {
        pagination.value = res.data.pagination
      }
      await loadGamification()
      checkAndNotifyDueTasks()
    } catch (err) {
      error.value = 'Không thể tải danh sách công việc'
      showToast(error.value, 'error')
    } finally {
      loading.value = false
    }
  }

  const createTask = async (data) => {
    try {
      const res = await taskApi.create(data)
      tasks.value.unshift(res.data.data)
      audioService.playClickSound()
      showToast('✅ Tạo công việc thành công!')
      checkAndNotifyDueTasks() // Check and show desktop notifications for the new task
      return res.data.data
    } catch (err) {
      showToast('❌ Không thể tạo công việc', 'error')
      throw err
    }
  }

  const updateTask = async (id, data) => {
    try {
      const oldTask = tasks.value.find(t => t.id === id)
      const oldStatus = oldTask ? oldTask.status : null
      const oldPriority = oldTask ? oldTask.priority : 'medium'

      const res = await taskApi.update(id, data)
      const newTask = res.data.data
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = newTask

      showToast('✅ Cập nhật thành công!')

      // --- XP Reward Hook ---
      const newStatus = newTask.status
      const priority = newTask.priority || 'medium'
      
      if (oldStatus !== 'done' && newStatus === 'done') {
        const xpReward = priority === 'high' ? 150 : priority === 'low' ? 50 : 100
        awardXP(xpReward, priority)
      } else if (oldStatus === 'done' && newStatus !== 'done') {
        const xpDeduction = priority === 'high' ? 150 : priority === 'low' ? 50 : 100
        deductXP(xpDeduction)
      } else {
        audioService.playClickSound()
      }

      return newTask
    } catch (err) {
      showToast('❌ Không thể cập nhật', 'error')
      throw err
    }
  }

  const deleteTask = async (id) => {
    try {
      await taskApi.delete(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      audioService.playClickSound()
      showToast('🗑️ Đã xóa công việc')
    } catch (err) {
      showToast('❌ Không thể xóa', 'error')
      throw err
    }
  }

  const changeStatus = async (id, status) => {
    return updateTask(id, { status })
  }

  const loadMoreTasks = async () => {
    if (pagination.value.page < pagination.value.totalPages && !loading.value) {
      await fetchTasks(pagination.value.page + 1, true)
    }
  }

  // --- Project API Operations ---
  const projects = ref([])
  const loadingProjects = ref(false)

  const fetchProjects = async () => {
    loadingProjects.value = true
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.getAll()
      projects.value = res.data.data
    } catch (err) {
      console.error('Không thể tải danh sách dự án', err)
    } finally {
      loadingProjects.value = false
    }
  }

  const createProject = async (data) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.create(data)
      projects.value.push(res.data.data)
      showToast('✅ Đã tạo dự án thành công')
      return res.data.data
    } catch (err) {
      showToast('❌ Không thể tạo dự án', 'error')
      throw err
    }
  }

  const deleteProject = async (id) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      await projectApi.delete(id)
      projects.value = projects.value.filter(p => p.id !== id)
      showToast('🗑️ Đã xóa dự án')
    } catch (err) {
      showToast('❌ Không thể xóa dự án', 'error')
      throw err
    }
  }

  const milestones = ref([])
  const loadingMilestones = ref(false)

  const fetchMilestones = async (projectId) => {
    loadingMilestones.value = true
    try {
      const res = await milestoneApi.getAll(projectId)
      milestones.value = res.data.data
    } catch (err) {
      console.error('Không thể tải mốc tiến độ', err)
    } finally {
      loadingMilestones.value = false
    }
  }

  const createMilestone = async (projectId, data) => {
    try {
      const res = await milestoneApi.create(projectId, data)
      milestones.value.push(res.data.data)
      showToast('✅ Đã tạo mốc tiến độ thành công')
      return res.data.data
    } catch (err) {
      showToast('❌ Không thể tạo mốc tiến độ', 'error')
      throw err
    }
  }

  const updateMilestone = async (projectId, id, data) => {
    try {
      const res = await milestoneApi.update(projectId, id, data)
      const idx = milestones.value.findIndex(m => m.id === id)
      if (idx !== -1) milestones.value[idx] = res.data.data
      showToast('✅ Cập nhật mốc tiến độ thành công')
      return res.data.data
    } catch (err) {
      showToast('❌ Không thể cập nhật mốc tiến độ', 'error')
      throw err
    }
  }

  const deleteMilestone = async (projectId, id) => {
    try {
      await milestoneApi.delete(projectId, id)
      milestones.value = milestones.value.filter(m => m.id !== id)
      showToast('🗑️ Đã xóa mốc tiến độ')
    } catch (err) {
      showToast('❌ Không thể xóa mốc tiến độ', 'error')
      throw err
    }
  }

  // --- Project Members & Invitations API Operations ---
  const projectMembers = ref([])
  const invitations = ref([])
  const loadingMembers = ref(false)

  const fetchProjectMembers = async (projectId) => {
    loadingMembers.value = true
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.getMembers(projectId)
      projectMembers.value = res.data.data
    } catch (err) {
      console.error('Không thể tải danh sách thành viên dự án', err)
    } finally {
      loadingMembers.value = false
    }
  }

  const inviteProjectMember = async (projectId, email) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.inviteMember(projectId, email)
      showToast(res.data.message || '✅ Đã gửi lời mời thành công')
      await fetchProjectMembers(projectId)
      return res.data.data
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể mời thành viên'
      showToast(`❌ ${errMsg}`, 'error')
      throw err
    }
  }

  const removeProjectMember = async (projectId, userId) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      await projectApi.removeMember(projectId, userId)
      showToast('🗑️ Đã xóa thành viên/hủy lời mời')
      await fetchProjectMembers(projectId)
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể xóa thành viên'
      showToast(`❌ ${errMsg}`, 'error')
      throw err
    }
  }

  const fetchInvitations = async () => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.getInvitations()
      invitations.value = res.data.data
    } catch (err) {
      console.error('Không thể tải danh sách lời mời', err)
    }
  }

  const acceptInvitation = async (projectId) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      await projectApi.acceptInvitation(projectId)
      showToast('🎉 Chấp nhận lời mời tham gia dự án thành công!')
      await fetchInvitations()
      await fetchProjects()
      await fetchTasks()
    } catch (err) {
      showToast('❌ Không thể chấp nhận lời mời', 'error')
      throw err
    }
  }

  const declineInvitation = async (projectId) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      await projectApi.declineInvitation(projectId)
      showToast('✅ Đã từ chối lời mời')
      await fetchInvitations()
    } catch (err) {
      showToast('❌ Không thể từ chối lời mời', 'error')
      throw err
    }
  }

  // --- Project Chats API Operations ---
  const projectChats = ref([])
  const loadingChats = ref(false)

  const fetchProjectChats = async (projectId) => {
    loadingChats.value = true
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.getChats(projectId)
      projectChats.value = res.data.data
    } catch (err) {
      console.error('Không thể tải tin nhắn dự án', err)
    } finally {
      loadingChats.value = false
    }
  }

  const sendProjectChatMessage = async (projectId, message) => {
    try {
      const { projectApi } = await import('@/api/taskApi')
      const res = await projectApi.sendChat(projectId, message)
      projectChats.value.push(res.data.data)
      return res.data.data
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể gửi tin nhắn'
      showToast(`❌ ${errMsg}`, 'error')
      throw err
    }
  }

  if (typeof window !== 'undefined') {
    setInterval(() => {
      const authStore = useAuthStore()
      if (authStore.isLoggedIn) {
        checkAndNotifyDueTasks()
      }
    }, 60000)
  }

  return {
    tasks, projects, milestones, projectMembers, invitations, projectChats, loading, loadingProjects, loadingMilestones, loadingMembers, loadingChats, error, filters, toasts, pagination,
    filteredTasks, taskCounts, dueSoon,
    xp, level, streak, lastCompletedDate, achievements, allAchievements, isMuted, convertedNotesCount,
    showAchievementsModal,
    fetchTasks, fetchProjects, fetchMilestones, fetchProjectMembers, inviteProjectMember, removeProjectMember, fetchInvitations, acceptInvitation, declineInvitation, fetchProjectChats, sendProjectChatMessage,
    createProject, deleteProject, createMilestone, updateMilestone, deleteMilestone, createTask, updateTask, deleteTask, changeStatus, showToast,
    incrementConvertedNotes, toggleMute, toggleAchievementsModal, checkAndNotifyDueTasks, loadGamification, loadMoreTasks
  }
})
