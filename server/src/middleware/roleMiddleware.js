const Project = require('../models/Project')
const Workspace = require('../models/Workspace')

// Check user's role inside a specific Project
// Usage: checkProjectRole('manager') or checkProjectRole('manager', 'member')
const checkProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId || req.body.projectId)
      if (!project) return res.status(404).json({ message: 'Project not found' })

      const member = project.members.find(
        m => m.user.toString() === req.user._id.toString()
      )

      if (!member) {
        return res.status(403).json({ message: 'You are not a member of this project' })
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: 'You do not have permission for this action' })
      }

      req.projectRole = member.role  // attach role for use in controllers
      next()
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

// Check user's role inside a Workspace
const checkWorkspaceRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const workspace = await Workspace.findById(req.params.workspaceId || req.body.workspaceId)
      if (!workspace) return res.status(404).json({ message: 'Workspace not found' })

      // Owner always passes
      if (workspace.owner.toString() === req.user._id.toString()) return next()

      const member = workspace.members.find(
        m => m.user.toString() === req.user._id.toString()
      )

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: 'Insufficient workspace permissions' })
      }

      next()
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = { checkProjectRole, checkWorkspaceRole }