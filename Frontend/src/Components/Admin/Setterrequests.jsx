import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSetterRequestsAPI, approveSetterRequestAPI, rejectSetterRequestAPI } from './adminApi';

const SetterRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionId, setActionId] = useState(null);
    const navigate = useNavigate();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await getAllSetterRequestsAPI();
            setRequests(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this request? An account will be created and email sent.')) return;
        setActionId(id);
        try {
            await approveSetterRequestAPI(id);
            await fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving request.');
        }
        setActionId(null);
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this request? The applicant will be notified via email.')) return;
        setActionId(id);
        try {
            await rejectSetterRequestAPI(id);
            await fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting request.');
        }
        setActionId(null);
    };

    const filtered = requests.filter(r => r.status === filter);

    const counts = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .srp-page {
          min-height: 100vh;
          background: #080b12;
          font-family: 'Space Grotesk', sans-serif;
          color: #fff;
          padding: 32px;
        }

        .srp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .srp-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #aaa;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .srp-back:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .srp-heading { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .srp-heading span { color: #7c3aed; }

        .srp-stats {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .srp-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 16px 24px;
          min-width: 120px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .srp-stat:hover { background: rgba(255,255,255,0.05); }
        .srp-stat.active-pending  { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
        .srp-stat.active-approved { border-color: #10b981; background: rgba(16,185,129,0.08); }
        .srp-stat.active-rejected { border-color: #ef4444; background: rgba(239,68,68,0.08); }

        .srp-stat-num {
          font-size: 28px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
          margin-bottom: 4px;
        }
        .srp-stat-num.pending  { color: #f59e0b; }
        .srp-stat-num.approved { color: #10b981; }
        .srp-stat-num.rejected { color: #ef4444; }

        .srp-stat-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
        }

        .srp-empty {
          text-align: center;
          padding: 80px 32px;
          color: #444;
        }
        .srp-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .srp-empty-text { font-size: 15px; color: #555; }

        .srp-list { display: flex; flex-direction: column; gap: 10px; }

        .srp-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          transition: border-color 0.2s;
          animation: fadeUp 0.3s ease both;
        }
        .srp-item:hover { border-color: rgba(124,58,237,0.2); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .srp-item-left { display: flex; align-items: center; gap: 16px; }

        .srp-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .srp-name  { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .srp-email { font-size: 12px; color: #666; font-family: 'JetBrains Mono', monospace; }
        .srp-date  { font-size: 11px; color: #555; margin-top: 4px; }

        .srp-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .srp-badge.pending  { background: rgba(245,158,11,0.1);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
        .srp-badge.approved { background: rgba(16,185,129,0.1);  color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .srp-badge.rejected { background: rgba(239,68,68,0.1);   color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

        .srp-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        .srp-approve-btn, .srp-reject-btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.2s;
          border: none;
        }
        .srp-approve-btn {
          background: rgba(16,185,129,0.12);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.25);
        }
        .srp-approve-btn:hover:not(:disabled) { background: rgba(16,185,129,0.22); }

        .srp-reject-btn {
          background: rgba(239,68,68,0.08);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .srp-reject-btn:hover:not(:disabled) { background: rgba(239,68,68,0.18); }

        .srp-approve-btn:disabled, .srp-reject-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .srp-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #555;
          font-size: 15px;
          gap: 10px;
        }

        .srp-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(124,58,237,0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

            <div className="srp-page">
                <div className="srp-topbar">
                    <button className="srp-back" onClick={() => navigate('/admin/dashboard')}>
                        ← Back to Dashboard
                    </button>
                    <h2 className="srp-heading">Setter <span>Requests</span></h2>
                </div>

                {/* Stats / Filter Tabs */}
                <div className="srp-stats">
                    {['pending', 'approved', 'rejected'].map(s => (
                        <div
                            key={s}
                            className={`srp-stat ${filter === s ? `active-${s}` : ''}`}
                            onClick={() => setFilter(s)}
                        >
                            <div className={`srp-stat-num ${s}`}>{counts[s]}</div>
                            <div className="srp-stat-label">{s}</div>
                        </div>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="srp-loading">
                        <div className="srp-spinner" /> Loading requests...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="srp-empty">
                        <div className="srp-empty-icon">
                            {filter === 'pending' ? '📭' : filter === 'approved' ? '✅' : '❌'}
                        </div>
                        <div className="srp-empty-text">No {filter} requests found</div>
                    </div>
                ) : (
                    <div className="srp-list">
                        {filtered.map((r, i) => (
                            <div
                                className="srp-item"
                                key={r._id}
                                style={{ animationDelay: `${i * 0.04}s` }}
                            >
                                <div className="srp-item-left">
                                    <div className="srp-avatar">{r.username[0].toUpperCase()}</div>
                                    <div>
                                        <div className="srp-name">{r.username}</div>
                                        <div className="srp-email">{r.email}</div>
                                        <div className="srp-date">
                                            Applied: {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="srp-actions">
                                    <span className={`srp-badge ${r.status}`}>{r.status}</span>
                                    {r.status === 'pending' && (
                                        <>
                                            <button
                                                className="srp-approve-btn"
                                                disabled={actionId === r._id}
                                                onClick={() => handleApprove(r._id)}
                                            >
                                                {actionId === r._id ? '...' : '✓ Approve'}
                                            </button>
                                            <button
                                                className="srp-reject-btn"
                                                disabled={actionId === r._id}
                                                onClick={() => handleReject(r._id)}
                                            >
                                                {actionId === r._id ? '...' : '✕ Reject'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default SetterRequests;