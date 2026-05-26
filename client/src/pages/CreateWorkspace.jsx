import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useWorkspaceStore from '../store/workspaceStore'

export default function CreateWorkspace() {
  const { createWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     document.title = `${activeProject?.name} — DevBoard`
//     return () => { document.title = 'DevBoard' }
//   }, [activeProject])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createWorkspace(form.name, form.description)
      toast.success('Workspace created!')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Create your workspace</h1>
        <p className="text-gray-400 mb-8">This is your team's home in DevBoard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Workspace name</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition resize-none"
              rows={3}
              placeholder="What does your team work on?"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition"
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}