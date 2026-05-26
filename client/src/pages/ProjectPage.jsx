import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useProjectStore from '../store/projectStore'
import useTaskStore from '../store/taskStore'
import useAuthStore from '../store/authStore'
import useSocketStore from '../store/socketStore'
import { useSocketEvents } from '../hooks/useSocketEvents'
import TopBar from '../components/TopBar'
import Modal from '../components/Modal'
import Avatar from '../components/Avatar'
import AnalyticsPage from './AnalyticsPage'

// ✅ CHANGE 1 — New imports added here
import KanbanBoard from '../components/KanbanBoard'
import TaskDrawer from '../components/TaskDrawer'

export default function ProjectPage() {
  const { joinProject, leaveProject, emitTaskCreated, onlineUsers } = useSocketStore()
  const { projectId } = useParams()
  const { user } = useAuthStore()
  const {
    activeProject, fetchProject,
    sprints, activeSprint, fetchSprints, setActiveSprint, createSprint
  } = useProjectStore()
  const { fetchTasks, createTask } = useTaskStore()
  const [activeTab, setActiveTab] = useState('board')

  const [showTaskModal, setShowTaskModal]   = useState(false)
  const [showSprintModal, setShowSprintModal] = useState(false)
  const [taskForm, setTaskForm]     = useState({ title: '', priority: 'medium', description: '' })
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '', goal: '' })

  // ✅ CHANGE 2 — Drawer state added alongside other useState calls
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    document.title = `${activeProject?.name} — DevBoard`
    return () => { document.title = 'DevBoard' }
  }, [activeProject])

  useEffect(() => {
    fetchProject(projectId)
    fetchSprints(projectId)
  }, [projectId])

  useEffect(() => {
    if (activeSprint) fetchTasks(projectId, activeSprint._id)
  }, [activeSprint, projectId])

  // Join socket room when project loads, leave when navigating away
  useEffect(() => {
    if (projectId && user) {
      joinProject(projectId, user)
      return () => leaveProject(projectId)  // cleanup on unmount
    }
  }, [projectId, user])

  // Register all incoming socket event listeners
  useSocketEvents(projectId)

  const myMembership = activeProject?.members?.find(
    m => m.user._id === user?._id
  )
  const isManager = myMembership?.role === 'manager'

  const handleCreateTask = async (e) => {
  e.preventDefault()
  try {
    const task = await createTask({
      ...taskForm,
      projectId,
      sprintId: activeSprint?._id
    })
    toast.success('Task created!')
    emitTaskCreated(projectId, task)  // ← tell teammates
    setShowTaskModal(false)
    setTaskForm({ title: '', priority: 'medium', description: '' })
  } catch {
    toast.error('Failed to create task')
  }
}

  const handleCreateSprint = async (e) => {
    e.preventDefault()
    try {
      const sprint = await createSprint({ ...sprintForm, projectId })
      toast.success('Sprint created!')
      setShowSprintModal(false)
      setActiveSprint(sprint)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sprint')
    }
  }

  // ✅ columns and columnLabels variables REMOVED — KanbanBoard handles this internally

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={activeProject?.name || 'Project'}
        subtitle={`${activeProject?.members?.length || 0} members`}
        actions={
          <div className="flex items-center gap-2">
              {/* ✅ ADD THIS — online users indicator */}
            {onlineUsers.length > 0 && (
                <div className="flex items-center gap-1 mr-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">{onlineUsers.length} online</span>
                </div>
            )}
            <div className="flex -space-x-2">
              {activeProject?.members?.slice(0, 4).map(m => (
                <Avatar key={m.user._id} name={m.user.name} size="sm" />
              ))}
            </div>
            {isManager && (
              <button onClick={() => setShowSprintModal(true)}
                className="text-sm border border-gray-700 hover:border-violet-500 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition">
                + Sprint
              </button>
            )}
            <button onClick={() => setShowTaskModal(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-1.5 rounded-lg transition">
              + Task
            </button>
          </div>
        }
      />
      {/* Tab switcher */}
    <div className="px-6 pt-3 flex items-center gap-1 border-b border-gray-800">
    {[
        { id: 'board',     label: '📋 Board'     },
        { id: 'analytics', label: '📊 Analytics' },
    ].map(tab => (
        <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-2 text-sm rounded-t-lg transition border-b-2
            ${activeTab === tab.id
            ? 'border-violet-500 text-violet-400'
            : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
        {tab.label}
     </button>
    ))}
    </div>

      {/* Sprint selector */}
      {sprints.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-500 mr-2 flex-shrink-0">Sprint:</span>
          {sprints.map(sprint => (
            <button
              key={sprint._id}
              onClick={() => setActiveSprint(sprint)}
              className={`text-xs px-3 py-1.5 rounded-full flex-shrink-0 transition border
                ${activeSprint?._id === sprint._id
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
              {sprint.name}
              <span className={`ml-1.5 ${sprint.status === 'active' ? 'text-green-400' : 'opacity-50'}`}>
                ●
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Board area */}
    <div className="flex-1 overflow-auto p-6">
    {activeTab === 'analytics' ? (
        <AnalyticsPage />
    ) : sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
        <p className="text-5xl mb-4">🏃</p>
        <h2 className="text-xl font-semibold text-white mb-2">No sprints yet</h2>
        <p className="text-gray-500 mb-6">Create a sprint to start organising tasks</p>
        {isManager && (
            <button onClick={() => setShowSprintModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg transition">
            Create Sprint
            </button>
        )}
        </div>
    ) : (
        <KanbanBoard onTaskClick={(task) => setSelectedTask(task)} />
    )}
    </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input type="text" required
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
              placeholder="Build the login page"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Priority</label>
            <select
              value={taskForm.priority}
              onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition resize-none"
              rows={3}
              placeholder="Optional details..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2.5 transition text-sm">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 transition text-sm">
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Sprint Modal */}
      <Modal isOpen={showSprintModal} onClose={() => setShowSprintModal(false)} title="Create Sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sprint name</label>
            <input type="text" required
              value={sprintForm.name}
              onChange={e => setSprintForm({ ...sprintForm, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
              placeholder="Sprint 1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start date</label>
              <input type="date" required
                value={sprintForm.startDate}
                onChange={e => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End date</label>
              <input type="date" required
                value={sprintForm.endDate}
                onChange={e => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sprint goal</label>
            <input type="text"
              value={sprintForm.goal}
              onChange={e => setSprintForm({ ...sprintForm, goal: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
              placeholder="What will the team achieve?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowSprintModal(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2.5 transition text-sm">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 transition text-sm">
              Create Sprint
            </button>
          </div>
        </form>
      </Modal>

      {/* ✅ CHANGE 4 — TaskDrawer placed just before the final closing div */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {colTasks.length === 0 && !snapshot.isDraggingOver && (
     <div className="flex-1 flex items-center justify-center py-8">
        <p className="text-xs text-gray-700">Drop tasks here</p>
     </div>
      )}
    </div>
  )
}