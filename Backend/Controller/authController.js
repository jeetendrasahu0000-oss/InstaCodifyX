import User from '../Models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendEmail, sendOTPEmail } from '../Utils/sendEmail.js'  // ← named imports

// ─── Helper: Generate 6-digit OTP ─────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// ─── SEND EMAIL OTP (pre-signup) ──────────────────────────────────────────────
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }

    const emailNorm = email.toLowerCase().trim()

    // Check if already fully registered
    const existing = await User.findOne({ email: emailNorm })
    if (existing && existing.isVerified && existing.fullname && existing.password) {
      return res.status(400).json({ message: 'Email already registered. Please sign in.' })
    }

    const otp = generateOTP()
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    // Upsert — only email required, validation won't fail now
    await User.findOneAndUpdate(
      { email: emailNorm },
      { $set: { otp, otpExpire, isVerified: false } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    await sendOTPEmail(emailNorm, otp)

    return res.status(200).json({ message: 'OTP sent to your email.' })

  } catch (err) {
    console.error('sendEmailOtp error:', err)
    return res.status(500).json({
      message: 'Could not send OTP. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── VERIFY EMAIL OTP (pre-signup) ────────────────────────────────────────────
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' })
    }

    const record = await User.findOne({ email: email.toLowerCase().trim() })

    if (!record) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' })
    }

    if (record.isVerified && record.fullname && record.password) {
      return res.status(400).json({ message: 'Email already registered. Please sign in.' })
    }

    if (!record.otp || !record.otpExpire) {
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' })
    }

    if (new Date() > new Date(record.otpExpire)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    if (record.otp.toString().trim() !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' })
    }

    // ✅ OTP correct — clear it
    await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $unset: { otp: '', otpExpire: '' } },
      { new: true }
    )

    return res.status(200).json({ message: 'Email verified successfully.' })

  } catch (err) {
    console.error('verifyEmailOtp error:', err)
    return res.status(500).json({
      message: 'Something went wrong. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── SIGNUP (after email OTP verified) ───────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const emailNorm    = email.toLowerCase().trim()
    const usernameNorm = username.toLowerCase().trim()

    // Check username taken
    const usernameTaken = await User.findOne({ username: usernameNorm, isVerified: true })
    if (usernameTaken) {
      return res.status(400).json({ message: 'Username already taken. Try another.' })
    }

    const existing = await User.findOne({ email: emailNorm })

    if (!existing) {
      return res.status(400).json({ message: 'Please verify your email first.' })
    }

    if (existing.isVerified && existing.fullname && existing.password) {
      return res.status(400).json({ message: 'Email already registered. Please sign in.' })
    }

    if (existing.otp) {
      return res.status(400).json({ message: 'Please verify your email OTP first.' })
    }

    const hashed = await bcrypt.hash(password, 12)

    existing.fullname   = fullname.trim()
    existing.username   = usernameNorm
    existing.password   = hashed
    existing.isVerified = true
    await existing.save()

    return res.status(201).json({ message: 'Account created successfully! You can now sign in.' })

  } catch (err) {
    console.error('Signup error:', err)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0]
      if (field === 'username') return res.status(400).json({ message: 'Username already taken.' })
      if (field === 'email')    return res.status(400).json({ message: 'Email already registered.' })
    }
    return res.status(500).json({
      message: 'Server error. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { login: identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' })
    }

    const id = identifier.toLowerCase().trim()

    const user = await User.findOne({
      $or: [{ email: id }, { username: id }]
    })

    if (!user || !user.fullname || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first.' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      token,
      user: {
        _id:        user._id,
        fullname:   user.fullname,
        username:   user.username,
        email:      user.email,
        avatar:     user.avatar     || null,
        isVerified: user.isVerified,
        createdAt:  user.createdAt,
        solved:     user.solved     ?? 0,
        streak:     user.streak     ?? 0,
        rank:       user.rank       ?? null,
        role:       user.role       || 'user'
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      message: 'Server error. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── FORGOT PASSWORD — Send OTP ───────────────────────────────────────────────
export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isVerified: true
    })

    // Always return success (prevent email enumeration)
    if (!user || !user.fullname) {
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' })
    }

    const otp = generateOTP()

    await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { otp, otpExpire: new Date(Date.now() + 10 * 60 * 1000) } }
    )

    await sendOTPEmail(
      email,
      otp,
      `Hi ${user.fullname},<br/>Use this code to reset your CodifyX password.`
    )

    return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' })

  } catch (err) {
    console.error('forgotPasswordOtp error:', err)
    return res.status(500).json({
      message: 'Server error. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── FORGOT PASSWORD — Verify OTP ─────────────────────────────────────────────
export const forgotVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isVerified: true
    })

    if (!user) {
      return res.status(400).json({ message: 'User not found.' })
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' })
    }

    if (new Date() > new Date(user.otpExpire)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    if (user.otp.toString().trim() !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' })
    }

    const rawToken    = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        $set:   { resetToken: hashedToken, resetTokenExpire: new Date(Date.now() + 15 * 60 * 1000) },
        $unset: { otp: '', otpExpire: '' }
      }
    )

    return res.status(200).json({ message: 'OTP verified successfully.', resetToken: rawToken })

  } catch (err) {
    console.error('forgotVerifyOtp error:', err)
    return res.status(500).json({
      message: 'Server error. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params
    const { password } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required.' })
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetToken:        hashedToken,
      resetTokenExpire: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' })
    }

    user.password          = await bcrypt.hash(password, 12)
    user.resetToken        = undefined
    user.resetTokenExpire  = undefined
    await user.save()

    return res.status(200).json({ message: 'Password updated successfully! You can now sign in.' })

  } catch (err) {
    console.error('resetPassword error:', err)
    return res.status(500).json({
      message: 'Server error. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}

// ─── GET CURRENT USER (protected) ────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -otp -otpExpire -resetToken -resetTokenExpire')

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    return res.status(200).json({ user })

  } catch (err) {
    console.error('getMe error:', err)
    return res.status(500).json({
      message: 'Server error.',
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    })
  }
}