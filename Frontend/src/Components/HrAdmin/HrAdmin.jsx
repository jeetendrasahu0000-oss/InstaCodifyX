// src/pages/HR/HrAdmin.jsx
import React, { useEffect, useState } from 'react'
import api from '../../utils/api'
import styles from './HrAdmin.module.css'

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher' },
  { value: '0-6',     label: '0–6 Months' },
  { value: '6-12',    label: '6–12 Months' },
  { value: '1-2',     label: '1–2 Years' },
  { value: '2+',      label: '2+ Years' },
]

const HrAdmin = () => {
  const [form, setForm] = useState({ question: '', experienceLevel: 'fresher' })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const fetchQuestions = async () => {
    try {
      setFetchLoading(true)
      const res = await api.get(`/hr/questions?experience=${form.experienceLevel}`)
      setQuestions(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => { fetchQuestions() }, [form.experienceLevel])

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const addQuestion = async () => {
    if (!form.question.trim()) return
    try {
      setLoading(true)
      await api.post('/hr/add-question', form)
      setForm({ question: '', experienceLevel: form.experienceLevel })
      fetchQuestions()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1>HR Question Panel</h1>

      {/* ── Add Question Form ── */}
      <div className={styles.form}>
        <input
          name="question"
          value={form.question}
          onChange={handleChange}
          placeholder="Enter a new HR interview question…"
          onKeyDown={e => e.key === 'Enter' && addQuestion()}
        />
        <select
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
        >
          {EXPERIENCE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button onClick={addQuestion} disabled={loading || !form.question.trim()}>
          {loading ? 'Adding…' : '＋ Add Question'}
        </button>
      </div>

      {/* ── Question List ── */}
      <div className={styles.list}>
        <h2>
          Questions —&nbsp;
          {EXPERIENCE_OPTIONS.find(o => o.value === form.experienceLevel)?.label}
        </h2>

        {fetchLoading ? (
          <p>Loading…</p>
        ) : questions.length === 0 ? (
          <p>No questions yet. Add one above ↑</p>
        ) : (
          questions.map(q => (
            <div key={q._id} className={styles.card}>
              <p>{q.question}</p>
              <span>
                {EXPERIENCE_OPTIONS.find(o => o.value === q.experienceLevel)?.label
                  ?? q.experienceLevel}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HrAdmin