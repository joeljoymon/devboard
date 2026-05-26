import { create } from 'zustand'
import axios from '../api/axios'

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Register
  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password })
      set({ user: data, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', isLoading: false })
    }
  },

  // Login
  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await axios.post('/api/auth/login', { email, password, rememberMe })
      set({ user: data, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false })
    }
  },

  // Logout
  logout: async () => {
    await axios.post('/api/auth/logout')
    set({ user: null })
  },

  // Check if already logged in (call on app load)
  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const { data } = await axios.get('/api/auth/me')
      set({ user: data, isLoading: false })
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  clearError: () => set({ error: null })
}))

export default useAuthStore