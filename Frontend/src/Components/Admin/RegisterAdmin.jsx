// Frontend/src/Components/Admin/RegisterAdmin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { registerAdminAPI } from './adminApi';
import styles from './RegisterAdmin.module.css';

export default function RegisterAdmin() {
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'problem-setter' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { admin } = useAdmin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await registerAdminAPI(form);
            setSuccess(`"${data.username}" (${data.role}) successfully created!`);
            setForm({ username: '', email: '', password: '', role: 'problem-setter' });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <button onClick={() => navigate('/admin/dashboard')} className={styles.backBtn}>
                        ← Back
                    </button>
                    <h2 className={styles.title}>Create New Account</h2>
                    <p className={styles.subtitle}>Add Admin or Problem-Setter</p>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            className={styles.input}
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            className={styles.input}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className={styles.input}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Role</label>
                        <select
                            className={styles.select}
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="problem-setter">Problem Setter</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}