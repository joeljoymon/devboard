import { create } from 'zustand'
import axios from '../api/axios'

const useProjectStore = create((set, get) => ({
  projects: [],
  activeProject: null,
  sprints: [],
  activeSprint: null,
  isLoading: false,

  fetchProjects: async (workspaceId) => {
    set({ isLoading: true })
    const { data } = await axios.get(`/api/projects?workspaceId=${workspaceId}`)
    set({ projects: data, isLoading: false })
  },

  fetchProject: async (projectId) => {
    const { data } = await axios.get(`/api/projects/${projectId}`)
    set({ activeProject: data })
  },

  fetchAnalytics: async (projectId, sprintId) => {
    const url = sprintId
        ? `/api/projects/${projectId}/analytics?sprintId=${sprintId}`
        : `/api/projects/${projectId}/analytics`
    const { data } = await axios.get(url)
    return data   // caller handles the data directly
  },

  createProject: async (name, description, workspaceId) => {
    const { data } = await axios.post('/api/projects', { name, description, workspaceId })
    set(state => ({ projects: [...state.projects, data] }))
    return data
  },

  inviteMember: async (projectId, email, role) => {
    const { data } = await axios.post(`/api/projects/${projectId}/invite`, { email, role })
    return data
  },

  fetchSprints: async (projectId) => {
    const { data } = await axios.get(`/api/sprints?projectId=${projectId}`)
    set({ sprints: data })
    // auto-select the active sprint, or first sprint
    const active = data.find(s => s.status === 'active') || data[0] || null
    set({ activeSprint: active })
  },

  createSprint: async (payload) => {
    const { data } = await axios.post('/api/sprints', payload)
    set(state => ({ sprints: [data, ...state.sprints] }))
    return data
  },

  setActiveSprint: (sprint) => set({ activeSprint: sprint })
}))

export default useProjectStore