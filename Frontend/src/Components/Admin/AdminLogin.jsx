import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../Components/Admin/AdminContext';
import { loginAdminAPI } from '../../Components/Admin/adminApi';
import {
    FaEnvelope,
    FaLock,
    FaSignInAlt,
    FaUserShield,
    FaCode,
    FaGithub,
    FaTwitter,
    FaLinkedin
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { AiOutlineLoading } from 'react-icons/ai';
import { BiCodeAlt } from 'react-icons/bi';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAdmin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!form.email || !form.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const { data } = await loginAdminAPI(form);
            login(data);
            navigate(data.role === 'admin' ? '/admin/dashboard' : '/setter/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
        setLoading(false);
    };

    const handleSocialLogin = (platform) => {
        // Implement social login logic here
        console.log(`Login with ${platform}`);
        alert(`${platform} login coming soon!`);
    };

    return (
        <div className={styles.container}>
            {/* Animated Background */}
            <div className={styles.background}>
                <div className={styles.gradientOrb1}></div>
                <div className={styles.gradientOrb2}></div>
                <div className={styles.gradientOrb3}></div>
            </div>

            {/* Login Card */}
            <div className={styles.card}>
                {/* Logo Section */}
                <div className={styles.logoSection}>
                    <img
                        src="https://i.pinimg.com/1200x/17/43/c7/1743c7e316bba74fd234568fe0c91acb.jpg"
                        alt="CodeifyX Logo"
                        className={styles.logo}
                    />
                    <div className={styles.logoText}>
                        <h1 className={styles.title}>CodeifyX</h1>
                        <p className={styles.tagline}>Where Code Meets Creativity</p>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className={styles.welcomeSection}>
                    <MdAdminPanelSettings className={styles.welcomeIcon} />
                    <h2 className={styles.welcomeTitle}>Welcome Back!</h2>
                    <p className={styles.welcomeSubtitle}>
                        Sign in to your account to manage problems and submissions
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={styles.errorMessage}>
                        <FaExclamationCircle className={styles.errorIcon} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <FaEnvelope className={styles.inputIcon} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className={styles.input}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <FaLock className={styles.inputIcon} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={styles.input}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <div className={styles.formOptions}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" /> Remember me
                        </label>

                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <AiOutlineLoading className={styles.spinner} />
                                Logging in...
                            </>
                        ) : (
                            <>
                                <FaSignInAlt className={styles.buttonIcon} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>



                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.roleBadge}>
                        <FaUserShield className={styles.roleIcon} />
                        <span>Admin & Problem Setter Access</span>
                    </div>
                    <p className={styles.copyright}>
                        © 2024 CodeifyX. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add missing imports
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';