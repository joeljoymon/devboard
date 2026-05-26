const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: 'Not authorised, no token' })
    }

    // Verify the token — throws error if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request (without password)
    req.user = await User.findById(decoded.id).select('-password')

    next()  // pass control to the next function (the controller)
  } catch (error) {
    res.status(401).json({ message: 'Not authorised, token failed' })
  }
}

module.exports = { protect }