// src/pages/Auth/Login.jsx
import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext'
import api from '../../utils/api'
import styles from './Auth.module.css'
import { auth, provider } from '../../utils/firebase'
import { signInWithPopup } from 'firebase/auth'

const LOGO = '/codifyxPngOrignal.png'

const IconAt = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4"/>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = ({ show }) => show ? (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { login: form.email, password: form.password })
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      provider.addScope('https://www.googleapis.com/auth/calendar.events')
      provider.setCustomParameters({ access_type: 'offline', prompt: 'consent' })
      const result = await signInWithPopup(auth, provider)
      const user   = result.user
      const serverAuthCode = result._tokenResponse?.serverAuthCode ?? null
      const res = await api.post('/auth/google-login', {
        email: user.email, name: user.displayName, serverAuthCode,
      })
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.')
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

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to continue coding</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label className={styles.label}>Email or Username</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IconAt /></span>
              <input
                className={styles.input}
                type="text"
                placeholder="you@example.com or username"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IconLock /></span>
              <input
                className={styles.input}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                <IconEye show={showPw} />
              </button>
            </div>
          </div>

          <div className={styles.forgotRow}>
            <Link to="/forgot" className={styles.forgotLink}>Forgot password?</Link>
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider} style={{ margin: '0.9rem 0 0' }}>or</div>

        {/* Google */}
        <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        {/* Footer */}
        <div className={styles.footer}>
          Don't have an account? <Link to="/signup" className={styles.link}>Create one</Link>
        </div>

      </div>
    </div>
  )
}