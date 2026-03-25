import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Banner.module.css'

const banners = [
  {
    id: 1,
    tag: 'Platform',
    tagSub: 'Start for free',
    headlineStatic: 'Land Your Dream Job With ',
    typewriterWords: ['Smart Practice', 'AI Feedback', 'Mock Interviews', 'Real Problems'],
    sub: 'Practice 500+ DSA problems, crack coding rounds, and get placed at top product companies.',
    btn1: { label: 'Start Practicing', route: '/problems' },
    btn2: { label: 'Explore Problems', route: '/explore' },
    accent: '#2563eb',
    tagBg: '#eff6ff',
    tagColor: '#1d4ed8',
    video: {
      colors: ['#1e3a5f', '#0f172a'],
      codeLines: ['function twoSum(nums, target) {', '  const map = new Map()', '  for (let i = 0; i < nums.length; i++) {', '    const comp = target - nums[i]', '    if (map.has(comp)) return [map.get(comp), i]', '    map.set(nums[i], i)', '  }', '}'],
      title: 'Two Sum — LeetCode Easy',
      desc: '48 min · DSA Practice',
      avatarBg: '#2563eb', avatarText: 'DS',
      badgeBg: '#16a34a', badgeText: 'Solved', duration: '48:12',
    },
    float: { icon: '🏆', val: '50K+', lbl: 'Problems Solved', iconBg: '#fef9c3' },
  },
  {
    id: 2,
    tag: 'HR Prep',
    tagSub: 'Behavioral rounds',
    headlineStatic: 'Master Every ',
    typewriterWords: ['HR Interview', 'Behavioral Round', 'Soft Skill Test', 'STAR Question'],
    sub: 'AI-powered mock HR sessions with instant feedback. Walk into interviews with full confidence.',
    btn1: { label: 'Prepare for HR', route: '/interview-preparation/hr-prep' },
    btn2: { label: 'Schedule Mock', route: '/interview-preparation/schedule-mock' },
    accent: '#0d9488',
    tagBg: '#f0fdfa', tagColor: '#0f766e',
    video: {
      colors: ['#022c22', '#064e3b'],
      codeLines: ['Q: Tell me about a time you', '   failed and what you learned.', '', '✦ Use STAR method:', '  → Situation', '  → Task', '  → Action', '  → Result'],
      title: 'HR Mock Session — STAR Method',
      desc: '32 min · Behavioral Prep',
      avatarBg: '#0d9488', avatarText: 'HR',
      badgeBg: '#dc2626', badgeText: 'Live', duration: '32:05',
    },
    float: { icon: '🎯', val: '94%', lbl: 'Success Rate', iconBg: '#f0fdfa' },
  },
  {
    id: 3,
    tag: 'Contests',
    tagSub: 'Weekly rankings',
    headlineStatic: 'Compete, Rank & ',
    typewriterWords: ['Dominate Globally', 'Win Prizes', 'Beat the Clock', 'Rise the Board'],
    sub: 'Join live coding contests every week. Climb the global leaderboard and win exciting rewards.',
    btn1: { label: 'Join Contest', route: '/contests' },
    btn2: { label: 'View Leaderboard', route: '/contests' },
    accent: '#d97706',
    tagBg: '#fffbeb', tagColor: '#b45309',
    video: {
      colors: ['#3d2000', '#1c1008'],
      codeLines: ['🏆  Weekly Contest #184', '─────────────────────────', '1.  @arjun_codes    2840 pts', '2.  @dev_ninja      2790 pts', '3.  @you            2650 pts ←', '4.  @codemaster     2580 pts', '5.  @priya_dev      2540 pts'],
      title: 'Weekly Contest — Live',
      desc: '1h 30m · 4 Problems',
      avatarBg: '#d97706', avatarText: '#1',
      badgeBg: '#dc2626', badgeText: 'Live', duration: '01:30',
    },
    float: { icon: '⚡', val: '12K+', lbl: 'Participants', iconBg: '#fffbeb' },
  },
  {
    id: 4,
    tag: 'Machine Test',
    tagSub: 'Company simulations',
    headlineStatic: 'Simulate Real ',
    typewriterWords: ['Machine Tests', 'Company Rounds', 'Full-Stack Tasks', 'Timed Challenges'],
    sub: 'Practice actual machine coding tests used by FAANG and top Indian product companies.',
    btn1: { label: 'Take Machine Test', route: '/interview-preparation/machine-test' },
    btn2: { label: 'Live Sessions', route: '/interview-preparation/live-sessions' },
    accent: '#7c3aed',
    tagBg: '#f5f3ff', tagColor: '#6d28d9',
    video: {
      colors: ['#2e1065', '#0d0520'],
      codeLines: ["// Build a REST API endpoint", "app.get('/users/:id', async (req, res) => {", "  const user = await User.findById(req.params.id)", "  if (!user) return res.status(404).json({", "    error: 'User not found'", "  })", "  res.json(user)", "})"],
      title: 'Full-Stack Machine Test',
      desc: '3h 00m · Node.js + React',
      avatarBg: '#7c3aed', avatarText: 'MT',
      badgeBg: '#7c3aed', badgeText: 'Timed', duration: '03:00',
    },
    float: { icon: '🚀', val: '200+', lbl: 'Companies', iconBg: '#f5f3ff' },
  },
  {
    id: 5,
    tag: 'Community',
    tagSub: '50K+ developers',
    headlineStatic: 'Learn Faster ',
    typewriterWords: ['Together', 'With Peers', 'From Experts', 'Every Day'],
    sub: 'Ask questions, share solutions, and build your network with thousands of developers worldwide.',
    btn1: { label: 'Join Discussion', route: '/discuss' },
    btn2: { label: 'Browse Topics', route: '/discuss' },
    accent: '#db2777',
    tagBg: '#fdf2f8', tagColor: '#be185d',
    video: {
      colors: ['#500724', '#1a0510'],
      codeLines: ['💬  How do I solve this DP problem?', '   → Use memoization here', '   → Check this solution ↗', '', '🔥  Trending: System Design', '   → Explain CAP theorem', '   → 24 replies · 3 hrs ago'],
      title: 'Discussion — DP Problems',
      desc: 'Community · 240 replies',
      avatarBg: '#db2777', avatarText: 'CF',
      badgeBg: '#db2777', badgeText: 'Trending', duration: '',
    },
    float: { icon: '💬', val: '50K+', lbl: 'Members', iconBg: '#fdf2f8' },
  },
]

