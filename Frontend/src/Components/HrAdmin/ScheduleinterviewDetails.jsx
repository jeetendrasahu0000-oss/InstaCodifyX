// Frontend/src/components/HR/HRDashboard/ScheduleinterviewDetails.jsx
import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import api from '../../utils/api.js'
import { FiCheckCircle, FiXCircle, FiVideo, FiRefreshCw, FiLoader, FiArrowLeft } from 'react-icons/fi'
import styles from './ScheduleinterviewDetails.module.css'

const STATUSES = ['all', 'pending', 'approved', 'rejected']

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ScheduleinterviewDetails = ({ onBack }) => {
    const [schedules, setSchedules] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)
    const [error, setError] = useState('')

    const fetchSchedules = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const { data } = await axios.get(`${BASE_URL}/hr/all-schedules`)
            setSchedules(data.schedules || [])
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load schedules')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSchedules() }, [fetchSchedules])

    const updateStatus = async (id, status) => {
        setUpdating(id + status)
        try {
            await api.put(`/hr/status/${id}`, { status })
            setSchedules(prev =>
                prev.map(s => s._id === id ? { ...s, status } : s)
            )
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed')
        } finally {
            setUpdating(null)
        }
    }

    const visible = filter === 'all'
        ? schedules
        : schedules.filter(s => s.status === filter)

    const counts = {
        total: schedules.length,
        pending: schedules.filter(s => s.status === 'pending').length,
        approved: schedules.filter(s => s.status === 'approved').length,
        rejected: schedules.filter(s => s.status === 'rejected').length,
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                <div className={styles.topBar}>
                    <button className={styles.backBtn} onClick={onBack}>
                        <FiArrowLeft /> Back
                    </button>
                    <h2 className={styles.heading}>Interview Schedules</h2>
                    <button className={styles.refreshBtn} onClick={fetchSchedules}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    {[
                        { label: 'Total', val: counts.total },
                        { label: 'Pending', val: counts.pending, cls: styles.pending },
                        { label: 'Approved', val: counts.approved, cls: styles.approved },
                        { label: 'Rejected', val: counts.rejected, cls: styles.rejected },
                    ].map(s => (
                        <div className={styles.statCard} key={s.label}>
                            <p className={styles.statLabel}>{s.label}</p>
                            <p className={`${styles.statVal} ${s.cls || ''}`}>{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className={styles.filters}>
                    {STATUSES.map(f => (
                        <button
                            key={f}
                            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className={styles.center}><FiLoader className={styles.spin} /> Loading...</div>
                ) : error ? (
                    <div className={styles.errorBox}>{error}</div>
                ) : visible.length === 0 ? (
                    <div className={styles.center}>No interviews found.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                   
                                    <th>Email</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Meet</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(s => (
                                    <tr key={s._id}>
                                
                                        <td>{s.email}</td>
                                        <td>{new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}</td>
                                        <td>{s.time} IST</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[s.status]}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            {s.meetingLink
                                                ? <a href={s.meetingLink} target="_blank" rel="noreferrer" className={styles.meetLink}>
                                                    <FiVideo /> Join
                                                </a>
                                                : '—'
                                            }
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {s.status !== 'approved' && (
                                                    <button
                                                        className={styles.approveBtn}
                                                        disabled={!!updating}
                                                        onClick={() => updateStatus(s._id, 'approved')}
                                                    >
                                                        {updating === s._id + 'approved'
                                                            ? <FiLoader className={styles.spin} />
                                                            : <><FiCheckCircle /> Approve</>
                                                        }
                                                    </button>
                                                )}
                                                {s.status !== 'rejected' && (
                                                    <button
                                                        className={styles.rejectBtn}
                                                        disabled={!!updating}
                                                        onClick={() => updateStatus(s._id, 'rejected')}
                                                    >
                                                        {updating === s._id + 'rejected'
                                                            ? <FiLoader className={styles.spin} />
                                                            : <><FiXCircle /> Reject</>
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ScheduleinterviewDetails