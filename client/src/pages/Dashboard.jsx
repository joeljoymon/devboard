import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useWorkspaceStore from '../store/workspaceStore'
import useProjectStore from '../store/projectStore'
import TopBar from '../components/TopBar'
import Modal from '../components/Modal'

export default function Dashboard() {

  const { projects, createProject, isLoading } = useProjectStore()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  // Temporary invite tester — remove after Phase 9 polish
  const [inviteEmail, setInviteEmail] = useState('')
  const { workspace, inviteMember } = useWorkspaceStore()

  // useEffect(() => {
  //   document.title = `${activeProject?.name} — DevBoard`
  //   return () => { document.title = 'DevBoard' }
  // }, [activeProject])

  const handleInvite = async (e) => {
    e.preventDefault()
    try {
      await inviteMember(workspace._id, inviteEmail, 'member')
      toast.success(`${inviteEmail} invited to workspace!`)
      setInviteEmail('')
    } catch {
      toast.error('Invite failed — make sure they have an account')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const project = await createProject(form.name, form.description, workspace._id)
      toast.success('Project created!')
      setShowModal(false)
      setForm({ name: '', description: '' })
      navigate(`/projects/${project._id}`)
    } catch {
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={workspace?.name || 'Dashboard'}
        subtitle="All projects"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + New Project
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center mt-24 text-center">
            <p className="text-5xl mb-4">📁</p>
            <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6">Create your first project to start tracking work</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg transition"
            >
              Create Project
            </button>
          </div>
        ) : (
          /* Project cards grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 cursor-pointer hover:border-violet-500 hover:bg-gray-800 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">📁</span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400 transition">
                    {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{project.description || 'No description'}</p>
              </div>
            ))}

            {/* Create new card */}
            <div
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-gray-700 rounded-xl p-5 cursor-pointer hover:border-violet-500 hover:bg-gray-800/30 transition flex flex-col items-center justify-center min-h-32 text-gray-600 hover:text-violet-400"
            >
              <span className="text-3xl mb-2">＋</span>
              <span className="text-sm">New Project</span>
            </div>
          </div>
        )}
        {/* ✅ ADD HERE — after the ternary closes, still inside the scrollable div */}
        <div className="mt-8 max-w-sm">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Invite to workspace</p>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email" required
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="teammate@test.com"
              className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition"
            />
            <button type="submit"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition">
              Invite
            </button>
          </form>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Project name</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
              placeholder="Mobile App"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition resize-none"
              rows={3}
              placeholder="What is this project about?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2.5 transition text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg py-2.5 transition text-sm">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}