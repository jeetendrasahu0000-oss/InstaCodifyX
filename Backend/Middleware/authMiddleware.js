import jwt from 'jsonwebtoken'
import User from '../Models/User.js'

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please sign in.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please sign in again.' })
      }
      return res.status(401).json({ message: 'Invalid token. Please sign in.' })
    }

    const user = await User.findById(decoded.id).select('-password -otp -otpExpire -resetToken -resetTokenExpire')

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' })
    }

    req.user = user
    next()

  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}