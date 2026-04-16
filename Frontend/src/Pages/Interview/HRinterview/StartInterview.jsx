import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { AuthContext } from '../../../Context/AuthContext'
import styles from './StartInterview.module.css'
import Footer from '../../Footer/Footer'
import Header from '../../Header/Header'
import {
  FiBriefcase, FiChevronLeft, FiChevronRight, FiX,
  FiCheckCircle, FiClock, FiMessageSquare, FiRefreshCw,
  FiSend, FiArrowLeft, FiUser, FiAward, FiLoader,
  FiAlertCircle, FiEye
} from 'react-icons/fi'

const UserAPI = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 15000 })
UserAPI.interceptors.request.use(req => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher', sub: 'Just starting out', icon: '🌱' },
  { value: '0-6', label: '0–6 Months', sub: 'Early career', icon: '📘' },
  { value: '6-12', label: '6–12 Months', sub: 'Building momentum', icon: '📗' },
  { value: '1-2', label: '1–2 Years', sub: 'Growing professional', icon: '📙' },
  { value: '2+', label: '2+ Years', sub: 'Experienced candidate', icon: '🏆' },
]

const EXP_LABEL = Object.fromEntries(EXPERIENCE_OPTIONS.map(o => [o.value, o.label]))

const DIFF_CONFIG = {
  easy: { label: 'Easy', color: '#15803d', bg: '#f0fdf4', dot: '#22c55e' },
  medium: { label: 'Medium', color: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
  hard: { label: 'Hard', color: '#b91c1c', bg: '#fef2f2', dot: '#ef4444' },
}

const STEPS = { SELECT: 'select', INTERVIEW: 'interview', DONE: 'done', FEEDBACK: 'feedback' }

/* ────────────────────────────────────────────
   My Feedback Screen
──────────────────────────────────────────── */
const MyFeedbackScreen = ({ onBack, onPracticeAgain }) => {
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    UserAPI.get('/hr/my-answers')
      .then(res => setAnswers(res.data.answers))
      .catch(() => setError('Failed to load your submissions.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <div className={styles.fbPage}>
        <div className={styles.fbInner}>

          <div className={styles.fbTopBar}>
            <button className={styles.backLink} onClick={onBack}>
              <FiArrowLeft size={15} /> Back
            </button>
            <button className={styles.practiceAgainBtn} onClick={onPracticeAgain}>
              <FiRefreshCw size={13} /> Practice Again
            </button>
          </div>

          <div className={styles.fbPageHeading}>
            <FiMessageSquare size={20} className={styles.fbHeadIcon} />
            <div>
              <h2>My Feedback</h2>
              <p>Your answers and HR evaluations</p>
            </div>
          </div>

          {loading ? (
            <div className={styles.centerState}>
              <FiLoader size={24} className={styles.spinIcon} />
              <span>Loading your submissions…</span>
            </div>
          ) : error ? (
            <div className={styles.centerState}>
              <FiAlertCircle size={24} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          ) : answers.length === 0 ? (
            <div className={styles.centerState}>
              <FiMessageSquare size={32} className={styles.emptyIcon} />
              <span className={styles.emptyTitle}>No submissions yet</span>
              <span className={styles.emptySub}>Complete an interview to see your feedback here.</span>
            </div>
          ) : (
            <div className={styles.fbList}>
              {answers.map((a, idx) => {
                const diff = DIFF_CONFIG[a.question?.difficulty] || DIFF_CONFIG.easy
                return (
                  <div key={a._id} className={styles.fbCard}>
                    <div className={styles.fbCardHeader}>
                      <span className={styles.fbQBadge}>Q{idx + 1}</span>
                      {a.question?.difficulty && (
                        <span className={styles.fbDiff} style={{ color: diff.color, background: diff.bg }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: diff.dot, display: 'inline-block' }} />
                          {diff.label}
                        </span>
                      )}
                    </div>
                    <p className={styles.fbQText}>{a.question?.question || 'Question unavailable'}</p>

                    <div className={styles.fbRow}>
                      <div className={styles.fbBlock}>
                        <div className={styles.fbBlockLabel}><FiUser size={12} /> Your Answer</div>
                        <p className={styles.fbBlockText}>{a.answer}</p>
                      </div>
                      <div className={`${styles.fbBlock} ${a.feedback ? styles.fbBlockGreen : styles.fbBlockAmber}`}>
                        <div className={styles.fbBlockLabel}>
                          <FiAward size={12} /> HR Feedback
                          {a.feedbackGivenAt && (
                            <span className={styles.fbDate}>
                              · {new Date(a.feedbackGivenAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {a.feedback ? (
                          <p className={styles.fbBlockText}>{a.feedback}</p>
                        ) : (
                          <div className={styles.pendingRow}>
                            <FiClock size={13} />
                            <span>Feedback pending from HR</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

/* ────────────────────────────────────────────
   Main Component
──────────────────────────────────────────── */
const StartInterview = () => {
  const [step, setStep] = useState(STEPS.SELECT)
  const [experience, setExperience] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadQuestions = async () => {
    if (!experience) return
    try {
      setLoading(true); setError('')
      const res = await UserAPI.get(`/hr/questions?experience=${experience}`)
      const qs = res.data.questions
      if (!qs?.length) return setError('No questions for this level. Try another.')
      setQuestions(qs); setAnswers({}); setCurrent(0)
      setStep(STEPS.INTERVIEW)
    } catch {
      setError('Failed to load questions. Please try again.')
    } finally { setLoading(false) }
  }

  const handleAnswer = val =>
    setAnswers(prev => ({ ...prev, [questions[current]._id]: val }))

  const goNext = () => current < questions.length - 1 && setCurrent(c => c + 1)
  const goPrev = () => current > 0 && setCurrent(c => c - 1)

  const submitAll = async () => {
    const unanswered = questions.filter(q => !answers[q._id]?.trim())
    if (unanswered.length)
      return setError(`${unanswered.length} question${unanswered.length > 1 ? 's' : ''} still unanswered.`)
    try {
      setSubmitting(true); setError('')
      await UserAPI.post('/hr/submit', {
        experienceLevel: experience,
        answers: questions.map(q => ({ questionId: q._id, answer: answers[q._id] })),
      })
      setStep(STEPS.DONE)
    } catch {
      setError('Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  const restart = () => {
    setStep(STEPS.SELECT); setExperience('')
    setQuestions([]); setAnswers({}); setCurrent(0); setError('')
  }

  const answered = Object.values(answers).filter(a => a?.trim()).length
  const progress = questions.length ? (answered / questions.length) * 100 : 0

  /* ── FEEDBACK ── */
  if (step === STEPS.FEEDBACK)
    return <MyFeedbackScreen onBack={() => setStep(STEPS.DONE)} onPracticeAgain={restart} />

  /* ── SELECT ── */
  if (step === STEPS.SELECT) return (
    <>
      <Header />
      <div className={styles.selectPage}>
        <div className={styles.selectGrid}>

          {/* Left */}
          <div className={styles.selectLeft}>
            <div className={styles.selectBadge}>
              <FiBriefcase size={13} /> HR Interview Practice
            </div>
            <h1 className={styles.selectH1}>
              Ace your next<br /><span className={styles.accentText}>HR Interview</span>
            </h1>
            <p className={styles.selectDesc}>
              Practice with real interview questions curated for your experience level and get personalised feedback from our HR team.
            </p>
            <div className={styles.featureList}>
              {[
                { icon: <FiMessageSquare size={14} />, text: 'Real HR interview questions' },
                { icon: <FiAward size={14} />, text: 'Personalised HR feedback' },
                { icon: <FiCheckCircle size={14} />, text: 'Track your performance' },
              ].map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <span className={styles.featureIconWrap}>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className={styles.selectRight}>
            <p className={styles.selectRightLabel}>Choose your experience level</p>
            {error && <div className={styles.errorBox}><FiAlertCircle size={13} /> {error}</div>}

            <div className={styles.levelList}>
              {EXPERIENCE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`${styles.levelCard} ${experience === o.value ? styles.levelCardActive : ''}`}
                  onClick={() => setExperience(o.value)}
                >
                  <span className={styles.levelEmoji}>{o.icon}</span>
                  <div className={styles.levelText}>
                    <span className={styles.levelName}>{o.label}</span>
                    <span className={styles.levelSub}>{o.sub}</span>
                  </div>
                  <span className={`${styles.levelRadio} ${experience === o.value ? styles.levelRadioActive : ''}`}>
                    {experience === o.value && <span className={styles.levelRadioDot} />}
                  </span>
                </button>
              ))}
            </div>

            <button className={styles.startBtn} onClick={loadQuestions} disabled={!experience || loading}>
              {loading
                ? <><FiLoader size={15} className={styles.spinIcon} /> Loading…</>
                : <><FiSend size={15} /> Start Interview</>}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )

  /* ── DONE ── */
  if (step === STEPS.DONE) return (
    <>
      <Header />
      <div className={styles.donePage}>
        <div className={styles.doneCard}>
          <div className={styles.doneIconCircle}>
            <FiCheckCircle size={32} />
          </div>
          <h2 className={styles.doneTitle}>Submission Complete!</h2>
          <p className={styles.doneSub}>
            Your answers are submitted. HR will review them and leave detailed feedback for you.
          </p>

          <div className={styles.doneStats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{questions.length}</span>
              <span className={styles.statLabel}>Questions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>{answered}</span>
              <span className={styles.statLabel}>Answered</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>{EXP_LABEL[experience]}</span>
              <span className={styles.statLabel}>Level</span>
            </div>
          </div>

          <div className={styles.doneBtns}>
            <button className={styles.viewFbBtn} onClick={() => setStep(STEPS.FEEDBACK)}>
              <FiEye size={15} /> View My Feedback
            </button>
            <button className={styles.doneRestartBtn} onClick={restart}>
              <FiRefreshCw size={14} /> Practice Again
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )

  /* ── INTERVIEW ── */
  const q = questions[current]
  const diff = DIFF_CONFIG[q?.difficulty] || DIFF_CONFIG.easy

  return (
    <>
      <Header />
      <div className={styles.interviewPage}>
        <div className={styles.interviewInner}>

          {/* Top bar */}
          <div className={styles.topBar}>
            <button className={styles.quitBtn} onClick={restart}>
              <FiX size={14} /> Quit
            </button>
            <div className={styles.progressWrap}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressLabel}>{answered}/{questions.length} answered</span>
            </div>
            <span className={styles.expPill}>{EXP_LABEL[experience]}</span>
          </div>

          {/* Dot nav */}
          <div className={styles.dotNav}>
            {questions.map((qu, idx) => (
              <button
                key={qu._id}
                onClick={() => setCurrent(idx)}
                title={`Q${idx + 1}`}
                className={[
                  styles.dot,
                  idx === current ? styles.dotCurrent : '',
                  answers[qu._id]?.trim() ? styles.dotAnswered : '',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Question card */}
          <div className={styles.qCard}>
            <div className={styles.qCardHead}>
              <span className={styles.qNumLabel}>Question {current + 1} of {questions.length}</span>
              {q?.difficulty && (
                <span className={styles.diffChip} style={{ color: diff.color, background: diff.bg }}>
                  <span className={styles.diffDot} style={{ background: diff.dot }} />
                  {diff.label}
                </span>
              )}
            </div>
            <p className={styles.qText}>{q?.question}</p>

            <div className={styles.answerSection}>
              {error && <div className={styles.errorBox}><FiAlertCircle size={13} /> {error}</div>}
              <label className={styles.answerLabel}>Your Answer</label>
              <textarea
                className={styles.answerArea}
                rows={6}
                placeholder="Write your answer clearly and concisely…"
                value={answers[q?._id] || ''}
                onChange={e => handleAnswer(e.target.value)}
              />
              <span className={styles.charCount}>{(answers[q?._id] || '').length} characters</span>
            </div>
          </div>

          {/* Nav */}
          <div className={styles.navRow}>
            <button className={styles.navBtn} onClick={goPrev} disabled={current === 0}>
              <FiChevronLeft size={16} /> Previous
            </button>
            {current === questions.length - 1 ? (
              <button className={styles.submitBtn} onClick={submitAll} disabled={submitting}>
                {submitting
                  ? <><FiLoader size={14} className={styles.spinIcon} /> Submitting…</>
                  : <><FiSend size={14} /> Submit All</>}
              </button>
            ) : (
              <button className={styles.nextBtn} onClick={goNext}>
                Next <FiChevronRight size={16} />
              </button>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}

export default StartInterview