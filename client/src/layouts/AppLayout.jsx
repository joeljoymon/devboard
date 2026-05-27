import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useWorkspaceStore from '../store/workspaceStore'
import useProjectStore from '../store/projectStore'
import useAuthStore from '../store/authStore'

export default function AppLayout() {
  const { user } = useAuthStore()
  const { fetchWorkspace, workspace, isLoading } = useWorkspaceStore()
  const { fetchProjects } = useProjectStore()
  const navigate = useNavigate()

  // When layout mounts, load workspace + projects
  useEffect(() => {
  if (!user) return

  const checkWorkspace = async () => {
    await fetchWorkspace()
    // Read state directly after await — always runs regardless of success/fail
    const ws = useWorkspaceStore.getState().workspace
    const loading = useWorkspaceStore.getState().isLoading

    if (!loading && !ws) {
      navigate('/create-workspace')
    }
  }

  checkWorkspace()
}, [user])

  useEffect(() => {
    if (workspace) fetchProjects(workspace._id)
  }, [workspace])

  if (isLoading) return (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-gray-500 text-sm">Loading workspace...</p>
    </div>
  </div>
)

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      {/* Main content pushed right of sidebar */}
      <main className="flex-1 ml-56 flex flex-col overflow-hidden">
        <Outlet />  {/* page content renders here */}
      </main>
    </div>
  )
}