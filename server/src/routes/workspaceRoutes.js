const express = require('express')
const router = express.Router()
const { createWorkspace, getMyWorkspace, inviteMember, removeMember } = require('../controllers/workspaceController')
const { protect } = require('../middleware/authMiddleware')
const { checkWorkspaceRole } = require('../middleware/roleMiddleware')

router.use(protect)  // all workspace routes require login

router.post('/', createWorkspace)
router.get('/me', getMyWorkspace)
router.post('/:workspaceId/invite', checkWorkspaceRole('admin'), inviteMember)
router.delete('/:workspaceId/members/:userId', checkWorkspaceRole('admin'), removeMember)

module.exports = router