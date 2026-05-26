const Task = require('../models/Task')
const logActivity = require('../utils/logActivity')

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, sprintId, assignee, priority, dueDate, labels } = req.body

    // Set order to last position in that status column
    const lastTask = await Task.findOne({
      project: projectId,
      status: 'todo'
    }).sort({ order: -1 })

    const task = await Task.create({
      title, description,
      project: projectId,
      sprint: sprintId || null,
      assignee: assignee || null,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      labels: labels || [],
      createdBy: req.user._id,
      order: lastTask ? lastTask.order + 1 : 0
    })

    await logActivity(projectId, req.user._id, 'created', task.title)

    const populated = await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ])

    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/tasks?projectId=xxx&sprintId=xxx
const getTasks = async (req, res) => {
  try {
    const filter = { project: req.query.projectId }
    if (req.query.sprintId) filter.sprint = req.query.sprintId
    if (req.query.sprintId === 'backlog') filter.sprint = null

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// PUT /api/tasks/:taskId
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true }
    ).populate('assignee', 'name email avatar')

    await logActivity(req.body.project, req.user._id, 'updated', task.title)

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE /api/tasks/:taskId
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
    await logActivity(task.project, req.user._id, 'deleted', task.title)
    await Task.findByIdAndDelete(req.params.taskId)
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// PATCH /api/tasks/reorder — drag and drop updates order + status
const reorderTasks = async (req, res) => {
  try {
    const { taskId, newStatus, newOrder } = req.body

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: newStatus, order: newOrder },
      { new: true }
    )

    await logActivity(
       task.project, req.user._id,
      `moved to ${newStatus}`, task.title
    )

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask, reorderTasks }