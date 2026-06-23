import api from './taskApi'
import { getHost } from '@/utils/serverConfig'

const prodApiUrl = import.meta.env.VITE_API_URL || ''

export const adminApi = {
  // Users
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Dashboard Stats
  getStats: () => api.get('/admin/stats'),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  createNotification: (data) => api.post('/admin/notifications', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  
  // Logs
  getLogs: () => api.get('/admin/logs'),

  // User Detail
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id, is_banned) => api.put(`/admin/users/${id}/status`, { is_banned }),

  // Projects
  getProjects: () => api.get('/admin/projects'),

  // Trends
  getTrends: () => api.get('/admin/trends'),
  
  getBackupUrl: () => `${prodApiUrl || getHost() || 'http://localhost:3001'}/api/admin/backup`,
  getExportUrl: () => `${prodApiUrl || getHost() || 'http://localhost:3001'}/api/admin/export`,
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data)
}

export const systemApi = {
  getActiveNotifications: () => api.get('/system/notifications/active')
}