/* ── Typewriter Hook ── */
function useTypewriter(words, active) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [typing, setTyping] = useState(true)
  const timer = useRef(null)

  useEffect(() => {
    setDisplay('')
    setWordIdx(0)
    setTyping(true)
  }, [active])

  useEffect(() => {
    const word = words[wordIdx % words.length]
    const tick = () => {
      if (typing) {
        setDisplay(prev => {
          if (prev.length < word.length) {
            timer.current = setTimeout(tick, 60)
            return word.slice(0, prev.length + 1)
          }
          timer.current = setTimeout(() => setTyping(false), 1400)
          return prev
        })
      } else {
        setDisplay(prev => {
          if (prev.length > 0) {
            timer.current = setTimeout(tick, 35)
            return prev.slice(0, -1)
          }
          setWordIdx(i => i + 1)
          setTyping(true)
          return ''
        })
      }
    }
    timer.current = setTimeout(tick, typing ? 120 : 600)
    return () => clearTimeout(timer.current)
  }, [wordIdx, typing, words])

  return display
}

/* ── Video Mockup ── */
const VideoMockup = ({ video, accent }) => (
  <div className={styles.videoCard}>
    <div className={styles.videoInner}>
      <div className={styles.videoThumb}>
        <svg className={styles.videoBg} viewBox="0 0 420 236" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id={`g-${video.avatarText}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={video.colors[0]} />
              <stop offset="100%" stopColor={video.colors[1]} />
            </linearGradient>
          </defs>
          <rect width="420" height="236" fill={`url(#g-${video.avatarText})`} />
          {video.codeLines.map((line, i) => (
            <text key={i} x="20" y={28 + i * 26}
              fill={i === 0 ? '#e2e8f0' : 'rgba(226,232,240,0.5)'}
              fontSize="10.5" fontFamily="'Courier New', monospace"
              fontWeight={i === 0 ? '600' : '400'}>
              {line}
            </text>
          ))}
        </svg>
        <div className={styles.videoOverlay} />
        <button className={styles.playBtn}>
          <div className={styles.playTriangle} />
        </button>
        {video.duration && <span className={styles.videoDuration}>{video.duration}</span>}
      </div>
      <div className={styles.videoMeta}>
        <div className={styles.videoAvatar} style={{ background: video.avatarBg }}>
          {video.avatarText}
        </div>
        <div className={styles.videoMetaText}>
          <div className={styles.videoTitle}>{video.title}</div>
          <div className={styles.videoDesc}>{video.desc}</div>
        </div>
        <span className={styles.liveBadge} style={{ background: video.badgeBg }}>
          {video.badgeText}
        </span>
      </div>
    </div>
  </div>
)

/* ── Main Banner ── */
const Banner = () => {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const intervalRef = useRef(null)
  const typed = useTypewriter(banners[active].typewriterWords, active)

  const startAuto = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % banners.length)
    }, 6000)
  }, [])

  useEffect(() => {
    startAuto()
    return () => clearInterval(intervalRef.current)
  }, [startAuto])

  const goTo = (i) => { clearInterval(intervalRef.current); setActive(i); startAuto() }
  const goDir = (dir) => {
    clearInterval(intervalRef.current)
    setActive(prev => dir === 'next' ? (prev + 1) % banners.length : (prev - 1 + banners.length) % banners.length)
    startAuto()
  }

  const b = banners[active]

  return (
    <div className={styles.wrapper}>

      {/* Dot pattern bg */}
      <div className={styles.bgDeco}>
        <svg width="100%" height="100%" style={{ opacity: 0.4 }}>
          <defs>
            <pattern id="dotpat" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#d1d5db" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotpat)" />
        </svg>
      </div>

      {/* Slides */}
      <div className={styles.track} style={{ transform: `translateX(-${active * 100}%)` }}>
        {banners.map((slide, idx) => (
          <div className={styles.slide} key={slide.id}>

            {/* Left */}
            <div className={styles.left}>
              <div className={styles.tagRow}>
                <span className={styles.tag} style={{ background: slide.tagBg, color: slide.tagColor, borderColor: slide.tagColor + '44' }}>
                  {slide.tag}
                </span>
                <span className={styles.tagDivider} />
                <span className={styles.tagSub}>{slide.tagSub}</span>
              </div>

              <div className={styles.headline}>
                {slide.headlineStatic}
                <span style={{ color: slide.accent }}>
                  {idx === active ? typed : slide.typewriterWords[0]}
                  {idx === active && <span className={styles.cursor} style={{ background: slide.accent }} />}
                </span>
              </div>

              <p className={styles.sub}>{slide.sub}</p>

              <div className={styles.btns}>
                <button className={styles.btnPrimary} style={{ background: slide.accent }} onClick={() => navigate(slide.btn1.route)}>
                  {slide.btn1.label} <span className={styles.btnArrow}>→</span>
                </button>
                <button className={styles.btnGhost} onClick={() => navigate(slide.btn2.route)}>
                  {slide.btn2.label}
                </button>
              </div>
            </div>

            {/* Right */}
            <div className={styles.right}>
              <VideoMockup video={slide.video} accent={slide.accent} />
              <div className={styles.floatBadge}>
                <div className={styles.floatIcon} style={{ background: slide.float.iconBg }}>
                  {slide.float.icon}
                </div>
                <div>
                  <div className={styles.floatVal}>{slide.float.val}</div>
                  <div className={styles.floatLbl}>{slide.float.lbl}</div>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Arrows */}
      <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={() => goDir('prev')} aria-label="Previous">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button className={`${styles.navBtn} ${styles.navRight}`} onClick={() => goDir('next')} aria-label="Next">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dots */}
      <div className={styles.dotsWrap}>
        {banners.map((_, i) => (
          <button key={i}
            className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
            style={active === i ? { background: b.accent } : {}}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress */}
      <div key={active} className={styles.progress} style={{ background: b.accent }} />
    </div>
  )
}

export default Banner