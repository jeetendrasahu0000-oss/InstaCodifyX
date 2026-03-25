// Frontend/src/Pages/Problems/ProblemsSolve.jsx
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './ProblemsSolve.module.css';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';

export default function ProblemsSolve() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/problems/public')
            .then(({ data }) => { setProblems(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = problems.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchDiff = difficulty === 'All' || p.difficulty === difficulty;
        return matchSearch && matchDiff;
    });

    const diffColors = {
        Easy: { label: styles.badgeEasy, active: styles.activeEasy },
        Medium: { label: styles.badgeMedium, active: styles.activeMedium },
        Hard: { label: styles.badgeHard, active: styles.activeHard },
    };

    return (
        <>
            <Header />
            <div className={styles.page}>

                {/* Hero Banner */}
                <div className={styles.hero}>
                    <div className={styles.heroInner}>
                        <span className={styles.heroBadge}>🧩 Coding Challenges</span>
                        <h1 className={styles.heroTitle}>Practice Problems</h1>
                        <p className={styles.heroSub}>
                            Sharpen your skills with hand-picked problems across all difficulty levels.
                        </p>
                        {/* Stats Row */}
                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatNum}>{problems.length}</span>
                                <span className={styles.heroStatLabel}>Total</span>
                            </div>
                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <span className={`${styles.heroStatNum} ${styles.colorEasy}`}>
                                    {problems.filter(p => p.difficulty === 'Easy').length}
                                </span>
                                <span className={styles.heroStatLabel}>Easy</span>
                            </div>
                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <span className={`${styles.heroStatNum} ${styles.colorMedium}`}>
                                    {problems.filter(p => p.difficulty === 'Medium').length}
                                </span>
                                <span className={styles.heroStatLabel}>Medium</span>
                            </div>
                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <span className={`${styles.heroStatNum} ${styles.colorHard}`}>
                                    {problems.filter(p => p.difficulty === 'Hard').length}
                                </span>
                                <span className={styles.heroStatLabel}>Hard</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={styles.main}>

                    {/* Filters */}
                    <div className={styles.filterBar}>
                        <div className={styles.searchWrap}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by title or tag..."
                                className={styles.searchInput}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className={styles.diffBtns}>
                            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`${styles.diffBtn} ${difficulty === d
                                        ? (d === 'All' ? styles.activeAll : diffColors[d]?.active)
                                        : ''}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <p className={styles.resultCount}>
                        Showing <strong>{filtered.length}</strong> of <strong>{problems.length}</strong> problems
                    </p>

                    {/* Table */}
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Loading problems...</p>
                        </div>
                    ) : (
                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Difficulty</th>
                                        <th>Tags</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className={styles.noData}>
                                                <div className={styles.emptyState}>
                                                    <span className={styles.emptyIcon}>🔎</span>
                                                    <p>No problems found</p>
                                                    <span>Try a different search or filter</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((p, i) => (
                                            <tr key={p._id} className={styles.row}>
                                                <td className={styles.index}>{i + 1}</td>
                                                <td className={styles.titleCell}>
                                                    <span
                                                        className={styles.problemTitle}
                                                        onClick={() => navigate(`/problems/${p._id}`)}
                                                    >
                                                        {p.title}
                                                    </span>
                                                    <span
                                                        className={styles.learnMore}
                                                        onClick={() => navigate(`/problems/${p._id}`)}
                                                    >
                                                        Learn more →
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={
                                                        p.difficulty === 'Easy' ? styles.badgeEasy :
                                                            p.difficulty === 'Medium' ? styles.badgeMedium :
                                                                styles.badgeHard
                                                    }>
                                                        {p.difficulty}
                                                    </span>
                                                </td>
                                                <td className={styles.tagsCell}>
                                                    {p.tags?.slice(0, 3).map(tag => (
                                                        <span key={tag} className={styles.tag}>{tag}</span>
                                                    ))}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/problems/${p._id}`)}
                                                        className={styles.solveBtn}
                                                    >
                                                        Solve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}