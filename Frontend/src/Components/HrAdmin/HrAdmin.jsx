import React, { useEffect, useState } from 'react'
import API from '../Admin/adminApi.js'
import ReviewStudents from './Reviewstudents.jsx'
import ScheduleinterviewDetails from './ScheduleinterviewDetails.jsx'
import styles from './HrAdmin.module.css'
import {
  RiAddCircleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiQuestionLine,
  RiBriefcaseLine,
  RiFilter3Line,
  RiCalendarScheduleLine,
  RiSearchLine,
} from 'react-icons/ri'
import { FaUserGroup } from 'react-icons/fa6'
import { HiSparkles } from 'react-icons/hi2'
import { MdOutlineQuiz } from 'react-icons/md'

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher' },
  { value: '0-6', label: '0–6 Months' },
  { value: '6-12', label: '6–12 Months' },
  { value: '1-2', label: '1–2 Years' },
  { value: '2+', label: '2+ Years' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const diffConfig = {
  easy:   { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
  medium: { bg: '#fef9c3', color: '#a16207', border: '#fde68a', dot: '#eab308' },
  hard:   { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
}

const HrAdmin = () => {
  const [form, setForm] = useState({ question: '', experienceLevel: 'fresher', difficulty: 'easy' })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewQ, setViewQ] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchQuestions = async () => {
    try {
      setFetchLoading(true)
      const res = await API.get(`/hr/questions?experience=${form.experienceLevel}`)
      setQuestions(res.data.questions)
    } catch (err) {
      console.error(err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => { fetchQuestions() }, [form.experienceLevel])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const addQuestion = async () => {
    if (!form.question.trim()) return
    try {
      setLoading(true)
      await API.post('/hr/add-question', form)
      setForm({ question: '', experienceLevel: form.experienceLevel, difficulty: 'easy' })
      fetchQuestions()
      showToast('Question added successfully!')
    } catch {
      showToast('Failed to add question', 'error')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (q) => {
    setEditId(q._id)
    setEditForm({ question: q.question, experienceLevel: q.experienceLevel, difficulty: q.difficulty || 'easy' })
  }

  const saveEdit = async (id) => {
    try {
      await API.put(`/hr/question/${id}`, editForm)
      setEditId(null)
      fetchQuestions()
      showToast('Question updated!')
    } catch {
      showToast('Update failed', 'error')
    }
  }

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await API.delete(`/hr/question/${id}`)
      fetchQuestions()
      showToast('Question deleted.')
    } catch {
      showToast('Delete failed', 'error')
    }
  }

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showReview) return <ReviewStudents onBack={() => setShowReview(false)} />
  if (showDashboard) return <ScheduleinterviewDetails onBack={() => setShowDashboard(false)} />

  return (
    <div className={styles.page}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success'
            ? <RiCheckLine size={16} />
            : <RiErrorWarningLine size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* View Modal */}
      {viewQ && (
        <div className={styles.modalOverlay} onClick={() => setViewQ(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setViewQ(null)}>
              <RiCloseLine size={17} />
            </button>

            <div className={styles.modalIconWrap}>
              <MdOutlineQuiz size={22} />
            </div>

            <div className={styles.modalBadgeRow}>
              <span className={styles.expBadge}>
                <RiBriefcaseLine size={12} />
                {EXPERIENCE_OPTIONS.find(o => o.value === viewQ.experienceLevel)?.label}
              </span>
              <span
                className={styles.diffBadge}
                style={{
                  background: diffConfig[viewQ.difficulty]?.bg,
                  color: diffConfig[viewQ.difficulty]?.color,
                  border: `1px solid ${diffConfig[viewQ.difficulty]?.border}`,
                }}
              >
                <span
                  className={styles.diffDot}
                  style={{ background: diffConfig[viewQ.difficulty]?.dot }}
                />
                {viewQ.difficulty}
              </span>
            </div>

            <p className={styles.modalQuestion}>{viewQ.question}</p>

            <div className={styles.modalDivider} />
            <small className={styles.modalMeta}>
              Added on {new Date(viewQ.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </small>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <RiQuestionLine size={21} />
          </div>
          <div>
            <h1 className={styles.title}>HR Question Bank</h1>
            <p className={styles.subtitle}>Manage interview questions by experience level</p>
          </div>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.dashboardBtn} onClick={() => setShowDashboard(true)}>
            <RiCalendarScheduleLine size={15} />
            Interview Schedules
          </button>
          <button className={styles.reviewBtn} onClick={() => setShowReview(true)}>
            <FaUserGroup size={15} />
            Review Students
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        {DIFFICULTY_OPTIONS.map(d => {
          const count = questions.filter(q => (q.difficulty || 'easy') === d.value).length
          return (
            <div key={d.value} className={styles.statCard}>
              <span
                className={styles.statDot}
                style={{ background: diffConfig[d.value].dot }}
              />
              <span className={styles.statLabel}>{d.label}</span>
              <span className={styles.statCount}>{count}</span>
            </div>
          )
        })}
        <div className={styles.statCard} style={{ marginLeft: 'auto' }}>
          <HiSparkles size={14} style={{ color: '#6366f1' }} />
          <span className={styles.statLabel}>Total</span>
          <span className={styles.statCount} style={{ color: '#6366f1' }}>{questions.length}</span>
        </div>
      </div>

      {/* Add Question Form */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <RiAddCircleLine size={15} style={{ color: '#6366f1' }} />
          <span className={styles.formTitle}>Add new question</span>
        </div>
        <div className={styles.formBody}>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            placeholder="Type your HR interview question here…"
            rows={3}
            className={styles.textarea}
          />
          <div className={styles.formRow}>
            <div className={styles.selectWrap}>
              <label>Experience Level</label>
              <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className={styles.selectWrap}>
              <label>Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button
              className={styles.addBtn}
              onClick={addQuestion}
              disabled={loading || !form.question.trim()}
            >
              {loading
                ? <><RiLoader4Line size={15} className={styles.spin} /> Adding…</>
                : <><RiAddCircleLine size={15} /> Add Question</>}
            </button>
          </div>
        </div>
      </div>

      {/* Filter + Search Bar */}
      <div className={styles.controlBar}>
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>
            <RiFilter3Line size={14} /> Filter
          </span>
          {EXPERIENCE_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`${styles.filterChip} ${form.experienceLevel === o.value ? styles.activeChip : ''}`}
              onClick={() => setForm(f => ({ ...f, experienceLevel: o.value }))}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <RiSearchLine size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search questions…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <span className={styles.countBadge}>{filteredQuestions.length} questions</span>
      </div>

      {/* Questions List */}
      <div className={styles.list}>
        {fetchLoading ? (
          <div className={styles.emptyState}>
            <RiLoader4Line size={28} className={`${styles.spin} ${styles.spinIcon}`} />
            <p>Loading questions…</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className={styles.emptyState}>
            <MdOutlineQuiz size={36} className={styles.emptyIcon} />
            <p>{searchTerm ? 'No questions match your search.' : 'No questions yet. Add one above ↑'}</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={q._id} className={styles.card}>
              {editId === q._id ? (
                <div className={styles.editMode}>
                  <textarea
                    value={editForm.question}
                    onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                    rows={3}
                    className={styles.editTextarea}
                  />
                  <div className={styles.editRow}>
                    <select
                      value={editForm.experienceLevel}
                      onChange={e => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                    >
                      {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select
                      value={editForm.difficulty}
                      onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}
                    >
                      {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button className={styles.saveBtn} onClick={() => saveEdit(q._id)}>
                      <RiCheckLine size={14} /> Save
                    </button>
                    <button className={styles.cancelBtn} onClick={() => setEditId(null)}>
                      <RiCloseLine size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.cardLeft}>
                    <span className={styles.cardNum}>{String(idx + 1).padStart(2, '0')}</span>
                    <p className={styles.cardQ}>{q.question}</p>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={styles.expBadge}>
                      <RiBriefcaseLine size={11} />
                      {EXPERIENCE_OPTIONS.find(o => o.value === q.experienceLevel)?.label}
                    </span>
                    <span
                      className={styles.diffBadge}
                      style={{
                        background: diffConfig[q.difficulty || 'easy']?.bg,
                        color: diffConfig[q.difficulty || 'easy']?.color,
                        border: `1px solid ${diffConfig[q.difficulty || 'easy']?.border}`,
                      }}
                    >
                      <span
                        className={styles.diffDot}
                        style={{ background: diffConfig[q.difficulty || 'easy']?.dot }}
                      />
                      {q.difficulty || 'easy'}
                    </span>
                    <div className={styles.actions}>
                      <button className={`${styles.actionBtn} ${styles.viewBtn}`} onClick={() => setViewQ(q)} title="View">
                        <RiEyeLine size={15} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => startEdit(q)} title="Edit">
                        <RiEditLine size={15} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteQuestion(q._id)} title="Delete">
                        <RiDeleteBinLine size={15} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HrAdmin