const express = require('express')
const router = express.Router()
const { createProject, getProjects, getProject, updateProject, inviteMember, deleteProject, getAnalytics, getActivity } = require('../controllers/projectController')
const { protect } = require('../middleware/authMiddleware')
const { checkProjectRole } = require('../middleware/roleMiddleware')

router.use(protect)

router.post('/', createProject)
router.get('/', getProjects)
router.get('/:projectId', checkProjectRole('manager', 'member', 'viewer'), getProject)
router.put('/:projectId', checkProjectRole('manager'), updateProject)
router.post('/:projectId/invite', checkProjectRole('manager'), inviteMember)
router.delete('/:projectId', checkProjectRole('manager'), deleteProject)
router.get('/:projectId/analytics', checkProjectRole('manager', 'member', 'viewer'), getAnalytics)
router.get('/:projectId/activity', checkProjectRole('manager', 'member', 'viewer'), getActivity)

module.exports = router