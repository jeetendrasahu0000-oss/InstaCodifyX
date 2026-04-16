import React, { useEffect, useState } from 'react'
import API from '../Admin/adminApi.js'
import styles from './Reviewstudents.module.css'
import {
    RiArrowLeftLine,
    RiCheckLine,
    RiErrorWarningLine,
    RiLoader4Line,
    RiMailLine,
    RiUserLine,
    RiCalendarLine,
    RiMessageLine,
    RiEditLine,
    RiSendPlaneLine,
    RiInboxLine,
    RiBriefcaseLine,
    RiQuestionAnswerLine,
    RiArrowRightLine,
    RiBarChartLine,
    RiTimeLine,
    RiCheckboxCircleLine,
} from 'react-icons/ri'

const EXPERIENCE_LABELS = {
    fresher: 'Fresher',
    '0-6': '0–6 Months',
    '6-12': '6–12 Months',
    '1-2': '1–2 Years',
    '2+': '2+ Years',
}

// ─────────────────────────────────────────────────────────
// StudentDetail
// ─────────────────────────────────────────────────────────
const StudentDetail = ({ userId, userName, onBack }) => {
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [feedbackMap, setFeedbackMap] = useState({})
    const [savingId, setSavingId] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get(`/hr/student-answers/${userId}`)
                setAnswers(res.data.answers)
                const map = {}
                res.data.answers.forEach(a => { map[a._id] = a.feedback || '' })
                setFeedbackMap(map)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userId])

    const saveFeedback = async (answerId) => {
        const text = feedbackMap[answerId]?.trim()
        if (!text) return showToast('Feedback cannot be empty', 'error')
        try {
            setSavingId(answerId)
            await API.put(`/hr/feedback/${answerId}`, { feedback: text })
            showToast('Feedback saved successfully!')
            setAnswers(prev =>
                prev.map(a =>
                    a._id === answerId
                        ? { ...a, feedback: text, feedbackGivenAt: new Date().toISOString() }
                        : a
                )
            )
        } catch (err) {
            showToast('Failed to save feedback', 'error')
        } finally {
            setSavingId(null)
        }
    }

    const reviewedCount = answers.filter(a => a.feedback).length

    return (
        <div className={styles.detailPage}>
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.type === 'success'
                        ? <RiCheckLine size={15} />
                        : <RiErrorWarningLine size={15} />}
                    {toast.msg}
                </div>
            )}

            <button className={styles.backBtn} onClick={onBack}>
                <RiArrowLeftLine size={15} /> Back to submissions
            </button>

            <div className={styles.detailHeader}>
                <div className={styles.detailAvatar}>
                    {(userName || 'U')[0].toUpperCase()}
                </div>
                <div>
                    <h2 className={styles.detailName}>{userName}</h2>
                    <p className={styles.detailSub}>
                        <RiQuestionAnswerLine size={13} />
                        {answers.length} answers submitted
                        {reviewedCount > 0 && (
                            <span className={styles.reviewedBadge}>
                                <RiCheckboxCircleLine size={11} />
                                {reviewedCount} reviewed
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className={styles.center}>
                    <RiLoader4Line size={30} className={styles.spin} style={{ color: '#4f46e5' }} />
                </div>
            ) : (
                <div className={styles.answerList}>
                    {answers.map((a, idx) => (
                        <div key={a._id} className={styles.answerCard}>
                            <div className={styles.qHeader}>
                                <span className={styles.qNum}>Q{idx + 1}</span>
                                <p className={styles.qText}>{a.question?.question || 'Question deleted'}</p>
                            </div>

                            <div className={styles.answerBox}>
                                <span className={styles.sectionLabel}>
                                    <RiMessageLine size={11} /> Student's Answer
                                </span>
                                <p className={styles.answerText}>{a.answer}</p>
                            </div>

                            <div className={styles.feedbackSection}>
                                <span className={styles.feedbackLabel}>
                                    <RiEditLine size={11} /> HR Feedback
                                    {a.feedbackGivenAt && (
                                        <span className={styles.feedbackDate}>
                                            · Saved {new Date(a.feedbackGivenAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    )}
                                </span>
                                <textarea
                                    className={styles.feedbackTextarea}
                                    rows={3}
                                    placeholder="Write your feedback for this answer…"
                                    value={feedbackMap[a._id] || ''}
                                    onChange={e => setFeedbackMap(m => ({ ...m, [a._id]: e.target.value }))}
                                />
                                <button
                                    className={`${styles.feedbackBtn} ${a.feedback ? styles.updateBtn : ''}`}
                                    onClick={() => saveFeedback(a._id)}
                                    disabled={savingId === a._id}
                                >
                                    {savingId === a._id ? (
                                        <><RiLoader4Line size={13} className={styles.spin} /> Saving…</>
                                    ) : a.feedback ? (
                                        <><RiCheckLine size={13} /> Update Feedback</>
                                    ) : (
                                        <><RiSendPlaneLine size={13} /> Save Feedback</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────
// ReviewStudents
// ─────────────────────────────────────────────────────────
const ReviewStudents = ({ onBack }) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/hr/submissions')
                setStudents(res.data.students)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (selected) {
        return (
            <StudentDetail
                userId={selected.userId}
                userName={selected.userName}
                onBack={() => setSelected(null)}
            />
        )
    }

    const totalAnswers = students.reduce((acc, s) => acc + s.totalAnswers, 0)

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={onBack}>
                <RiArrowLeftLine size={15} /> HR Panel
            </button>

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>Student Submissions</h1>
                    <p className={styles.subtitle}>Review answers submitted by candidates</p>
                </div>
            </div>

            {!loading && students.length > 0 && (
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
                            <RiUserLine size={16} />
                        </span>
                        <div>
                            <p className={styles.statLabel}>Total Candidates</p>
                            <p className={styles.statValue}>{students.length}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                            <RiBarChartLine size={16} />
                        </span>
                        <div>
                            <p className={styles.statLabel}>Total Answers</p>
                            <p className={styles.statValue}>{totalAnswers}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon} style={{ background: '#fffbeb', color: '#d97706' }}>
                            <RiTimeLine size={16} />
                        </span>
                        <div>
                            <p className={styles.statLabel}>Pending Review</p>
                            <p className={styles.statValue}>{students.length}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className={styles.center}>
                    <RiLoader4Line size={30} className={styles.spin} style={{ color: '#4f46e5' }} />
                </div>
            ) : students.length === 0 ? (
                <div className={styles.empty}>
                    <RiInboxLine size={40} />
                    <p>No submissions yet</p>
                </div>
            ) : (
                <div className={styles.tableWrap}>
                    <div className={styles.tableHead}>
                        <span>#</span>
                        <span><RiUserLine size={12} style={{ marginRight: 4 }} />Student</span>
                        <span><RiBriefcaseLine size={12} style={{ marginRight: 4 }} />Experience</span>
                        <span>Answers</span>
                        <span><RiCalendarLine size={12} style={{ marginRight: 4 }} />Submitted</span>
                        <span>Action</span>
                    </div>

                    {students.map((s, idx) => (
                        <div key={s.user?._id} className={styles.tableRow}>
                            <span className={styles.rowNum}>{String(idx + 1).padStart(2, '0')}</span>

                            <div className={styles.studentInfo}>
                                <div className={styles.avatar}>
                                    {(s.user?.name || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className={styles.studentName}>{s.user?.name || 'Unknown'}</p>
                                    <p className={styles.studentEmail}>
                                        <RiMailLine size={10} /> {s.user?.email || '—'}
                                    </p>
                                </div>
                            </div>

                            <span className={styles.expChip}>
                                <RiBriefcaseLine size={10} />
                                {EXPERIENCE_LABELS[s.experienceLevel] || s.experienceLevel}
                            </span>

                            <span className={styles.countChip}>{s.totalAnswers} Q</span>

                            <span className={styles.dateText}>
                                {new Date(s.submittedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </span>

                            <button
                                className={styles.reviewBtn}
                                onClick={() => setSelected({ userId: s.user?._id, userName: s.user?.name || 'Student' })}
                            >
                                View Answers <RiArrowRightLine size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ReviewStudents