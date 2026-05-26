const ActivityLog = require('../models/ActivityLog')

const logActivity = async (projectId, userId, action, target) => {
  try {
    await ActivityLog.create({ project: projectId, user: userId, action, target })
  } catch (err) {
    // Never let logging crash the main operation
    console.error('Activity log failed:', err.message)
  }
}

module.exports = logActivity