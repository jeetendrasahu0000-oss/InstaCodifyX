// Controller/googleAuthController.js
import { OAuth2Client } from 'google-auth-library'
import User from '../Models/User.js'
import jwt from 'jsonwebtoken'

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI   // set this to "postmessage" in .env for Firebase popup
)

/**
 * POST /api/auth/google-login
 * Body: { email, name, serverAuthCode? }
 *
 * serverAuthCode = one-time code from Firebase signInWithPopup (offline access).
 * We exchange it here for googleRefreshToken (needed for auto Google Meet).
 */
export const googleLogin = async (req, res) => {
  try {
    const { email, name, serverAuthCode } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    // Exchange serverAuthCode for refresh token
    let googleRefreshToken = null
    if (serverAuthCode) {
      try {
        const { tokens } = await oAuth2Client.getToken(serverAuthCode)
        googleRefreshToken = tokens.refresh_token ?? null
      } catch (exchangeErr) {
        console.warn('Could not exchange serverAuthCode:', exchangeErr.message)
      }
    }

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      const baseUsername = name
        ? name.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 25)
        : email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')

      let username = baseUsername
      let suffix = 1
      while (await User.findOne({ username })) {
        username = `${baseUsername}${suffix++}`
      }

      user = new User({
        fullname: name || null,
        username,
        email,
        isVerified: true,
        googleRefreshToken,
      })
    } else {
      if (name && !user.fullname) user.fullname = name
      user.isVerified = true
      if (googleRefreshToken) user.googleRefreshToken = googleRefreshToken
    }

    // JWT tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

    user.token = refreshToken
    user.tokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await user.save()

    return res.status(200).json({
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Google login error:', err)
    return res.status(500).json({ message: 'Google login failed', debug: err.message })
  }
}