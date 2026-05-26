import { create } from 'zustand'
import axios from '../api/axios'

const useWorkspaceStore = create((set) => ({
  workspace: null,
  isLoading: false,

  fetchWorkspace: async () => {
  set({ isLoading: true })
  try {
    const { data } = await axios.get('/api/workspaces/me')
    set({ workspace: data, isLoading: false })
  } catch {
    // 404 means no workspace — not a crash, just no workspace yet
    set({ workspace: null, isLoading: false })
  }
  // ✅ always resolves — never rejects
  // AppLayout's .then() will always fire
},

  createWorkspace: async (name, description) => {
    const { data } = await axios.post('/api/workspaces', { name, description })
    set({ workspace: data })
    return data
  },

  inviteMember: async (workspaceId, email, role = 'member') => {
    const { data } = await axios.post(`/api/workspaces/${workspaceId}/invite`, { email, role })
    return data
  }
}))

export default useWorkspaceStore