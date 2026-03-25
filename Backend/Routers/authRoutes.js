import express from 'express'
import {
  sendEmailOtp,
  verifyEmailOtp,
  signup,
  login,
  forgotPasswordOtp,
  forgotVerifyOtp,
  resetPassword,
  getMe
} from '../Controller/authController.js'
import { protect } from '../Middleware/authMiddleware.js'
import { authLimiter, otpLimiter } from '../Middleware/rateLimiter.js'

const router = express.Router()

// OTP routes (stricter rate limit)
router.post('/send-email-otp',    otpLimiter, sendEmailOtp)
router.post('/verify-email-otp',  otpLimiter, verifyEmailOtp)
router.post('/forgot-otp',        otpLimiter, forgotPasswordOtp)
router.post('/forgot-verify-otp', otpLimiter, forgotVerifyOtp)

// Auth routes
router.post('/signup', authLimiter, signup)
router.post('/login',  authLimiter, login)
router.post('/reset/:token', resetPassword)

// Protected
router.get('/me', protect, getMe)

export default router