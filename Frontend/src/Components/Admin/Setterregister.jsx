import { useState } from 'react';
import { submitSetterRequestAPI } from './adminApi';

const SetterRegister = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const [status, setStatus] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            setMsg('Passwords do not match.');
            setStatus('error');
            return;
        }
        setLoading(true);
        setMsg('');
        try {
            const { data } = await submitSetterRequestAPI({
                username: form.username,
                email: form.email,
                password: form.password,
            });
            setMsg(data.message);
            setStatus('success');
            setSubmitted(true);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Something went wrong.');
            setStatus('error');
        }
        setLoading(false);
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sr-root {
          min-height: 100vh;
          background: #080b12;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .sr-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(124,58,237,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0,198,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .sr-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .sr-card {
          position: relative;
          width: 100%;
          max-width: 460px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(124,58,237,0.1), 0 32px 64px rgba(0,0,0,0.5);
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sr-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #7c3aed;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sr-logo::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #7c3aed;
          border-radius: 50%;
          box-shadow: 0 0 8px #7c3aed;
        }

        .sr-title {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .sr-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .sr-field { margin-bottom: 18px; }

        .sr-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .sr-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sr-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }

        .sr-input::placeholder { color: #444; }

        .sr-btn {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          letter-spacing: 0.3px;
        }

        .sr-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sr-btn:active:not(:disabled) { transform: translateY(0); }
        .sr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sr-alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .sr-alert.error  { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2);  color: #fca5a5; }
        .sr-alert.success{ background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #6ee7b7; }

        .sr-success-card {
          text-align: center;
          padding: 16px 0 8px;
          animation: fadeUp 0.4s ease both;
        }

        .sr-success-icon {
          width: 64px;
          height: 64px;
          background: rgba(124,58,237,0.15);
          border: 2px solid rgba(124,58,237,0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 20px;
        }

        .sr-success-title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }

        .sr-success-text {
          font-size: 14px;
          color: #888;
          line-height: 1.7;
          max-width: 320px;
          margin: 0 auto;
        }

        .sr-success-text strong { color: #a855f7; }

        .sr-steps {
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          padding: 16px;
          margin-top: 20px;
          text-align: left;
        }

        .sr-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          font-size: 13px;
          color: #777;
        }

        .sr-step span { color: #a855f7; font-size: 15px; }

        .sr-login-link {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #555;
        }

        .sr-login-link a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 600;
        }

        .sr-login-link a:hover { color: #a855f7; }
      `}</style>

            <div className="sr-root">
                <div className="sr-grid" />
                <div className="sr-card">
                    <div className="sr-logo">CodeifyX</div>

                    {submitted ? (
                        <div className="sr-success-card">
                            <div className="sr-success-icon">📬</div>
                            <div className="sr-success-title">Request Submitted!</div>
                            <p className="sr-success-text">
                                Your request has been sent to the admin team.<br />
                                <strong>Check your email</strong> for a confirmation. You'll be notified once approved.
                            </p>
                            <div className="sr-steps">
                                <div className="sr-step"><span>✉️</span> Confirmation email sent to your inbox</div>
                                <div className="sr-step"><span>⏳</span> Admin will review within 24–48 hours</div>
                                <div className="sr-step"><span>🔓</span> Login link will be emailed on approval</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="sr-title">Become a Problem Setter</h2>
                            <p className="sr-subtitle">Submit your request — admin will review and approve your access.</p>

                            {msg && <div className={`sr-alert ${status}`}>{msg}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="sr-field">
                                    <label className="sr-label">Username</label>
                                    <input
                                        className="sr-input"
                                        placeholder="your_username"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sr-field">
                                    <label className="sr-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="sr-input"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sr-field">
                                    <label className="sr-label">Password</label>
                                    <input
                                        type="password"
                                        className="sr-input"
                                        placeholder="Min 8 characters"
                                        minLength={8}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sr-field">
                                    <label className="sr-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="sr-input"
                                        placeholder="Repeat password"
                                        value={form.confirm}
                                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="sr-btn" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Request →'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="sr-login-link">
                        Already approved? <a href="/admin/login">Login here</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SetterRegister;