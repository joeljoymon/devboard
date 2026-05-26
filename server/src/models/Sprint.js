const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  goal: {
    type: String,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('Sprint', sprintSchema)