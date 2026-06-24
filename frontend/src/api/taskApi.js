import axios from 'axios'
import { isCapacitor, getApiBase } from '@/utils/serverConfig'

const prodApiUrl = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: prodApiUrl ? `${prodApiUrl}/api` : '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Auto-attach token & set dynamic baseURL for mobile
api.interceptors.request.use(config => {
  if (isCapacitor()) {
    config.baseURL = getApiBase() + '/api'
  }
  const token = localStorage.getItem('taskflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 Unauthorized (Token expired)
api.interceptors.response.use(
  response => response,
  error => {
    // Ignore 401 errors from the login endpoint so the component can handle it and show the error message
    if (error.response && error.response.status === 401) {
      const isLoginOrRegister = window.location.pathname.includes('/login') || 
                                window.location.pathname.includes('/register') || 
                                window.location.hash.includes('/login') || 
                                window.location.hash.includes('/register');
      if (!error.config.url.includes('/auth/login') && !isLoginOrRegister) {
        localStorage.removeItem('taskflow_token')
        localStorage.removeItem('taskflow_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const taskApi = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getCategories: () => api.get('/tasks/categories'),
  getDependenciesAll: () => api.get('/tasks/dependencies/all'),
  addDependency: (id, dependsOnTaskId) => api.post(`/tasks/${id}/dependencies`, { dependsOnTaskId }),
  deleteDependency: (id, depId) => api.delete(`/tasks/${id}/dependencies/${depId}`),
}

export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  inviteMember: (projectId, email) => api.post(`/projects/${projectId}/members`, { email }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
  getInvitations: () => api.get('/projects/invitations'),
  acceptInvitation: (projectId) => api.post(`/projects/invitations/${projectId}/accept`),
  declineInvitation: (projectId) => api.post(`/projects/invitations/${projectId}/decline`),
  getChats: (projectId) => api.get(`/projects/${projectId}/chats`),
  sendChat: (projectId, message) => api.post(`/projects/${projectId}/chats`, { message }),
  getStudySlots: (projectId) => api.get(`/projects/${projectId}/study-slots`),
  getContributions: (projectId) => api.get(`/projects/${projectId}/contributions`),
}

export const milestoneApi = {
  getAll: (projectId) => api.get(`/projects/${projectId}/milestones`),
  create: (projectId, data) => api.post(`/projects/${projectId}/milestones`, data),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/milestones/${id}`, data),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/milestones/${id}`),
}

export const statsApi = {
  get: () => api.get('/stats'),
  getHeatmap: () => api.get('/stats/heatmap')
}

export const authApi = {
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const subtaskApi = {
  getAll: (taskId) => api.get(`/tasks/${taskId}/subtasks`),
  create: (taskId, data) => api.post(`/tasks/${taskId}/subtasks`, data),
  update: (taskId, id, data) => api.put(`/tasks/${taskId}/subtasks/${id}`, data),
  delete: (taskId, id) => api.delete(`/tasks/${taskId}/subtasks/${id}`),
}

export const commentApi = {
  getTimeline: (taskId) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  delete: (taskId, id) => api.delete(`/tasks/${taskId}/comments/${id}`),
}

export const attachmentApi = {
  getAll: (taskId) => api.get(`/tasks/${taskId}/attachments`),
  upload: (taskId, formData) => api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addLink: (taskId, data) => api.post(`/tasks/${taskId}/attachments/link`, data),
  delete: (taskId, id) => api.delete(`/tasks/${taskId}/attachments/${id}`),
  downloadUrl: (taskId, id) => `/api/tasks/${taskId}/attachments/${id}/download`,
}

export const trashApi = {
  getAll: () => api.get('/trash'),
  restore: (id) => api.put(`/trash/${id}/restore`),
  permanentDelete: (id) => api.delete(`/trash/${id}`),
  emptyTrash: () => api.delete('/trash'),
}

export const aiApi = {
  quickTask: (text) => api.post('/ai/quick-task', { text }),
  decomposeTask: (taskId) => api.post('/ai/decompose', { taskId }),
  chatCoach: (message, history = []) => api.post('/ai/coach', { message, history }),
  quizFromNote: (title, content) => api.post('/ai/quiz-from-note', { title, content }),
}

export const classScheduleApi = {
  getAll: () => api.get('/class-schedules'),
  create: (data) => api.post('/class-schedules', data),
  update: (id, data) => api.put(`/class-schedules/${id}`, data),
  delete: (id) => api.delete(`/class-schedules/${id}`),
}

export const friendshipApi = {
  getAll: () => api.get('/friendships'),
  sendRequest: (email) => api.post('/friendships/request', { email }),
  acceptRequest: (id) => api.post(`/friendships/accept/${id}`),
  removeFriendship: (id) => api.delete(`/friendships/${id}`),
}

export const flashcardApi = {
  getDecks: () => api.get('/flashcards/decks'),
  getDeckById: (id) => api.get(`/flashcards/decks/${id}`),
  createDeck: (data) => api.post('/flashcards/decks', data),
  updateDeck: (id, data) => api.put(`/flashcards/decks/${id}`, data),
  deleteDeck: (id) => api.delete(`/flashcards/decks/${id}`),
  getCards: (deckId) => api.get(`/flashcards/decks/${deckId}/cards`),
  createCard: (data) => api.post('/flashcards/cards', data),
  updateCard: (id, data) => api.put(`/flashcards/cards/${id}`, data),
  deleteCard: (id) => api.delete(`/flashcards/cards/${id}`),
  getDueCards: (deckId) => api.get(`/flashcards/decks/${deckId}/review`),
  reviewCard: (id, rating) => api.post(`/flashcards/cards/${id}/review`, { rating })
}

export const noteApi = {
  getAll: () => api.get('/notes'),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
}

export const gamificationApi = {
  getProfile: () => api.get('/gamification'),
  updateProfile: (data) => api.put('/gamification', data),
  awardXP: (amount, priority) => api.post('/gamification/award-xp', { amount, priority }),
  deductXP: (amount) => api.post('/gamification/deduct-xp', { amount }),
}



export const subjectApi = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
}

export const semesterPlanApi = {
  getAll: () => api.get('/semester-plans'),
  getById: (id) => api.get(`/semester-plans/${id}`),
  create: (data) => api.post('/semester-plans', data),
  update: (id, data) => api.put(`/semester-plans/${id}`, data),
  delete: (id) => api.delete(`/semester-plans/${id}`),
  createObjective: (planId, data) => api.post(`/semester-plans/${planId}/objectives`, data),
  updateObjective: (planId, objectiveId, data) => api.put(`/semester-plans/${planId}/objectives/${objectiveId}`, data),
  deleteObjective: (planId, objectiveId) => api.delete(`/semester-plans/${planId}/objectives/${objectiveId}`),
  createKeyResult: (planId, objectiveId, data) => api.post(`/semester-plans/${planId}/objectives/${objectiveId}/key-results`, data),
  updateKeyResult: (planId, objectiveId, krId, data) => api.put(`/semester-plans/${planId}/objectives/${objectiveId}/key-results/${krId}`, data),
  deleteKeyResult: (planId, objectiveId, krId) => api.delete(`/semester-plans/${planId}/objectives/${objectiveId}/key-results/${krId}`),
  linkTask: (planId, objectiveId, taskId) => api.post(`/semester-plans/${planId}/objectives/${objectiveId}/tasks`, { task_id: taskId }),
  unlinkTask: (planId, objectiveId, taskId) => api.delete(`/semester-plans/${planId}/objectives/${objectiveId}/tasks/${taskId}`),
}

export const habitApi = {
  getAll: () => api.get('/habits'),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  toggleDay: (id, date) => api.post(`/habits/${id}/toggle`, { date }),
  getStats: () => api.get('/habits/stats'),
}

export const timeLogApi = {
  getActive: () => api.get('/time-logs/active'),
  start: (taskId) => api.post('/time-logs/start', { task_id: taskId }),
  stop: (id, notes) => api.post(`/time-logs/${id}/stop`, { notes }),
  getByTask: (taskId) => api.get(`/time-logs/task/${taskId}`),
  getStats: () => api.get('/time-logs/stats'),
  getByTaskStats: () => api.get('/time-logs/by-task'),
}

export const reminderApi = {
  getUpcoming: (hours = 24) => api.get('/reminders/upcoming', { params: { hours } }),
  sendEmail: (task_id) => api.post('/reminders/send-email', { task_id }),
}

export const trendApi = {
  getTrends: (period = 'weekly') => api.get('/stats/trends', { params: { period } }),
}

export const productivityApi = {
  analyze: () => api.get('/ai/productivity'),
}

export const googleAuthApi = {
  login: (data) => api.post('/auth/google', data),
}

export default api


