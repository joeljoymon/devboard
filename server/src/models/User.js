const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false   // never returned in queries by default
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true  // adds createdAt and updatedAt automatically
})

// Hash password BEFORE saving to DB
// This is a Mongoose "pre-save hook" — runs automatically on User.save()
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return   // skip if password unchanged
  this.password = await bcrypt.hash(this.password, 10)
})

// Instance method — available on every User document
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)