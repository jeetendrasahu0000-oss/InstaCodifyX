// src/components/HR/StartInterview/StartInterview.jsx
import React, { useEffect, useState } from 'react'
import userApi from '../../../utils/api'  // ✅ user wala axios (user token attach karta hai)
import Header from '../../Header/Header'
import Footer from '../../Footer/Footer'
import styles from './StartInterview.module.css'

import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiLoader, FiTarget } from 'react-icons/fi'
import { BsLightningChargeFill } from 'react-icons/bs'
import { MdOutlineQuestionAnswer } from 'react-icons/md'
import { HiOutlineAcademicCap } from 'react-icons/hi'

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher',      icon: '🌱' },
  { value: '0-6',     label: '0–6 Months',   icon: '📘' },
  { value: '6-12',    label: '6–12 Months',  icon: '📗' },
  { value: '1-2',     label: '1–2 Years',    icon: '📙' },
  { value: '2+',      label: '2+ Years',     icon: '🏆' },
]

const StartInterview = () => {
  const [questions, setQuestions]   = useState([])
  const [answers, setAnswers]       = useState({})
  const [index, setIndex]           = useState(0)
  const [experience, setExperience] = useState('0-6')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  const fetchQuestions = async () => {
    setLoading(true)
    setIndex(0)
    setAnswers({})
    setSubmitted(false)
    try {
      const res = await userApi.get(`/hr/questions?experience=${experience}`)  // ✅ userApi
      setQuestions(res.data.questions || [])
    } catch (err) {
      console.error('Fetch Error:', err)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuestions() }, [experience])

  const handleAnswer = (value) => {
    if (!questions[index]?._id) return
    setAnswers(prev => ({ ...prev, [questions[index]._id]: value }))
  }

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(questions.length - 1, i + 1))

  const submit = async () => {
    setSubmitting(true)
    try {
      const formatted = Object.keys(answers).map(id => ({
        questionId: id,
        answer: answers[id],
      }))
      await userApi.post('/hr/submit', { answers: formatted })  // ✅ userApi
      setSubmitted(true)
    } catch (err) {
      console.error('Submit Error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const progressPct = questions.length > 0
    ? Math.round(((index + 1) / questions.length) * 100)
    : 0

  const answeredCount = Object.keys(answers).length
  const currentAnswer = answers[questions[index]?._id] || ''
  const selectedExp = EXPERIENCE_OPTIONS.find(o => o.value === experience)

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.wrapper}>

          {/* ── Page Header ── */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <FiTarget />
              </div>
              <div>
                <h1 className={styles.pageTitle}>Mock HR Interview</h1>
                <p className={styles.pageSubtitle}>Answer honestly — take your time with each question.</p>
              </div>
            </div>

            {/* Experience Selector */}
            <div className={styles.expSelector}>
              <label className={styles.expLabel}>
                <HiOutlineAcademicCap /> Experience Level
              </label>
              <div className={styles.expTabs}>
                {EXPERIENCE_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    className={`${styles.expTab} ${experience === o.value ? styles.expTabActive : ''}`}
                    onClick={() => setExperience(o.value)}
                  >
                    <span>{o.icon}</span> {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          {!loading && questions.length > 0 && !submitted && (
            <div className={styles.statsBar}>
              <div className={styles.statChip}>
                <MdOutlineQuestionAnswer />
                <span>{questions.length} Questions</span>
              </div>
              <div className={styles.statChip}>
                <BsLightningChargeFill style={{ color: '#f59e0b' }} />
                <span>{answeredCount} Answered</span>
              </div>
              <div className={styles.statChip}>
                <FiTarget style={{ color: '#6366f1' }} />
                <span>{selectedExp?.label}</span>
              </div>

              {/* Progress */}
              <div className={styles.progressWrapper}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                </div>
                <span className={styles.progressLabel}>{index + 1}/{questions.length}</span>
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className={styles.stateCard}>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
              <p>Loading questions…</p>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !submitted && questions.length === 0 && (
            <div className={styles.stateCard}>
              <div className={styles.stateEmoji}>🙁</div>
              <h3>No Questions Found</h3>
              <p>No questions available for this experience level.<br />Ask your HR to add some!</p>
            </div>
          )}

          {/* ── Submitted ── */}
          {submitted && (
            <div className={`${styles.stateCard} ${styles.stateSuccess}`}>
              <FiCheckCircle className={styles.successIcon} />
              <h3>Interview Submitted!</h3>
              <p>Great job! Your answers have been recorded.<br />Best of luck with your results. 🎉</p>
              <button className={styles.retryBtn} onClick={fetchQuestions}>
                Practice Again
              </button>
            </div>
          )}

          {/* ── Question Card ── */}
          {!loading && !submitted && questions.length > 0 && (
            <div className={styles.questionSection}>

              {/* Question Dots Nav */}
              <div className={styles.dotNav}>
                {questions.map((q, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === index ? styles.dotActive : ''} ${answers[q._id] ? styles.dotAnswered : ''}`}
                    onClick={() => setIndex(i)}
                    title={`Q${i + 1}`}
                  />
                ))}
              </div>

              {/* Card */}
              <div className={styles.questionCard}>
                <div className={styles.questionMeta}>
                  <span className={styles.questionBadge}>Question {index + 1}</span>
                  {currentAnswer && <span className={styles.answeredBadge}><FiCheckCircle /> Answered</span>}
                </div>

                <h3 className={styles.questionText}>
                  {questions[index]?.question}
                </h3>

                <textarea
                  className={styles.answerInput}
                  placeholder="Type your answer here… Be specific and use examples where possible."
                  value={currentAnswer}
                  onChange={e => handleAnswer(e.target.value)}
                />

                <div className={styles.charCount}>
                  {currentAnswer.length} characters
                </div>
              </div>

              {/* Navigation */}
              <div className={styles.nav}>
                <button
                  className={styles.btnSecondary}
                  onClick={prev}
                  disabled={index === 0}
                >
                  <FiChevronLeft /> Previous
                </button>

                {index < questions.length - 1 ? (
                  <button className={styles.btnPrimary} onClick={next}>
                    Next <FiChevronRight />
                  </button>
                ) : (
                  <button
                    className={`${styles.btnPrimary} ${styles.btnSubmit}`}
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting
                      ? <><FiLoader className={styles.spinIcon} /> Submitting…</>
                      : <><FiCheckCircle /> Submit Interview</>
                    }
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}

export default StartInterview