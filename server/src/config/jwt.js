const jwt = require('jsonwebtoken')

// Generate a token with userId baked in, expires in 7 days
const generateToken = (userId, rememberMe = false) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  )
}

const setTokenCookie = (res, token, rememberMe = false) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000   // 30 days
      :  7 * 24 * 60 * 60 * 1000   // 7 days
  })
}

module.exports = { generateToken, setTokenCookie }