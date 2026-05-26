import { useEffect } from 'react'
import socket from '../socket/socket'
import useTaskStore from '../store/taskStore'
import useSocketStore from '../store/socketStore'

export const useSocketEvents = (projectId) => {
  const { tasks, fetchTasks } = useTaskStore()
  const { addOnlineUser } = useSocketStore()

  useEffect(() => {
    if (!projectId) return

    // ── Incoming: someone else moved a task ──────────────
    const onTaskMoved = ({ taskId, newStatus, newOrder }) => {
      useTaskStore.setState(state => ({
        tasks: state.tasks.map(t =>
          t._id === taskId
            ? { ...t, status: newStatus, order: newOrder }
            : t
        )
      }))
    }

    // ── Incoming: someone created a task ────────────────
    const onTaskCreated = ({ task }) => {
      useTaskStore.setState(state => ({
        tasks: [...state.tasks, task]
      }))
    }

    // ── Incoming: someone updated a task ────────────────
    const onTaskUpdated = ({ task }) => {
      useTaskStore.setState(state => ({
        tasks: state.tasks.map(t => t._id === task._id ? task : t)
      }))
    }

    // ── Incoming: someone deleted a task ────────────────
    const onTaskDeleted = ({ taskId }) => {
      useTaskStore.setState(state => ({
        tasks: state.tasks.filter(t => t._id !== taskId)
      }))
    }

    // ── Incoming: someone came online ───────────────────
    const onUserOnline = ({ user }) => {
      addOnlineUser(user)
    }

    // Register all listeners
    socket.on('task-moved',   onTaskMoved)
    socket.on('task-created', onTaskCreated)
    socket.on('task-updated', onTaskUpdated)
    socket.on('task-deleted', onTaskDeleted)
    socket.on('user-online',  onUserOnline)

    // Cleanup — remove listeners when component unmounts
    // Without this, listeners stack up every time the component remounts
    return () => {
      socket.off('task-moved',   onTaskMoved)
      socket.off('task-created', onTaskCreated)
      socket.off('task-updated', onTaskUpdated)
      socket.off('task-deleted', onTaskDeleted)
      socket.off('user-online',  onUserOnline)
    }
  }, [projectId])
}