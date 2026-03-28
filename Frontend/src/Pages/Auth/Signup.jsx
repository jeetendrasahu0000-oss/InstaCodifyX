// src/pages/Auth/Signup.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import styles from './Auth.module.css'

const LOGO = '../../../public/codifyxPngOrignal.png'

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconAt = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
)
const IconUser = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconTag = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconLock = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = ({ show }) => show ? (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconCheck = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconShield = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

// ── Password strength ──────────────────────────────────────────────────────────
const getStrength = (pw) => {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

// ── OTP Box Component ──────────────────────────────────────────────────────────
function OtpBoxes({ onComplete, loading }) {
  const [vals, setVals] = useState(Array(6).fill(''))
  const refs = useRef([])

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...vals]; next[i] = v; setVals(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
    if (next.every(x => x)) onComplete(next.join(''))
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (!vals[i] && i > 0) {
        const next = [...vals]; next[i - 1] = ''; setVals(next)
        refs.current[i - 1]?.focus()
      } else {
        const next = [...vals]; next[i] = ''; setVals(next)
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setVals(paste.split(''))
      refs.current[5]?.focus()
      onComplete(paste)
    }
  }

  // Reset boxes when parent re-triggers (resend)
  useEffect(() => {
    if (!loading) return
    // keep values intact while loading
  }, [loading])

  return (
    <div className={styles.otpSection}>
      <div className={styles.otpHint}>
        <IconShield />
        6-digit code sent to your email
      </div>
      <div className={styles.otpBoxes}>
        {vals.map((v, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            className={`${styles.otpBox} ${v ? styles.otpBoxFilled : ''}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={v}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            disabled={loading}
            autoFocus={i === 0}
          />
        ))}
      </div>
      <button
        type="button"
        className={styles.verifyBtn}
        onClick={() => vals.every(x => x) && onComplete(vals.join(''))}
        disabled={loading || !vals.every(x => x)}
      >
        {loading ? <span className={styles.spinnerSm} /> : <><IconCheck /> Verify Email</>}
      </button>
    </div>
  )
}

// ── Main Signup Component ──────────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate()

  // Step tracking: 1 = email+OTP, 2 = details+password
  const [step, setStep] = useState(1)

  // Email OTP state
  const [email, setEmail]               = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpSent, setOtpSent]           = useState(false)
  const [otpLoading, setOtpLoading]     = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Profile fields
  const [fullname, setFullname]   = useState('')
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)

  // Shared state
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(password)

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // ── Step 1a: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.'); return
    }
    setError(''); setOtpLoading(true)
    try {
      await api.post('/auth/send-email-otp', { email })
      setOtpSent(true)
      setResendCooldown(60)
      setSuccess('OTP sent! Check your inbox.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Step 1a: Resend OTP ──────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(''); setOtpLoading(true)
    try {
      await api.post('/auth/send-email-otp', { email })
      setResendCooldown(60)
      setSuccess('New OTP sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.')
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Step 1b: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (otp) => {
    setError(''); setOtpLoading(true)
    try {
      await api.post('/auth/verify-email-otp', { email, otp })
      setEmailVerified(true)
      setOtpSent(false)
      setSuccess('Email verified! Now set up your profile.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Reset email if user changes it ──────────────────────────────────────────
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (otpSent || emailVerified) {
      setOtpSent(false)
      setEmailVerified(false)
      setSuccess('')
      setStep(1)
    }
  }

  // ── Step 2: Complete Signup ──────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (!fullname.trim()) { setError('Full name is required.'); return }
    if (!username.trim() || username.length < 3) { setError('Username must be at least 3 characters.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers, and underscores.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await api.post('/auth/signup', { fullname, username, email, password })
      setSuccess('Account created! Redirecting to sign in…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step indicator ───────────────────────────────────────────────────────────
  const StepDots = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', marginBottom: '1.4rem'
    }}>
      {[1, 2].map(n => (
        <div key={n} style={{
          width: n === step ? '22px' : '8px',
          height: '8px',
          borderRadius: '4px',
          background: n === step
            ? 'linear-gradient(135deg,#6366f1,#7c3aed)'
            : n < step
              ? 'rgba(99,102,241,0.5)'
              : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)'
        }} />
      ))}
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoWrap}>
            <img src={LOGO} alt="CodifyX" className={styles.logo} />
          </div>
          
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 1 ? 'Create Account' : 'Set Up Profile'}
          </h2>
          <p className={styles.subtitle}>
            {step === 1
              ? 'Verify your email to get started'
              : 'Almost there! Fill in your details'}
          </p>
        </div>

        {/* Step dots */}
        <StepDots />

        {/* ── STEP 1: Email + OTP ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className={styles.form}>

            {/* Email field */}
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconAt /></span>
                <input
                  className={`${styles.input} ${emailVerified ? styles.inputVerified : ''} ${
                    !emailVerified ? styles.inputWithBtn : ''
                  }`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={emailVerified}
                  autoFocus
                  autoComplete="email"
                />

                {/* Verified badge */}
                {emailVerified && (
                  <span className={styles.verifiedBadge}>
                    <IconCheck /> Verified
                  </span>
                )}

                {/* Send / Resend button */}
                {!emailVerified && (
                  <button
                    type="button"
                    className={`${styles.inlineOtpBtn} ${otpSent ? styles.inlineOtpBtnResend : ''}`}
                    onClick={otpSent ? handleResend : handleSendOtp}
                    disabled={otpLoading || (otpSent && resendCooldown > 0)}
                  >
                    {otpLoading
                      ? <span className={styles.spinnerSm} />
                      : otpSent
                        ? resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'
                        : 'Send OTP'}
                  </button>
                )}
              </div>

              {/* OTP boxes — shown after OTP sent */}
              {otpSent && !emailVerified && (
                <OtpBoxes onComplete={handleVerifyOtp} loading={otpLoading} />
              )}
            </div>

            {error   && <p className={styles.error}>⚠ {error}</p>}
            {success && !error && <p className={styles.success}>✓ {success}</p>}

            {/* Proceed button — only shown after verified */}
            {emailVerified && (
              <button
                type="button"
                className={styles.button}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Profile + Password ───────────────────────────────────── */}
        {step === 2 && (
          <form className={styles.form} onSubmit={handleSignup} noValidate>

            {/* Full Name */}
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconUser /></span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="John Doe"
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  required
                  autoFocus
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconTag /></span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="john_doe123"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                />
              </div>
              {username && !/^[a-zA-Z0-9_]+$/.test(username) && (
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#f87171' }}>
                  Only letters, numbers, and underscores allowed
                </p>
              )}
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconLock /></span>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                  <IconEye show={showPw} />
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: n <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconLock /></span>
                <input
                  className={styles.input}
                  type={showCf ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowCf(v => !v)}>
                  <IconEye show={showCf} />
                </button>
              </div>
              {confirm && password !== confirm && (
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#f87171' }}>
                  Passwords don't match
                </p>
              )}
              {confirm && password === confirm && confirm.length >= 6 && (
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#86efac' }}>
                  ✓ Passwords match
                </p>
              )}
            </div>

            {error   && <p className={styles.error}>⚠ {error}</p>}
            {success && !error && <p className={styles.success}>✓ {success}</p>}

            {/* Back + Submit */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '0.3rem' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccess('') }}
                style={{
                  height: '46px', padding: '0 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.9rem', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >
                ←
              </button>
              <button
                className={styles.button}
                type="submit"
                style={{ flex: 1 }}
              >
                {loading ? <span className={styles.spinner} /> : 'Create Account →'}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          Already have an account?
          <Link to="/login" className={styles.link}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}