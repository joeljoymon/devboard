import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useWorkspaceStore from '../store/workspaceStore'
import useProjectStore from '../store/projectStore'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function AppLayout() {
  const { user } = useAuthStore()
  const { fetchWorkspace, workspace } = useWorkspaceStore()
  const { fetchProjects } = useProjectStore()

  // When layout mounts, load workspace + projects
  useEffect(() => {
  if (user) {
    fetchWorkspace().then(() => {
      if (!useWorkspaceStore.getState().workspace) {
        navigate('/create-workspace')
      }
    })
  }
}, [user])

  useEffect(() => {
    if (workspace) fetchProjects(workspace._id)
  }, [workspace])

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