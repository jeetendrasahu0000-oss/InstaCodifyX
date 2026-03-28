import React, { useState, useContext, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext'
import api from '../../utils/api'
import style from './Header.module.css'

const NAV_LINKS = [
  { label: 'Explore', to: '/explore' },
  { label: 'Problems', to: '/problems' },
  { label: 'Contests', to: '/contests', badge: 'Hot' },
  { label: 'Discuss', to: '/discuss' },
  { label: 'Interview & Preparation', to: '/interview-preparation' },
  { label: 'Store', to: '/store' },
]

const LOGO = '../../../public/codifyxPngOrignal.png'

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

const AVATAR_COLORS = [
  ['#00d084', '#007a4d'],
  ['#6366f1', '#4338ca'],
  ['#f59e0b', '#b45309'],
  ['#ec4899', '#be185d'],
  ['#3b82f6', '#1d4ed8'],
  ['#8b5cf6', '#6d28d9'],
]
const getAvatarColors = (name = '') => {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 28, fontSize = 11, borderRadius = 7 }) {
  const colors = getAvatarColors(user?.fullname || user?.username || '')
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullname || user.username}
        style={{
          width: size, height: size, borderRadius,
          objectFit: 'cover',
          border: '1.5px solid rgba(255,255,255,0.12)',
          flexShrink: 0, display: 'block',
        }}
      />
    )
  }
  return (
    <span style={{
      width: size, height: size, borderRadius,
      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, color: '#fff',
      letterSpacing: '0.5px', flexShrink: 0,
    }}>
      {getInitials(user?.fullname || user?.username)}
    </span>
  )
}

// ── Stat Badge ─────────────────────────────────────────────────────────────────
function StatBadge({ label, value, color }) {
  return (
    <div className={style.statBadge}>
      <span style={{ color: color || '#e6edf3' }} className={style.statValue}>{value}</span>
      <span className={style.statLabel}>{label}</span>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className={style.skeletonRow}>
      <div className={style.skeletonAvatar} />
      <div className={style.skeletonLines}>
        <div className={style.skeletonLine} style={{ width: '60%' }} />
        <div className={style.skeletonLine} style={{ width: '40%' }} />
      </div>
    </div>
  )
}

