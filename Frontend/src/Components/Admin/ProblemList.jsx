import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblemsAPI, deleteProblemAPI, togglePublishAPI } from './adminApi.js';
import { useAdmin } from './AdminContext.jsx';

/* ── icon helper ───────────────────────────────────────────────────── */
const Icon = ({ d, size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const IC = {
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    publish: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    unpublish: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18',
    delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    add: 'M12 4v16m8-8H4',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
    filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z',
    terminal: 'M8 9l3 3-3 3M13 15h3',
};

/* ── styles ────────────────────────────────────────────────────────── */
const S = {
    root: {
        minHeight: '100vh',
        background: '#050a0f',
        color: '#e2e8f0',
        fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
        position: 'relative',
        padding: '0 0 4rem',
    },
    gridBg: {
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle,rgba(56,189,248,.055) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
    },
    topGlow: {
        position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse,rgba(14,165,233,.09) 0%,transparent 70%)',
    },

    /* top bar */
    topbar: {
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 58,
        borderBottom: '1px solid rgba(56,189,248,.12)',
        background: 'rgba(5,10,15,.9)', backdropFilter: 'blur(12px)',
    },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem' },
    breadHome: { color: '#38bdf8', cursor: 'pointer', fontWeight: 700 },
    breadSep: { color: '#1e3a4f' },
    breadCur: { color: '#64748b' },
    topbarRight: { display: 'flex', alignItems: 'center', gap: '1rem' },

    /* main */
    main: { position: 'relative', zIndex: 1, padding: '2rem 2rem', maxWidth: 1200, margin: '0 auto' },

    /* header row */
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' },
    titleWrap: {},
    titleLabel: {
        fontSize: '.68rem', letterSpacing: '.14em', color: '#38bdf8',
        textTransform: 'uppercase', marginBottom: 4,
    },
    title: { fontSize: '1.3rem', fontWeight: 700, color: '#f0f9ff', letterSpacing: '-.01em' },

    addBtn: {
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'rgba(56,189,248,.1)', color: '#38bdf8',
        border: '1px solid rgba(56,189,248,.3)',
        borderRadius: 8, padding: '7px 16px',
        fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all .2s', fontFamily: 'inherit',
    },

    /* toolbar */
    toolbar: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' },
    searchWrap: {
        display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px',
        background: 'rgba(10,18,30,.8)', border: '1px solid rgba(56,189,248,.1)',
        borderRadius: 8, padding: '7px 12px',
    },
    searchInput: {
        background: 'transparent', border: 'none', outline: 'none',
        color: '#e2e8f0', fontSize: '.8rem', fontFamily: 'inherit', width: '100%',
    },
    filterGroup: { display: 'flex', gap: 6 },
    filterBtn: {
        background: 'rgba(10,18,30,.8)', border: '1px solid rgba(56,189,248,.08)',
        borderRadius: 6, padding: '6px 12px', fontSize: '.75rem',
        color: '#64748b', cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit',
    },

    /* table */
    tableWrap: {
        background: 'rgba(8,14,24,.85)', border: '1px solid rgba(56,189,248,.1)',
        borderRadius: 12, overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '.7rem 1.1rem', textAlign: 'left',
        fontSize: '.68rem', fontWeight: 600, letterSpacing: '.08em',
        color: '#334155', textTransform: 'uppercase',
        borderBottom: '1px solid rgba(56,189,248,.08)',
        background: 'rgba(5,10,15,.6)',
    },
    td: { padding: '.75rem 1.1rem', fontSize: '.82rem', borderBottom: '1px solid rgba(56,189,248,.05)', verticalAlign: 'middle' },
    tdTitle: { fontWeight: 600, color: '#e2e8f0', cursor: 'pointer' },
    tdMuted: { color: '#475569', fontSize: '.78rem' },

    /* badges */
    badge: { display: 'inline-block', padding: '2px 9px', borderRadius: 4, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.04em' },
    badgeEasy: { background: 'rgba(34,197,94,.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,.2)' },
    badgeMedium: { background: 'rgba(250,204,21,.1)', color: '#fbbf24', border: '1px solid rgba(250,204,21,.2)' },
    badgeHard: { background: 'rgba(248,113,113,.1)', color: '#f87171', border: '1px solid rgba(248,113,113,.2)' },
    statusPub: { background: 'rgba(56,189,248,.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.2)' },
    statusDraft: { background: 'rgba(71,85,105,.12)', color: '#64748b', border: '1px solid rgba(71,85,105,.2)' },

    /* action buttons */
    actions: { display: 'flex', gap: 6, alignItems: 'center' },
    actBtn: {
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 6, border: 'none',
        fontSize: '.72rem', fontWeight: 500, cursor: 'pointer',
        transition: 'all .18s', fontFamily: 'inherit',
    },

    /* empty */
    empty: {
        textAlign: 'center', padding: '4rem 2rem',
        color: '#1e3a4f', fontSize: '.82rem',
    },

    /* delete confirm modal */
    overlay: {
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modal: {
        background: '#0a121e', border: '1px solid rgba(248,113,113,.25)',
        borderRadius: 12, padding: '2rem', width: 360, maxWidth: '90vw',
    },
    modalTitle: { fontSize: '1rem', fontWeight: 700, color: '#f0f9ff', marginBottom: 8 },
    modalDesc: { fontSize: '.8rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 },
    modalBtns: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
};

/* ── component ─────────────────────────────────────────────────────── */
export default function ProblemList() {
    const [problems, setProblems] = useState([]);
    const [search, setSearch] = useState('');
    const [diffFilter, setDiffFilter] = useState('All');
    const [deleteId, setDeleteId] = useState(null);
    const [mounted, setMounted] = useState(false);
    const { admin } = useAdmin();
    const navigate = useNavigate();

    /* inject font */
    useEffect(() => {
        const s = document.createElement('style');
        s.textContent = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px #38bdf8}50%{opacity:.5;box-shadow:0 0 3px #38bdf8}}
    .cx-row:hover td{background:rgba(56,189,248,.025)!important}
    .cx-row td{transition:background .15s}`;
        document.head.appendChild(s);
        setTimeout(() => setMounted(true), 40);
        return () => document.head.removeChild(s);
    }, []);

    const fetchProblems = async () => {
        const { data } = await getAllProblemsAPI();
        setProblems(data);
    };
    useEffect(() => { fetchProblems(); }, []);

    const confirmDelete = async () => {
        if (!deleteId) return;
        await deleteProblemAPI(deleteId);
        setDeleteId(null);
        fetchProblems();
    };
    const handleToggle = async (id) => {
        await togglePublishAPI(id);
        fetchProblems();
    };

    /* filter */
    const visible = problems.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
        return matchSearch && matchDiff;
    });

    const DIFFS = ['All', 'Easy', 'Medium', 'Hard'];
    const diffAccent = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };

    return (
        <div style={S.root}>
            <div style={S.gridBg} />
            <div style={S.topGlow} />

            {/* ── topbar ── */}
            <div style={S.topbar}>
                <div style={S.breadcrumb}>
                    <span style={S.breadHome} onClick={() => navigate('/admin')}>CodeifyX</span>
                    <span style={S.breadSep}>/</span>
                    <span style={S.breadCur}>problems</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: '#1e3a4f' }}>
                    <Icon d={IC.terminal} size={13} color="#1e3a4f" />
                    {problems.length} problems loaded
                </div>
            </div>

            {/* ── main ── */}
            <main style={S.main}>
                {/* header */}
                <div style={{ ...S.header, animation: mounted ? 'fadeUp .4s ease both' : 'none' }}>
                    <div style={S.titleWrap}>
                        <div style={S.titleLabel}>Problem bank</div>
                        <div style={S.title}>All Problems</div>
                    </div>
                    <button
                        style={S.addBtn}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,.18)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(56,189,248,.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                        onClick={() => navigate('/admin/problems/new')}
                    >
                        <Icon d={IC.add} size={14} color="#38bdf8" />
                        Add Problem
                    </button>
                </div>

                {/* toolbar */}
                <div style={{ ...S.toolbar, animation: mounted ? 'fadeUp .4s ease .08s both' : 'none' }}>
                    <div style={S.searchWrap}>
                        <Icon d={IC.search} size={14} color="#334155" />
                        <input
                            style={S.searchInput}
                            placeholder="Search problems..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={S.filterGroup}>
                        {DIFFS.map(d => (
                            <button
                                key={d}
                                style={{
                                    ...S.filterBtn,
                                    ...(diffFilter === d ? {
                                        color: d === 'All' ? '#38bdf8' : diffAccent[d],
                                        borderColor: d === 'All' ? 'rgba(56,189,248,.3)' : `${diffAccent[d]}44`,
                                        background: d === 'All' ? 'rgba(56,189,248,.08)' : `${diffAccent[d]}10`,
                                    } : {}),
                                }}
                                onClick={() => setDiffFilter(d)}
                            >{d}</button>
                        ))}
                    </div>
                </div>

                {/* table */}
                <div style={{ ...S.tableWrap, animation: mounted ? 'fadeUp .4s ease .16s both' : 'none' }}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                {['#', 'Title', 'Difficulty', 'Created By', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={S.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visible.length === 0 ? (
                                <tr><td colSpan={6} style={{ ...S.td, ...S.empty }}>
                                    <Icon d={IC.search} size={28} color="#1e3a4f" />
                                    <div style={{ marginTop: 10 }}>No problems found</div>
                                </td></tr>
                            ) : visible.map((p, idx) => (
                                <tr key={p._id} className="cx-row">
                                    <td style={{ ...S.td, color: '#1e3a4f', fontSize: '.72rem', width: 48 }}>{idx + 1}</td>
                                    <td style={{ ...S.td, ...S.tdTitle }}
                                        onClick={() => navigate(`/admin/problems/edit/${p._id}`)}>
                                        {p.title}
                                    </td>
                                    <td style={S.td}>
                                        <span style={{
                                            ...S.badge,
                                            ...(p.difficulty === 'Easy' ? S.badgeEasy : p.difficulty === 'Medium' ? S.badgeMedium : S.badgeHard),
                                        }}>{p.difficulty}</span>
                                    </td>
                                    <td style={{ ...S.td, ...S.tdMuted }}>{p.createdBy?.username ?? '—'}</td>
                                    <td style={S.td}>
                                        <span style={{ ...S.badge, ...(p.isPublished ? S.statusPub : S.statusDraft) }}>
                                            {p.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        <div style={S.actions}>
                                            {/* Edit */}
                                            <button
                                                style={{ ...S.actBtn, background: 'rgba(71,85,105,.2)', color: '#94a3b8' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(71,85,105,.4)'; e.currentTarget.style.color = '#e2e8f0'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(71,85,105,.2)'; e.currentTarget.style.color = '#94a3b8'; }}
                                                onClick={() => navigate(`/admin/problems/edit/${p._id}`)}
                                            >
                                                <Icon d={IC.edit} size={12} color="currentColor" />
                                                Edit
                                            </button>

                                            {admin?.role === 'admin' && (<>
                                                {/* Publish toggle */}
                                                <button
                                                    style={{ ...S.actBtn, background: p.isPublished ? 'rgba(71,85,105,.15)' : 'rgba(56,189,248,.1)', color: p.isPublished ? '#64748b' : '#38bdf8' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = p.isPublished ? 'rgba(71,85,105,.3)' : 'rgba(56,189,248,.2)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = p.isPublished ? 'rgba(71,85,105,.15)' : 'rgba(56,189,248,.1)'; }}
                                                    onClick={() => handleToggle(p._id)}
                                                >
                                                    <Icon d={p.isPublished ? IC.unpublish : IC.publish} size={12} color="currentColor" />
                                                    {p.isPublished ? 'Unpublish' : 'Publish'}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    style={{ ...S.actBtn, background: 'rgba(248,113,113,.08)', color: '#f87171' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,.2)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,.08)'; }}
                                                    onClick={() => setDeleteId(p._id)}
                                                >
                                                    <Icon d={IC.delete} size={12} color="currentColor" />
                                                    Delete
                                                </button>
                                            </>)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* count footer */}
                {visible.length > 0 && (
                    <div style={{ marginTop: '1rem', fontSize: '.72rem', color: '#1e3a4f', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Icon d={IC.terminal} size={12} color="#1e3a4f" />
                        Showing {visible.length} of {problems.length} problems
                    </div>
                )}
            </main>

            {/* ── delete confirm modal ── */}
            {deleteId && (
                <div style={S.overlay} onClick={() => setDeleteId(null)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon d={IC.delete} size={16} color="#f87171" />
                            </div>
                            <div style={S.modalTitle}>Delete Problem?</div>
                        </div>
                        <div style={S.modalDesc}>
                            This action cannot be undone. The problem and all its test cases will be permanently removed.
                        </div>
                        <div style={S.modalBtns}>
                            <button
                                style={{ ...S.actBtn, background: 'rgba(71,85,105,.2)', color: '#94a3b8', padding: '7px 16px', fontSize: '.8rem' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(71,85,105,.4)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(71,85,105,.2)'}
                                onClick={() => setDeleteId(null)}
                            >Cancel</button>
                            <button
                                style={{ ...S.actBtn, background: 'rgba(248,113,113,.15)', color: '#f87171', border: '1px solid rgba(248,113,113,.25)', padding: '7px 16px', fontSize: '.8rem' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,.3)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,.15)'}
                                onClick={confirmDelete}
                            >
                                <Icon d={IC.delete} size={13} color="#f87171" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}