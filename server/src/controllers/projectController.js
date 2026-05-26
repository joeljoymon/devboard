const Project = require('../models/Project')
const User = require('../models/User')
const Task = require('../models/Task')
const ActivityLog = require('../models/ActivityLog')

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      members: [{ user: req.user._id, role: 'manager' }]  // creator is manager
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/projects?workspaceId=xxx — only projects I am a member of
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      workspace: req.query.workspaceId,
      'members.user': req.user._id
    }).populate('members.user', 'name email avatar')

    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/projects/:projectId
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members.user', 'name email avatar')

    if (!project) return res.status(404).json({ message: 'Project not found' })

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// PUT /api/projects/:projectId
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { name: req.body.name, description: req.body.description },
      { new: true }   // return the updated document
    )
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// POST /api/projects/:projectId/invite
const inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body

    const project = await Project.findById(req.params.projectId)
    const userToInvite = await User.findOne({ email })

    if (!userToInvite) return res.status(404).json({ message: 'No user with that email' })

    const alreadyMember = project.members.find(
      m => m.user.toString() === userToInvite._id.toString()
    )
    if (alreadyMember) return res.status(400).json({ message: 'User already in project' })

    project.members.push({ user: userToInvite._id, role })
    await project.save()

    res.json({ message: `${userToInvite.name} added to project as ${role}` })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE /api/projects/:projectId
const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId)
    res.json({ message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/projects/:projectId/analytics
const getAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params
    const { sprintId } = req.query

    // Base filter — all tasks in this project
    const filter = { project: projectId }
    if (sprintId) filter.sprint = sprintId

    const tasks = await Task.find(filter)
      .populate('assignee', 'name')

    const now = new Date()

    // ── Stat cards ──────────────────────────────────────
    const total      = tasks.length
    const todo       = tasks.filter(t => t.status === 'todo').length
    const inprogress = tasks.filter(t => t.status === 'inprogress').length
    const done       = tasks.filter(t => t.status === 'done').length
    const overdue    = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length

    // ── Task distribution (pie chart) ───────────────────
    const distribution = [
      { name: 'To Do',       value: todo,       color: '#6b7280' },
      { name: 'In Progress', value: inprogress, color: '#3b82f6' },
      { name: 'Done',        value: done,       color: '#10b981' },
    ]

    // ── Member workload (bar chart) ──────────────────────
    const workloadMap = {}
    tasks.forEach(task => {
      const name = task.assignee?.name || 'Unassigned'
      workloadMap[name] = (workloadMap[name] || 0) + 1
    })
    const workload = Object.entries(workloadMap).map(([name, count]) => ({
      name, count
    }))

    // ── Burndown chart (line chart) ──────────────────────
    // Only meaningful when a sprintId is provided
    let burndown = []
    if (sprintId) {
      const Sprint = require('../models/Sprint')
      const sprint = await Sprint.findById(sprintId)

      if (sprint) {
        const start = new Date(sprint.startDate)
        const end   = new Date(sprint.endDate)
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

        // Build day-by-day remaining tasks
        // "Ideal" = linear line from total → 0
        // "Actual" = tasks not yet done as of each day
        for (let i = 0; i <= totalDays; i++) {
          const day     = new Date(start)
          day.setDate(start.getDate() + i)

          // Tasks completed ON or BEFORE this day
          const completedByDay = tasks.filter(t =>
            t.status === 'done' &&
            t.updatedAt <= day
          ).length

          burndown.push({
            day:    `Day ${i + 1}`,
            ideal:  Math.round(total - (total / totalDays) * i),
            actual: i <= Math.ceil((now - start) / (1000 * 60 * 60 * 24))
                    ? total - completedByDay   // only plot actual up to today
                    : null
          })
        }
      }
    }

    res.json({ total, todo, inprogress, done, overdue, distribution, workload, burndown })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getActivity = async (req, res) => {
    try {
      const logs = await ActivityLog.find({ project: req.params.projectId })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(20)
      res.json(logs)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

module.exports = { createProject, getProjects, getProject, updateProject, inviteMember, deleteProject, getAnalytics, getActivity}