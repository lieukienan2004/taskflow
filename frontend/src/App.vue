<template>
  <component :is="currentLayout">
    <router-view />
  </component>

  <!-- Global Toast Notifications -->
  <div class="toast-container">
    <div
      v-for="toast in taskStore.toasts"
      :key="toast.id"
      :class="`toast toast-${toast.type}`"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BlankLayout from '@/layouts/BlankLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { connectSocket, disconnectSocket } from '@/utils/socketService'

const route = useRoute()
const taskStore = useTaskStore()
const authStore = useAuthStore()

const currentLayout = computed(() => {
  if (route.meta.layout === 'admin') return AdminLayout
  if (route.meta.layout === 'blank') return BlankLayout
  return UserLayout
})

onMounted(() => {
  if (authStore.isLoggedIn) {
    taskStore.fetchTasks()
    connectSocket(authStore.token)
  }
})

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    connectSocket(authStore.token)
  } else {
    disconnectSocket()
  }
})
</script>

<style>
/* Any global styles that shouldn't be scoped can go here if needed */
</style>
