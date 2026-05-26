import { create } from 'zustand'
import axios from '../api/axios'

const useTaskStore = create((set) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (projectId, sprintId) => {
    set({ isLoading: true })
    const url = sprintId
      ? `/api/tasks?projectId=${projectId}&sprintId=${sprintId}`
      : `/api/tasks?projectId=${projectId}`
    const { data } = await axios.get(url)
    set({ tasks: data, isLoading: false })
  },

  createTask: async (payload) => {
    const { data } = await axios.post('/api/tasks', payload)
    set(state => ({ tasks: [...state.tasks, data] }))
    return data
  },

  updateTask: async (taskId, updates) => {
    const { data } = await axios.put(`/api/tasks/${taskId}`, updates)
    set(state => ({
      tasks: state.tasks.map(t => t._id === taskId ? data : t)
    }))
    return data
  },

  deleteTask: async (taskId) => {
    await axios.delete(`/api/tasks/${taskId}`)
    set(state => ({ tasks: state.tasks.filter(t => t._id !== taskId) }))
  },

  reorderTask: async (taskId, newStatus, newOrder) => {
    // Optimistic update — update UI first, then call API
    set(state => ({
      tasks: state.tasks.map(t =>
        t._id === taskId ? { ...t, status: newStatus, order: newOrder } : t
      )
    }))
    await axios.patch('/api/tasks/reorder', { taskId, newStatus, newOrder })
  }
}))

export default useTaskStore