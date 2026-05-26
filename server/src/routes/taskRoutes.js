const express = require('express')
const router = express.Router()
const { createTask, getTasks, updateTask, deleteTask, reorderTasks } = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/', createTask)
router.get('/', getTasks)
router.patch('/reorder', reorderTasks)   // must be before /:taskId
router.put('/:taskId', updateTask)
router.delete('/:taskId', deleteTask)

module.exports = router