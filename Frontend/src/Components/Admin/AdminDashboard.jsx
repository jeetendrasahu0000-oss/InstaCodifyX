// AdminDashboard.jsx
// Drop-in replacement — uses inline styles so no .module.css needed.
// Keep your existing imports for useAdmin / useNavigate.

import { useAdmin } from '../../Components/Admin/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/* ─── tiny icon helpers (no external deps) ─────────────────────────── */
const Icon = ({ d, size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const ICONS = {
    problems: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    setters: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    requests: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    create: 'M12 5v14M5 12h14',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    terminal: 'M8 9l3 3-3 3M13 15h3',
};

/* ─── animated counter ──────────────────────────────────────────────── */
function Counter({ to, duration = 1200 }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = null;
        const step = ts => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setVal(Math.floor(p * to));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [to, duration]);
    return <span>{val.toLocaleString()}</span>;
}

/* ─── styles object ─────────────────────────────────────────────────── */
const S = {
    root: {
        minHeight: '100vh',
        background: '#050a0f',
        color: '#e2e8f0',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        position: 'relative',
        overflow: 'hidden',
    },
    /* grid dot background */
    gridBg: {
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage:
            'radial-gradient(circle, rgba(56,189,248,0.07) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
    },
    /* top glow */
    topGlow: {
        position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 400, borderRadius: '50%', zIndex: 0,
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
    },

    /* ── navbar ── */
    nav: {
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 60,
        borderBottom: '1px solid rgba(56,189,248,0.12)',
        background: 'rgba(5,10,15,0.85)',
        backdropFilter: 'blur(12px)',
    },
    logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
    logoDot: {
        width: 8, height: 8, borderRadius: '50%',
        background: '#38bdf8',
        boxShadow: '0 0 8px #38bdf8',
        animation: 'pulse 2s infinite',
    },
    logoText: {
        fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.08em',
        color: '#f0f9ff',
    },
    logoAccent: { color: '#38bdf8' },
    navRight: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
    userChip: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(56,189,248,0.06)',
        border: '1px solid rgba(56,189,248,0.15)',
        borderRadius: 6, padding: '4px 12px',
        fontSize: '0.78rem', color: '#94a3b8',
    },
    roleAdmin: { color: '#f87171', fontWeight: 700 },
    roleSetter: { color: '#4ade80', fontWeight: 700 },
    logoutBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'transparent', color: '#64748b',
        border: '1px solid rgba(100,116,139,0.25)',
        borderRadius: 6, padding: '5px 12px',
        fontSize: '0.78rem', cursor: 'pointer',
        transition: 'all 0.2s', fontFamily: 'inherit',
    },

    /* ── main ── */
    main: { position: 'relative', zIndex: 1, padding: '2.5rem 2rem', maxWidth: 1100, margin: '0 auto' },

    /* ── section header ── */
    sectionHeader: { marginBottom: '1.5rem' },
    sectionLabel: {
        fontSize: '0.7rem', letterSpacing: '0.15em', color: '#38bdf8',
        textTransform: 'uppercase', marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 8,
    },
    sectionLabelLine: {
        flex: 1, height: 1,
        background: 'linear-gradient(90deg, rgba(56,189,248,0.3), transparent)',
    },
    sectionTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#f0f9ff', letterSpacing: '-0.01em' },

    /* ── stats row ── */
    statsRow: { display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' },
    stat: {
        flex: '1 1 160px',
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(56,189,248,0.1)',
        borderRadius: 10, padding: '1rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: 4,
    },
    statNum: { fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1 },
    statLabel: { fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.05em' },
    statDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 6 },

    /* ── card grid ── */
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem',
    },
    card: {
        background: 'rgba(10,18,30,0.8)',
        border: '1px solid rgba(56,189,248,0.1)',
        borderRadius: 12, padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
    },
    cardGlow: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)',
        opacity: 0, transition: 'opacity 0.22s',
    },
    cardIcon: {
        width: 40, height: 40, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(56,189,248,0.08)',
        border: '1px solid rgba(56,189,248,0.12)',
        color: '#38bdf8',
    },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#f0f9ff', marginBottom: 4 },
    cardDesc: { fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 },
    cardArrow: { color: '#38bdf8', opacity: 0.4, alignSelf: 'flex-end', transition: 'all 0.2s' },
};

/* ─── card data ─────────────────────────────────────────────────────── */
const ALL_CARDS = [
    {
        key: 'problems', route: '/admin/problems', roles: ['admin', 'setter'],
        icon: ICONS.problems, title: 'Problems',
        desc: 'Add, edit, delete competitive programming problems',
        accent: '#38bdf8',
    },
    {
        key: 'setters', route: '/admin/users', roles: ['admin'],
        icon: ICONS.setters, title: 'Manage Setters',
        desc: 'Add or remove problem setters from the platform',
        accent: '#a78bfa',
    },
    {
        key: 'requests', route: '/admin/setter-requests', roles: ['admin'],
        icon: ICONS.requests, title: 'Setter Requests',
        desc: 'Review & approve problem setter applications',
        accent: '#34d399',
    },
    {
        key: 'create', route: '/admin/register', roles: ['admin'],
        icon: ICONS.create, title: 'Create Account',
        desc: 'Add new admin or problem setter to the system',
        accent: '#fb923c',
    },
];

