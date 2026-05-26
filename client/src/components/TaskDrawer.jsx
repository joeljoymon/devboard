import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'          // ✅ added
import useTaskStore from '../store/taskStore'
import useProjectStore from '../store/projectStore'
import useSocketStore from '../store/socketStore'      // ✅ added
import Badge from './Badge'
import Avatar from './Avatar'
import toast from 'react-hot-toast'

export default function TaskDrawer({ task, onClose }) {
  const { updateTask, deleteTask } = useTaskStore()
  const { activeProject } = useProjectStore()
  const { emitTaskUpdated, emitTaskDeleted } = useSocketStore()  // ✅ moved to top
  const { projectId } = useParams()                               // ✅ moved to top

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = `${activeProject?.name} — DevBoard`
    return () => { document.title = 'DevBoard' }
  }, [activeProject])

  useEffect(() => {
    if (task) setForm({ ...task })
  }, [task])

  // ✅ early return AFTER all hooks
  if (!task || !form) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateTask(task._id, {
        title:       form.title,
        description: form.description,
        priority:    form.priority,
        status:      form.status,
        dueDate:     form.dueDate,
        assignee:    form.assignee?._id || null,
        labels:      form.labels,
      })
      emitTaskUpdated(projectId, updated)
      toast.success('Task updated')
    } catch {
      toast.error('Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    await deleteTask(task._id)
    emitTaskDeleted(projectId, task._id)
    toast.success('Task deleted')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Badge label={form.status} />
            <Badge label={form.priority} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="text-xs text-gray-600 hover:text-rose-400 transition"
            >
              Delete
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl">
              ×
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-widest">Title</label>
            <textarea
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none resize-none border-b border-transparent focus:border-gray-700 pb-1 transition"
              rows={2}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-widest">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-500 transition resize-none"
              rows={4}
              placeholder="Add a description..."
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-widest">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition"
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-widest">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest">Assignee</label>
            <div className="flex flex-wrap gap-2">
              {activeProject?.members?.map(m => (
                <button
                  key={m.user._id}
                  onClick={() => setForm({
                    ...form,
                    assignee: form.assignee?._id === m.user._id ? null : m.user
                  })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition
                    ${form.assignee?._id === m.user._id
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}
                >
                  <Avatar name={m.user.name} size="sm" />
                  {m.user.name}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-widest">Due Date</label>
            <input
              type="date"
              value={form.dueDate ? new Date(form.dueDate).toISOString().split('T')[0] : ''}
              onChange={e => setForm({ ...form, dueDate: e.target.value || null })}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Created by */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest">Created by</label>
            <div className="flex items-center gap-2">
              <Avatar name={task.createdBy?.name} size="sm" />
              <span className="text-sm text-gray-400">{task.createdBy?.name}</span>
            </div>
          </div>
        </div>

        {/* Save footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  )
}