const User = require('../models/User')
const { generateToken, setTokenCookie } = require('../config/jwt')


// POST /api/auth/register
const register = async (req, res) => {
  try {
    /* console.log('req.body:', req.body) */ 
    const { name, email, password } = req.body
    /*console.log('name:', name, 'email:', email, 'password:', password)  // add this*/

    // Check if user already exists
    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create user — password is hashed automatically by the pre-save hook
    const user = await User.create({ name, email, password })

    // Generate JWT and set it in cookie
    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email
    })
  } catch (error) {
    /*console.log('FULL ERROR:', error)  // change this from error.message to error*/
    res.status(500).json({ message: error.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body

    // +password needed because select:false hides it by default
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id, rememberMe)
    setTokenCookie(res, token, rememberMe)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'        // ✅ must match how it was set
  })
  res.json({ message: 'Logged out successfully' })
}

// GET /api/auth/me
const getMe = async (req, res) => {
  // req.user is set by authMiddleware
  const user = await User.findById(req.user.id)
  res.json(user)
}

module.exports = { register, login, logout, getMe }