// ── Main Header ────────────────────────────────────────────────────────────────
export default function Header() {
  const { isLoggedIn, user, logout, updateUser } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const dropRef = useRef(null)
  const mobileDropRef = useRef(null)
  const searchInputRef = useRef(null)
  const fetchedRef = useRef(false)

  const isActive = (to) => location.pathname.startsWith(to)

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (mobileDropRef.current && !mobileDropRef.current.contains(e.target)) setMobileProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Auto-focus mobile search input
  useEffect(() => {
    if (mobileSearch) setTimeout(() => searchInputRef.current?.focus(), 80)
  }, [mobileSearch])

  // Close all on route change
  useEffect(() => {
    setDropOpen(false)
    setMenuOpen(false)
    setMobileSearch(false)
    setMobileProfileOpen(false)
  }, [location.pathname])

  // Fetch profile from backend
  const fetchProfile = useCallback(async () => {
    if (fetchedRef.current || !isLoggedIn) return
    fetchedRef.current = true
    setFetchLoading(true)
    setFetchError(null)
    try {
      const res = await api.get('/auth/me')
      const data = res.data?.user || res.data
      setProfileData(data)
      updateUser(data)
    } catch (err) {
      console.error('Profile fetch error:', err)
      setFetchError('Could not load profile')
      fetchedRef.current = false
    } finally {
      setFetchLoading(false)
    }
  }, [isLoggedIn, updateUser])

  const handleDropToggle = () => {
    setDropOpen(o => { if (!o) fetchProfile(); return !o })
  }

  const handleMobileProfileToggle = () => {
    setMobileProfileOpen(o => { if (!o) fetchProfile(); return !o })
    setMenuOpen(false)
    setMobileSearch(false)
  }

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    setMenuOpen(false)
    setMobileProfileOpen(false)
    fetchedRef.current = false
    setProfileData(null)
    navigate('/login', { replace: true })
  }

  const closeAll = () => { setDropOpen(false); setMobileProfileOpen(false) }

  const merged = { ...user, ...(profileData || {}) }
  const displayName = merged?.fullname?.split(' ')[0] || merged?.username || 'User'
  const joinDate = merged?.createdAt
    ? new Date(merged.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  // ── Shared dropdown content ────────────────────────────────────────────────
  const DropdownContent = () => (
    <>
      {fetchLoading ? (
        <div className={style.dropLoadingWrap}>
          <SkeletonRow />
          <div className={style.skeletonStats}>
            {[1, 2, 3].map(i => <div key={i} className={style.skeletonStat} />)}
          </div>
        </div>
      ) : fetchError ? (
        <div className={style.dropError}>
          <svg width="16" height="16" fill="none" stroke="#f85149" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{fetchError}</span>
          <button className={style.retryBtn} onClick={() => { fetchedRef.current = false; fetchProfile() }}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className={style.dropProfile}>
            <div className={style.dropAvatarWrap}>
              <Avatar user={merged} size={48} fontSize={17} borderRadius={13} />
              {merged.isVerified && (
                <span className={style.verifiedDot} title="Verified">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
            <div className={style.dropInfo}>
              <p className={style.dropName}>{merged.fullname || merged.username}</p>
              <p className={style.dropUsername}>@{merged.username}</p>
              <p className={style.dropEmail}>{merged.email}</p>
            </div>
          </div>

          <div className={style.dropStats}>
            <StatBadge label="Solved" value={merged.solved ?? 0} color="#00d084" />
            <div className={style.statDivider} />
            <StatBadge label="Streak" value={`${merged.streak ?? 0}🔥`} color="#f97316" />
            <div className={style.statDivider} />
            <StatBadge label="Rank" value={merged.rank ?? '—'} color="#6366f1" />
          </div>

          <div className={style.dropMeta}>
            {joinDate && (
              <span className={style.dropMetaItem}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Joined {joinDate}
              </span>
            )}
            {merged.role && <span className={style.roleBadge}>{merged.role}</span>}
          </div>
        </>
      )}

      <div className={style.dropDivider} />

      <Link to={`/profile/${merged.username}`} className={style.dropItem} onClick={closeAll}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        My Profile
      </Link>

      <Link to="/submissions" className={style.dropItem} onClick={closeAll}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
        My Submissions
      </Link>

      <Link to="/bookmarks" className={style.dropItem} onClick={closeAll}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        Bookmarks
      </Link>

      <Link to="/settings" className={style.dropItem} onClick={closeAll}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </Link>

      <div className={style.dropDivider} />

      <button className={`${style.dropItem} ${style.dropLogout}`} onClick={handleLogout}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </>
  )

  return (
    <>
      <header className={style.container}>
        <div className={style.inner}>

          {/* Logo */}
          <Link to="/" className={style.logo}>
            <img src={LOGO} alt="CodifyX" className={style.logoImg} />
            
          </Link>

          {/* Desktop nav */}
          <nav className={style.nav}>
            {NAV_LINKS.map(({ label, to, badge }) => (
              <Link key={to} to={to} className={`${style.navLink} ${isActive(to) ? style.active : ''}`}>
                {label}
                {badge && <span className={style.navBadge}>{badge}</span>}
              </Link>
            ))}
          </nav>

          <div className={style.spacer} />

          {/* Desktop Search */}
          <div className={style.searchWrap}>
            <svg className={style.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className={style.searchInput}
              placeholder="Search problems…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search"
            />
            <span className={style.searchKbd}>⌘K</span>
          </div>

          {/* Desktop Auth */}
          {isLoggedIn && user ? (
            <div className={style.userArea} ref={dropRef}>
              <button className={style.avatarBtn} onClick={handleDropToggle}>
                <Avatar user={merged} size={28} fontSize={11} borderRadius={7} />
                <span className={style.userName}>{displayName}</span>
                <svg
                  className={`${style.chevron} ${dropOpen ? style.chevronUp : ''}`}
                  width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropOpen && (
                <div className={style.dropdown}>
                  <DropdownContent />
                </div>
              )}
            </div>
          ) : (
            <div className={style.authGroup}>
              <Link to="/login" className={style.btnLogin}>Log in</Link>
              <Link to="/signup" className={style.btnSignup}>Sign up</Link>
            </div>
          )}

          {/* ── Mobile Right Actions ── */}
          <div className={style.mobileActions}>

            {/* Mobile Search toggle */}
            <button
              className={`${style.mobileActionBtn} ${mobileSearch ? style.mobileActionActive : ''}`}
              onClick={() => { setMobileSearch(o => !o); setMenuOpen(false); setMobileProfileOpen(false) }}
              aria-label="Toggle search"
            >
              {mobileSearch ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </button>

            {/* Mobile Avatar button (logged in) */}
            {isLoggedIn && user && (
              <div className={style.mobileAvatarArea} ref={mobileDropRef}>
                <button
                  className={style.mobileAvatarBtn}
                  onClick={handleMobileProfileToggle}
                  aria-label="Profile"
                >
                  <div className={style.mobileAvatarRing}>
                    <Avatar user={merged} size={28} fontSize={10} borderRadius={8} />
                  </div>
                  {merged.isVerified && <span className={style.mobileVerifiedDot} />}
                </button>

                {/* Mobile Profile Dropdown */}
                {mobileProfileOpen && (
                  <div className={style.mobileProfileDrop}>
                    <DropdownContent />
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button
              className={`${style.hamburger} ${menuOpen ? style.hamburgerOpen : ''}`}
              onClick={() => { setMenuOpen(o => !o); setMobileSearch(false); setMobileProfileOpen(false) }}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── Mobile Search Slide-down ── */}
        <div className={`${style.mobileSearchBar} ${mobileSearch ? style.mobileSearchOpen : ''}`}>
          <div className={style.mobileSearchInner}>
            <svg className={style.mobileSearchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              className={style.mobileSearchInput}
              placeholder="Search problems, contests…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className={style.mobileSearchClear} onClick={() => setQuery('')} aria-label="Clear">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile Nav Menu ── */}
        <nav className={`${style.mobileMenu} ${menuOpen ? style.open : ''}`}>
          {NAV_LINKS.map(({ label, to, badge }) => (
            <Link
              key={to} to={to}
              className={`${style.mobileLink} ${isActive(to) ? style.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {badge && <span className={style.navBadge}>{badge}</span>}
            </Link>
          ))}

          {!isLoggedIn && (
            <div className={style.mobileAuth}>
              <Link to="/login" className={style.btnLogin} onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className={style.btnSignup} onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </nav>
      </header>
    </>
  )
}