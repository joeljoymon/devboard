const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  action:  { type: String, required: true },  // "created", "moved", "assigned", "deleted"
  target:  { type: String, required: true },  // task title or name
}, { timestamps: true })

module.exports = mongoose.model('ActivityLog', activityLogSchema)