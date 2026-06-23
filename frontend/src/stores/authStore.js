import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/taskApi'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('taskflow_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('taskflow_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  const setAuth = (userData, tokenValue) => {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('taskflow_token', tokenValue)
    localStorage.setItem('taskflow_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('taskflow_token')
    localStorage.removeItem('taskflow_user')
    delete api.defaults.headers.common['Authorization']
  }

  // Khôi phục token khi app load
  const initAuth = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setAuth(res.data.data.user, res.data.data.token)
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    setAuth(res.data.data.user, res.data.data.token)
    return res.data
  }

  const logout = () => {
    clearAuth()
    router.push('/login')
  }

  const updateUser = (userData) => {
    user.value = userData
    localStorage.setItem('taskflow_user', JSON.stringify(userData))
  }

  return { token, user, isLoggedIn, login, register, logout, initAuth, updateUser, clearAuth }
})
