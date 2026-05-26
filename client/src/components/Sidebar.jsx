import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useWorkspaceStore from '../store/workspaceStore'
import useProjectStore from '../store/projectStore'
import Avatar from './Avatar'

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { workspace, isLoading  } = useWorkspaceStore()
  const { projects } = useProjectStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Workspace name */}
      <div className="px-4 py-5 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Workspace</p>
        <p className="text-white font-semibold truncate">
        {workspace?.name || (isLoading ? 'Loading...' : 'No workspace')}
        </p>
      </div>

      {/* Projects list */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-xs text-gray-600 uppercase tracking-widest px-2 mb-2">Projects</p>
        {projects.map(project => (
          <NavLink
            key={project._id}
            to={`/projects/${project._id}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
               ${isActive
                 ? 'bg-violet-600/20 text-violet-400'
                 : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }
          >
            <span>📁</span>
            <span className="truncate">{project.name}</span>
          </NavLink>
        ))}

        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition mt-2"
        >
          <span>＋</span>
          <span>New Project</span>
        </NavLink>
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-500 hover:text-rose-400 transition px-1"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}