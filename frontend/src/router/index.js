import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Dashboard from '@/views/Dashboard.vue'
import Tasks from '@/views/Tasks.vue'
import Kanban from '@/views/Kanban.vue'
import Profile from '@/views/Profile.vue'
import Calendar from '@/views/Calendar.vue'
import Notes from '@/views/Notes.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import TaskDetail from '@/views/TaskDetail.vue'
import Trash from '@/views/Trash.vue'
import Reports from '@/views/Reports.vue'
import PremiumFocusRoom from '@/views/PremiumFocusRoom.vue'
import DependencyGraph from '@/views/DependencyGraph.vue'
import Projects from '@/views/Projects.vue'
import ProjectDetail from '@/views/ProjectDetail.vue'
import TimeboxPlanner from '@/views/TimeboxPlanner.vue'
import TaskTemplates from '@/views/TaskTemplates.vue'
import SemesterPlan from '@/views/SemesterPlan.vue'

import AdminLogin from '@/views/admin/Login.vue'
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminUsers from '@/views/admin/Users.vue'
import AdminCategories from '@/views/admin/Categories.vue'
import AdminNotifications from '@/views/admin/Notifications.vue'
import AdminLogs from '@/views/admin/Logs.vue'
import AdminSettings from '@/views/admin/Settings.vue'
import AdminExport from '@/views/admin/Export.vue'
import AdminProjects from '@/views/admin/Projects.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: Login, meta: { title: 'Đăng Nhập', guest: true, layout: 'blank' } },
  { path: '/register', redirect: '/login' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { title: 'Dashboard', requiresAuth: true } },
  { path: '/tasks', name: 'Tasks', component: Tasks, meta: { title: 'Nhiệm Vụ Học Tập', requiresAuth: true } },
  { path: '/templates', name: 'TaskTemplates', component: TaskTemplates, meta: { title: 'Mẫu Công Việc', requiresAuth: true } },
  { path: '/kanban', name: 'Kanban', component: Kanban, meta: { title: 'Kanban Board', requiresAuth: true } },
  { path: '/projects', name: 'Projects', component: Projects, meta: { title: 'Dự Án', requiresAuth: true } },
  { path: '/projects/:id', name: 'ProjectDetail', component: ProjectDetail, meta: { title: 'Chi Tiết Dự Án', requiresAuth: true } },
  { path: '/timebox', name: 'TimeboxPlanner', component: TimeboxPlanner, meta: { title: 'Kế Hoạch Ngày', requiresAuth: true } },
  { path: '/calendar', name: 'Calendar', component: Calendar, meta: { title: 'Lịch', requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { title: 'Hồ Sơ', requiresAuth: true } },

  { path: '/eisenhower', name: 'EisenhowerMatrix', component: () => import('@/views/EisenhowerMatrix.vue'), meta: { title: 'Ma Trận Eisenhower', requiresAuth: true } },
  { path: '/notes', name: 'Notes', component: Notes, meta: { title: 'Ghi Chú Học Tập', requiresAuth: true } },
  { path: '/tasks/:id', name: 'TaskDetail', component: TaskDetail, meta: { title: 'Chi Tiết Nhiệm Vụ', requiresAuth: true } },
  { path: '/trash', name: 'Trash', component: Trash, meta: { title: 'Thùng Rác', requiresAuth: true } },
  { path: '/reports', name: 'Reports', component: Reports, meta: { title: 'Lộ Trình Học Tập', requiresAuth: true } },
  { path: '/focus-room', name: 'FocusRoom', component: PremiumFocusRoom, meta: { title: 'Góc Tự Học Pomodoro', requiresAuth: true } },
  { path: '/dependencies', name: 'DependencyGraph', component: DependencyGraph, meta: { title: 'Sơ đồ Phụ thuộc', requiresAuth: true } },
  { path: '/semester-plan', name: 'SemesterPlan', component: SemesterPlan, meta: { title: 'Mục tiêu & Kế hoạch', requiresAuth: true } },
  
  // Admin Routes
  { path: '/admin', redirect: '/admin/dashboard' },
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin, meta: { title: 'Đăng Nhập Admin', guest: true, layout: 'blank' } },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { title: 'Tổng Quan Hệ Thống', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/users', name: 'AdminUsers', component: AdminUsers, meta: { title: 'Quản Lý Người Dùng', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/projects', name: 'AdminProjects', component: AdminProjects, meta: { title: 'Quản Lý Dự Án', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/categories', name: 'AdminCategories', component: AdminCategories, meta: { title: 'Quản Lý Danh Mục', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/notifications', name: 'AdminNotifications', component: AdminNotifications, meta: { title: 'Thông Báo Hệ Thống', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/logs', name: 'AdminLogs', component: AdminLogs, meta: { title: 'Nhật Ký Hoạt Động', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/settings', name: 'AdminSettings', component: AdminSettings, meta: { title: 'Cài Đặt Hệ Thống', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/export', name: 'AdminExport', component: AdminExport, meta: { title: 'Xuất Dữ Liệu', requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'TaskFlow'} – TaskFlow`

  // Lấy auth store
  const authStore = useAuthStore()
  const isAdminRoute = to.path.startsWith('/admin')

  // Nếu là route admin
  if (isAdminRoute) {
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next({ name: 'AdminLogin' })
    }
    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
      return next({ name: 'Dashboard' })
    }
    if (to.name === 'AdminLogin' && authStore.isLoggedIn && authStore.user?.role === 'admin') {
      return next({ name: 'AdminDashboard' })
    }
    return next()
  }

  // Nếu là route user thường
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login' })
  }
  if (to.meta.guest && authStore.isLoggedIn) {
    if (authStore.user?.role === 'admin') {
      return next({ name: 'AdminDashboard' })
    }
    return next({ name: 'Dashboard' })
  }
  
  // Nếu admin cố tình vào trang user thường thì chuyển về admin dashboard (Tách biệt hoàn toàn)
  if (authStore.isLoggedIn && authStore.user?.role === 'admin' && !isAdminRoute) {
    return next({ name: 'AdminDashboard' })
  }

  next()
})

export default router
