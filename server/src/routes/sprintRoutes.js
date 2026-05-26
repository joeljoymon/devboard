const express = require('express')
const router = express.Router()
const { createSprint, getSprints, activateSprint, completeSprint } = require('../controllers/sprintController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/', createSprint)
router.get('/', getSprints)
router.patch('/:sprintId/activate', activateSprint)
router.patch('/:sprintId/complete', completeSprint)

module.exports = router