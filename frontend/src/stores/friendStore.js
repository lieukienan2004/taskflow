import { defineStore } from 'pinia'
import { ref } from 'vue'
import { friendshipApi } from '@/api/taskApi'
import { useTaskStore } from './taskStore'

export const useFriendStore = defineStore('friend', () => {
  const friends = ref([])
  const pendingRequests = ref([])
  const loading = ref(false)
  const taskStore = useTaskStore()

  const fetchFriendships = async () => {
    loading.value = true
    try {
      const res = await friendshipApi.getAll()
      friends.value = res.data.data.friends || []
      pendingRequests.value = res.data.data.pending || []
    } catch (err) {
      console.error(err)
      taskStore.showToast('Không thể tải danh sách bạn bè.', 'error')
    } finally {
      loading.value = false
    }
  }

  const sendFriendRequest = async (email) => {
    try {
      const res = await friendshipApi.sendRequest(email)
      taskStore.showToast(res.data.message || 'Đã gửi lời mời kết bạn.', 'success')
      await fetchFriendships()
      return true
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Không thể gửi lời mời kết bạn.'
      taskStore.showToast(msg, 'error')
      return false
    }
  }

  const acceptFriendRequest = async (id) => {
    try {
      const res = await friendshipApi.acceptRequest(id)
      taskStore.showToast(res.data.message || 'Đã chấp nhận lời mời.', 'success')
      await fetchFriendships()
      return true
    } catch (err) {
      console.error(err)
      taskStore.showToast('Chấp nhận lời mời thất bại.', 'error')
      return false
    }
  }

  const removeFriendship = async (id) => {
    try {
      const res = await friendshipApi.removeFriendship(id)
      taskStore.showToast(res.data.message || 'Đã xóa bạn bè/lời mời.', 'success')
      await fetchFriendships()
      return true
    } catch (err) {
      console.error(err)
      taskStore.showToast('Không thể thực hiện yêu cầu.', 'error')
      return false
    }
  }

  return {
    friends,
    pendingRequests,
    loading,
    fetchFriendships,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriendship
  }
})
