import express from 'express'
import {
  sendEmailOtp,
  verifyEmailOtp,
  signup,
  login,
  logout,
  refreshAccessToken,
  forgotPasswordOtp,
  forgotVerifyOtp,
  resetPassword,
  getMe
} from '../Controller/authController.js'
import { protect } from '../Middleware/authMiddleware.js'
import { authLimiter, otpLimiter } from '../Middleware/rateLimiter.js'
import { googleLogin } from '../Controller/googleAuthController.js'

const router = express.Router()

// OTP routes (stricter rate limit)
router.post('/send-email-otp',    otpLimiter, sendEmailOtp)
router.post('/verify-email-otp',  otpLimiter, verifyEmailOtp)
router.post('/forgot-otp',        otpLimiter, forgotPasswordOtp)
router.post('/forgot-verify-otp', otpLimiter, forgotVerifyOtp)

// Auth routes
router.post('/signup',       authLimiter, signup)
router.post('/login',        authLimiter, login)
router.post('/reset/:token', resetPassword)

// Token
router.post('/refresh-token', refreshAccessToken)

// Protected
router.get('/me',      protect, getMe)
router.post('/logout', protect, logout)
router.post('/google-login', googleLogin)

export default router