// src/pages/Auth/Reset.jsx
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../../utils/api'
import styles from './Auth.module.css'

const LOGO = '../../../public/codifyxPngOrignal.png'

const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = ({ show }) => show ? (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

// Password strength checker
const getStrength = (pw) => {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

export default function Reset() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await api.post(`/auth/reset/${token}`, { password })
      setSuccess('Password updated! Redirecting to sign in...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoWrap}>
            <img src={LOGO} alt="CodifyX" className={styles.logo} />
          </div>
          
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>Set New Password</h2>
          <p className={styles.subtitle}>Choose a strong password for your account</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IconLock /></span>
              <input
                className={styles.input}
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                <IconEye show={showPw} />
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: n <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </p>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IconLock /></span>
              <input
                className={styles.input}
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                <IconEye show={showConfirm} />
              </button>
            </div>
            {confirm && password !== confirm && (
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#f87171' }}>Passwords don't match</p>
            )}
            {confirm && password === confirm && confirm.length >= 6 && (
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#86efac' }}>✓ Passwords match</p>
            )}
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}
          {success && <p className={styles.success}>✓ {success}</p>}

          <button className={styles.button} type="submit" disabled={loading || !!success}>
            {loading ? <span className={styles.spinner} /> : 'Update Password →'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}