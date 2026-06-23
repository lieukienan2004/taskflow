import { io } from 'socket.io-client'
import { getHost } from './serverConfig'

let socket = null
const prodApiUrl = import.meta.env.VITE_API_URL || ''

export const getSocket = () => socket

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  const baseURL = prodApiUrl || getHost() || 'http://localhost:3001'

  socket = io(baseURL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinProjectRoom = (projectId) => {
  if (socket?.connected) {
    socket.emit('join-project', projectId)
  }
}

export const leaveProjectRoom = (projectId) => {
  if (socket?.connected) {
    socket.emit('leave-project', projectId)
  }
}

export const sendProjectMessage = (projectId, message) => {
  if (socket?.connected) {
    socket.emit('project-message', { projectId, message })
  }
}

export const emitTaskUpdated = (taskId, projectId) => {
  if (socket?.connected) {
    socket.emit('task-updated', { taskId, projectId })
  }
}

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinProjectRoom,
  leaveProjectRoom,
  sendProjectMessage,
  emitTaskUpdated,
}
