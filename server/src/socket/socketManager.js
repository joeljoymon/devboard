const { Server } = require('socket.io')

let io  // store io instance so controllers can use it later

const initSocket = (server) => {
  io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST']
  }
})

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // ─── ROOMS ───────────────────────────────────────────

    // Client joins a project room when they open a project page
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`)
      console.log(`Socket ${socket.id} joined project-${projectId}`)
    })

    // Client leaves when they navigate away
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`)
    })

    // ─── TASK EVENTS ─────────────────────────────────────

    // Someone dragged a card — broadcast to everyone else in the room
    socket.on('task-moved', ({ projectId, taskId, newStatus, newOrder }) => {
      // socket.to() sends to everyone in room EXCEPT the sender
      // (sender already updated their own board optimistically)
      socket.to(`project-${projectId}`).emit('task-moved', {
        taskId, newStatus, newOrder
      })
    })

    // Someone created a task
    socket.on('task-created', ({ projectId, task }) => {
      socket.to(`project-${projectId}`).emit('task-created', { task })
    })

    // Someone updated a task (from drawer)
    socket.on('task-updated', ({ projectId, task }) => {
      socket.to(`project-${projectId}`).emit('task-updated', { task })
    })

    // Someone deleted a task
    socket.on('task-deleted', ({ projectId, taskId }) => {
      socket.to(`project-${projectId}`).emit('task-deleted', { taskId })
    })

    // ─── ONLINE PRESENCE ─────────────────────────────────

    // Tell the room someone came online
    socket.on('user-online', ({ projectId, user }) => {
      socket.to(`project-${projectId}`).emit('user-online', { user })
    })

    // Tell the room someone went offline
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
      // Socket.io automatically removes them from all rooms on disconnect
    })
  })
}

// Export io so controllers can emit directly if needed
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialised')
  return io
}

module.exports = { initSocket, getIO }