import React, { useState } from 'react'
import api from '../../../utils/api'
import Footer from '../../Footer/Footer'
import Header from '../../Header/Header'
import styles from './ScheduleInterview.module.css'
import { auth, provider } from '../../../utils/firebase.js'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

import { FiUser, FiMail, FiCalendar, FiClock, FiVideo, FiLink, FiCheckCircle, FiAlertCircle, FiLoader, FiArrowRight } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { MdOutlineSchedule } from 'react-icons/md'
import { BsCalendar2Check, BsShieldCheck } from 'react-icons/bs'
import { HiOutlineLightningBolt } from 'react-icons/hi'

const ScheduleInterview = () => {
  const [form, setForm] = useState({ name: '', email: '', date: '', time: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [accessToken, setAccessToken] = useState(null)
  const [googleConnected, setGoogleConnected] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setResult(null)
  }

  const handleGoogleLogin = async () => {
    try {
      provider.addScope('https://www.googleapis.com/auth/calendar')
      provider.setCustomParameters({ prompt: 'consent' })
      const res = await signInWithPopup(auth, provider)
      const credential = GoogleAuthProvider.credentialFromResult(res)
      const token = credential.accessToken
      if (!token) { setError("Google permission not granted"); return }
      setAccessToken(token)
      setGoogleConnected(true)
    } catch (err) {
      console.error(err)
      setError("Google login failed")
    }
  }

  const submit = async () => {
    if (!form.name || !form.email || !form.date || !form.time) {
      setError("All fields are required")
      return
    }
    if (!accessToken) {
      setError("Please connect Google Calendar first")
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/hr/schedule', { ...form, accessToken })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule interview")
    } finally {
      setLoading(false)
    }
  }

  const step = result ? 3 : googleConnected ? 2 : 1

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Left Panel */}
          <div className={styles.leftPanel}>
            <div className={styles.panelBadge}>
              <BsCalendar2Check /> Live Interview
            </div>
            <h2 className={styles.panelTitle}>Schedule Your Interview</h2>
            <p className={styles.panelSub}>
              Connect with real HR professionals via Google Meet. Get personal feedback and expert guidance.
            </p>

            <div className={styles.steps}>
              {[
                { num: 1, label: 'Connect Google Calendar', icon: <FcGoogle /> },
                { num: 2, label: 'Fill Interview Details', icon: <FiUser /> },
                { num: 3, label: 'Get Meet Link', icon: <FiVideo /> },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`${styles.stepItem} ${step > s.num ? styles.stepDone : step === s.num ? styles.stepActive : ''}`}
                >
                  <div className={styles.stepCircle}>
                    {step > s.num ? <FiCheckCircle /> : s.num}
                  </div>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.trustRow}>
              <span className={styles.trustTag}><BsShieldCheck /> Secure</span>
              <span className={styles.trustTag}><HiOutlineLightningBolt /> Instant Link</span>
              <span className={styles.trustTag}><FiCalendar /> Auto Sync</span>
            </div>
          </div>

          {/* Right Form */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <MdOutlineSchedule className={styles.formHeaderIcon} />
              <div>
                <h3>New Interview Slot</h3>
                <p>Fill in candidate details below</p>
              </div>
            </div>

            <button
              className={`${styles.googleBtn} ${googleConnected ? styles.googleConnected : ''}`}
              onClick={handleGoogleLogin}
              disabled={googleConnected}
            >
              {googleConnected
                ? <><FiCheckCircle className={styles.gIcon} /> Google Calendar Connected</>
                : <><FcGoogle className={styles.gIcon} /> Connect Google Calendar</>
              }
            </button>

            <div className={styles.divider}><span>Interview Details</span></div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}><FiUser /> Candidate Name</label>
                <input className={styles.input} type="text" name="name" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}><FiMail /> Email Address</label>
                <input className={styles.input} type="email" name="email" placeholder="rahul@example.com" value={form.email} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}><FiCalendar /> Interview Date</label>
                <input className={styles.input} type="date" name="date" value={form.date} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}><FiClock /> Interview Time</label>
                <input className={styles.input} type="time" name="time" value={form.time} onChange={handleChange} />
              </div>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <FiAlertCircle /><span>{error}</span>
              </div>
            )}

            {result?.meetingLink && (
              <div className={styles.successBox}>
                <div className={styles.successTitle}><FiCheckCircle /> Interview Scheduled Successfully!</div>
                <a href={result.meetingLink} target="_blank" rel="noreferrer" className={styles.meetLink}>
                  <FiVideo /><span>Join Google Meet</span><FiLink />
                </a>
              </div>
            )}

            <button className={styles.submitBtn} onClick={submit} disabled={loading}>
              {loading
                ? <><FiLoader className={styles.spinIcon} /> Scheduling...</>
                : <>Schedule Interview <FiArrowRight /></>
              }
            </button>

            <p className={styles.secureNote}><BsShieldCheck /> Invite will be sent to candidate's email automatically</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ScheduleInterview