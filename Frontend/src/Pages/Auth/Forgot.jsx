// src/pages/Auth/Forgot.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import styles from './Auth.module.css'

const LOGO = '/codifyxPngOrignal.png'

const IconAt = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
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
const IconShield = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

function MiniOTP({ onComplete, loading }) {
  const [vals, setVals] = useState(Array(6).fill(''))
  const refs = useRef([])

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g,'').slice(-1)
    const next = [...vals]; next[i] = v; setVals(next)
    if (v && i < 5) refs.current[i+1]?.focus()
    if (next.every(x => x)) onComplete(next.join(''))
  }
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (!vals[i] && i > 0) { const next=[...vals]; next[i-1]=''; setVals(next); refs.current[i-1]?.focus() }
      else { const next=[...vals]; next[i]=''; setVals(next) }
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i-1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i+1]?.focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (paste.length === 6) { setVals(paste.split('')); refs.current[5]?.focus(); onComplete(paste) }
  }

  return (
    <div className={styles.miniOtpWrap}>
      <div className={styles.miniOtpLabel}><IconShield /> Enter 6-digit code sent to your email</div>
      <div className={styles.miniOtpGrid}>
        {vals.map((v, i) => (
          <input key={i} ref={el => refs.current[i] = el}
            className={`${styles.miniOtpBox} ${v ? styles.miniOtpFilled : ''}`}
            type="text" inputMode="numeric" maxLength={1} value={v}
            onChange={e => handleChange(i, e)} onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste} disabled={loading} autoFocus={i === 0} />
        ))}
      </div>
    </div>
  )
}

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

export default function Forgot() {
  const navigate = useNavigate()
  const [email, setEmail]           = useState('')
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [otpSent, setOtpSent]       = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resetToken, setResetToken]   = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = getStrength(password)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleSendOtp = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email.'); return }
    setError(''); setOtpLoading(true)
    try {
      await api.post('/auth/forgot-otp', { email })
      setOtpSent(true); setResendCooldown(60); setSuccess('OTP sent to your email.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP.')
    } finally { setOtpLoading(false) }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(''); setOtpLoading(true)
    try {
      await api.post('/auth/forgot-otp', { email })
      setResendCooldown(60); setSuccess('New OTP sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.')
    } finally { setOtpLoading(false) }
  }

  const handleVerifyOtp = async (otp) => {
    setError(''); setOtpLoading(true)
    try {
      const res = await api.post('/auth/forgot-verify-otp', { email, otp })
      setResetToken(res.data.resetToken); setOtpVerified(true); setOtpSent(false)
      setSuccess('Identity verified! Set your new password.')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.')
    } finally { setOtpLoading(false) }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (otpSent || otpVerified) { setOtpSent(false); setOtpVerified(false); setSuccess('') }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post(`/auth/reset/${resetToken}`, { password })
      setSuccess('Password updated! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.logoArea}>
          <div className={styles.logoWrap}>
            <img src={LOGO} alt="CodifyX" className={styles.logo} />
          </div>
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>{otpVerified ? 'New Password' : 'Forgot Password?'}</h2>
          <p className={styles.subtitle}>
            {otpVerified ? 'Choose a strong new password' : 'Verify your email to reset password'}
          </p>
        </div>

        {/* Step 1 & 2: Email + OTP */}
        {!otpVerified && (
          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconAt /></span>
                <input className={styles.input} type="email" placeholder="you@example.com"
                  value={email} onChange={handleEmailChange} disabled={otpVerified}
                  style={{ paddingRight: '6.5rem' }} />
                <button type="button"
                  className={`${styles.inlineOtpBtn} ${otpSent ? styles.inlineOtpBtnResend : ''}`}
                  onClick={otpSent ? handleResend : handleSendOtp}
                  disabled={otpLoading || (otpSent && resendCooldown > 0)}>
                  {otpLoading ? <span className={styles.spinnerSm} />
                    : otpSent ? (resendCooldown > 0 ? `${resendCooldown}s` : 'Resend') : 'Send OTP'}
                </button>
              </div>
              {otpSent && !otpVerified && (
                <MiniOTP onComplete={handleVerifyOtp} loading={otpLoading} />
              )}
            </div>

            {error   && <p className={styles.error}>⚠ {error}</p>}
            {success && !error && <p className={styles.success}>✓ {success}</p>}
          </div>
        )}

        {/* Step 3: New Password */}
        {otpVerified && (
          <form className={styles.form} onSubmit={handleResetPassword} noValidate>

            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconLock /></span>
                <input className={styles.input} type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                  <IconEye show={showPw} />
                </button>
              </div>
              {password && (
                <div style={{ marginTop:'0.35rem' }}>
                  <div style={{ display:'flex', gap:'4px' }}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{
                        flex:1, height:'3px', borderRadius:'2px',
                        background: n <= strength ? strengthColor[strength] : '#e2e8f0',
                        transition:'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <p style={{ margin:'4px 0 0', fontSize:'0.72rem', color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconLock /></span>
                <input className={styles.input} type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                  <IconEye show={showConfirm} />
                </button>
              </div>
              {confirm && password !== confirm && (
                <p style={{ margin:'4px 0 0', fontSize:'0.72rem', color:'#ef4444' }}>Passwords don't match</p>
              )}
              {confirm && password === confirm && confirm.length >= 6 && (
                <p style={{ margin:'4px 0 0', fontSize:'0.72rem', color:'#16a34a' }}>✓ Passwords match</p>
              )}
            </div>

            {error   && <p className={styles.error}>⚠ {error}</p>}
            {success && !error && <p className={styles.success}>✓ {success}</p>}

            <button className={styles.button} type="submit">
              {loading ? <span className={styles.spinner} /> : 'Update Password →'}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}