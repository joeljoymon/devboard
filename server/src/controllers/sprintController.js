const Sprint = require('../models/Sprint')

// POST /api/sprints
const createSprint = async (req, res) => {
  try {
    const { name, projectId, startDate, endDate, goal } = req.body

    // Only one sprint can be active at a time per project
    const activeSprint = await Sprint.findOne({ project: projectId, status: 'active' })
    if (activeSprint) {
      return res.status(400).json({ message: 'A sprint is already active. Complete it first.' })
    }

    const sprint = await Sprint.create({
      name, project: projectId, startDate, endDate, goal
    })

    res.status(201).json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/sprints?projectId=xxx
const getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find({ project: req.query.projectId })
      .sort({ createdAt: -1 })
    res.json(sprints)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// PATCH /api/sprints/:sprintId/activate
const activateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.sprintId,
      { status: 'active' },
      { new: true }
    )
    res.json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// PATCH /api/sprints/:sprintId/complete
const completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.sprintId,
      { status: 'completed' },
      { new: true }
    )
    res.json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createSprint, getSprints, activateSprint, completeSprint }