const STATS = [
    { num: 347, label: 'TOTAL PROBLEMS' },
    { num: 12, label: 'ACTIVE SETTERS' },
    { num: 4, label: 'PENDING REQUESTS' },
    { num: 18920, label: 'REGISTERED USERS' },
];

/* ─── component ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
    const { admin, logout } = useAdmin();
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // inject keyframes + font
        const style = document.createElement('style');
        style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
      @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #38bdf8} 50%{opacity:0.5;box-shadow:0 0 3px #38bdf8} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      .cxcard { animation: fadeUp 0.4s ease both; }
    `;
        document.head.appendChild(style);
        setTimeout(() => setMounted(true), 50);
        return () => document.head.removeChild(style);
    }, []);

    const visibleCards = ALL_CARDS.filter(c => c.roles.includes(admin?.role));

    return (
        <div style={S.root}>
            {/* backgrounds */}
            <div style={S.gridBg} />
            <div style={S.topGlow} />

            {/* ── navbar ── */}
            <nav style={S.nav}>
                <div style={S.logoWrap}>
                    <div style={S.logoDot} />
                    <span style={S.logoText}>
                        Codeify<span style={S.logoAccent}>X</span>
                        <span style={{ color: '#475569', fontWeight: 400 }}> /admin</span>
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: '0.75rem' }}>
                    <Icon d={ICONS.terminal} size={14} color="#334155" />
                    <span>v2.1.0</span>
                </div>

                <div style={S.navRight}>
                    <div style={S.userChip}>
                        <span style={{ color: '#e2e8f0' }}>{admin?.username ?? 'admin'}</span>
                        <span style={{ color: '#334155' }}>·</span>
                        <span style={admin?.role === 'admin' ? S.roleAdmin : S.roleSetter}>
                            {admin?.role ?? 'role'}
                        </span>
                    </div>
                    <button
                        style={S.logoutBtn}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.25)'; }}
                        onClick={() => { logout(); navigate('/admin/login'); }}
                    >
                        <Icon d={ICONS.logout} size={13} color="currentColor" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── main ── */}
            <main style={S.main}>

                {/* stats */}
                {mounted && (
                    <div style={{ ...S.statsRow, animation: 'fadeUp 0.4s ease both' }}>
                        {STATS.map((s, i) => (
                            <div key={i} style={{ ...S.stat, animationDelay: `${i * 60}ms` }}>
                                <div style={S.statNum}><Counter to={s.num} /></div>
                                <div style={S.statLabel}>{s.label}</div>
                                <div style={S.statDot} />
                            </div>
                        ))}
                    </div>
                )}

                {/* section header */}
                <div style={S.sectionHeader}>
                    <div style={S.sectionLabel}>
                        <span>Dashboard</span>
                        <div style={S.sectionLabelLine} />
                    </div>
                    <div style={S.sectionTitle}>Control Panel</div>
                </div>

                {/* cards */}
                <div style={S.grid}>
                    {visibleCards.map((card, i) => (
                        <div
                            key={card.key}
                            className="cxcard"
                            style={{ ...S.card, animationDelay: `${i * 80 + 200}ms` }}
                            onClick={() => navigate(card.route)}
                            onMouseEnter={e => {
                                setHovered(card.key);
                                e.currentTarget.style.border = `1px solid ${card.accent}44`;
                                e.currentTarget.style.background = 'rgba(14,26,46,0.95)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 8px 32px ${card.accent}18`;
                                e.currentTarget.querySelector('.cx-glow').style.opacity = '1';
                                e.currentTarget.querySelector('.cx-arrow').style.opacity = '1';
                                e.currentTarget.querySelector('.cx-arrow').style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={e => {
                                setHovered(null);
                                e.currentTarget.style.border = '1px solid rgba(56,189,248,0.1)';
                                e.currentTarget.style.background = 'rgba(10,18,30,0.8)';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.querySelector('.cx-glow').style.opacity = '0';
                                e.currentTarget.querySelector('.cx-arrow').style.opacity = '0.4';
                                e.currentTarget.querySelector('.cx-arrow').style.transform = 'none';
                            }}
                        >
                            {/* top shimmer */}
                            <div className="cx-glow" style={{ ...S.cardGlow, background: `linear-gradient(90deg, transparent, ${card.accent}44, transparent)` }} />

                            {/* icon */}
                            <div style={{ ...S.cardIcon, background: `${card.accent}10`, borderColor: `${card.accent}20`, color: card.accent }}>
                                <Icon d={card.icon} size={18} color={card.accent} />
                            </div>

                            {/* body */}
                            <div style={S.cardBody}>
                                <div style={S.cardTitle}>{card.title}</div>
                                <div style={S.cardDesc}>{card.desc}</div>
                            </div>

                            {/* arrow */}
                            <div className="cx-arrow" style={S.cardArrow}>
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={card.accent}
                                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* footer prompt */}
                <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: 10, color: '#1e3a4f', fontSize: '0.72rem' }}>
                    <Icon d={ICONS.terminal} size={13} color="#1e3a4f" />
                    <span>CodeifyX Admin Console — Logged in as <span style={{ color: '#334155' }}>{admin?.username}</span></span>
                </div>
            </main>
        </div>
    );
}