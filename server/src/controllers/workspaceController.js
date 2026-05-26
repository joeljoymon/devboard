const Workspace = require('../models/Workspace')
const User = require('../models/User')

// POST /api/workspaces — create workspace, creator becomes owner
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]  // owner is also admin
    })

    res.status(201).json(workspace)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/workspaces/me — get only MY workspace
const getMyWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      'members.user': req.user._id   // I am in the members array
    }).populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')

    if (!workspace) return res.status(404).json({ message: 'No workspace found' })

    res.json(workspace)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// POST /api/workspaces/:workspaceId/invite
const inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body

    const workspace = await Workspace.findById(req.params.workspaceId)
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' })

    // Find user by email
    const userToInvite = await User.findOne({ email })
    if (!userToInvite) return res.status(404).json({ message: 'No user with that email' })

    // Check if already a member
    const alreadyMember = workspace.members.find(
      m => m.user.toString() === userToInvite._id.toString()
    )
    if (alreadyMember) return res.status(400).json({ message: 'User already in workspace' })

    workspace.members.push({ user: userToInvite._id, role })
    await workspace.save()

    res.json({ message: `${userToInvite.name} added to workspace` })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE /api/workspaces/:workspaceId/members/:userId
const removeMember = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)

    // Can't remove the owner
    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' })
    }

    workspace.members = workspace.members.filter(
      m => m.user.toString() !== req.params.userId
    )
    await workspace.save()

    res.json({ message: 'Member removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createWorkspace, getMyWorkspace, inviteMember, removeMember }