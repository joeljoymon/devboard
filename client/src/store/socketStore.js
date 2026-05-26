import { create } from 'zustand'
import socket from '../socket/socket'

const useSocketStore = create((set, get) => ({
  onlineUsers: [],    // users currently viewing the same project
  isConnected: false,

  // Call this when user opens a project page
  joinProject: (projectId, user) => {
    socket.emit('join-project', projectId)
    socket.emit('user-online', { projectId, user })
    set({ isConnected: true })
  },

  // Call this when user leaves a project page
  leaveProject: (projectId) => {
    socket.emit('leave-project', projectId)
    set({ onlineUsers: [], isConnected: false })
  },

  // Emit task events to server (server broadcasts to room)
  emitTaskMoved: (projectId, taskId, newStatus, newOrder) => {
    socket.emit('task-moved', { projectId, taskId, newStatus, newOrder })
  },

  emitTaskCreated: (projectId, task) => {
    socket.emit('task-created', { projectId, task })
  },

  emitTaskUpdated: (projectId, task) => {
    socket.emit('task-updated', { projectId, task })
  },

  emitTaskDeleted: (projectId, taskId) => {
    socket.emit('task-deleted', { projectId, taskId })
  },

  // Track who's online
  addOnlineUser:    (user) => set(state => ({
    onlineUsers: [...state.onlineUsers.filter(u => u._id !== user._id), user]
  })),
  removeOnlineUser: (userId) => set(state => ({
    onlineUsers: state.onlineUsers.filter(u => u._id !== userId)
  }))
}))

export default useSocketStore