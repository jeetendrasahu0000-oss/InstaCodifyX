import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Interview.module.css'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

/* ── Routes ───────────────────────────────────────────────── */
const ROUTES = {
  hr:           '/interview-preparation/hr-prep',
  technical:    '/interview-preparation/technical',
  machine:      '/interview-preparation/machine-test',
  corporate:    '/interview-preparation/live-sessions',
  scheduleMock: '/interview-preparation/schedule-mock',
  
}

/* ── 4 Cards ──────────────────────────────────────────────── */
const quickCards = [
  {
    icon: '🤝',
    title: 'HR Interview',
    desc: 'Behavioral questions, STAR method, salary negotiation, and corporate communication tips.',
    tag: 'Soft Skills',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.10)',
    route: ROUTES.hr,
  },
  {
    icon: '💻',
    title: 'Technical Interview',
    desc: 'DSA problems, system design rounds, web dev concepts, and live code evaluation.',
    tag: 'DSA + Dev',
    tagColor: '#2c6ee8',
    tagBg: 'rgba(44,110,232,0.10)',
    route: ROUTES.technical,
  },
  {
    icon: '⚙️',
    title: 'Machine Test',
    desc: 'Real coding test environment — timed challenges, hidden test cases, auto-evaluation.',
    tag: 'Timed Test',
    tagColor: '#0ea5e9',
    tagBg: 'rgba(14,165,233,0.10)',
    route: ROUTES.machine,
  },
  {
    icon: '🏢',
    title: 'Free Session',
    desc: 'Company-specific interview sets for TCS, Infosys, Wipro, Amazon, Google and more.',
    tag: 'Company Sets',
    tagColor: '#10b981',
    tagBg: 'rgba(16,185,129,0.10)',
    route: ROUTES.corporate,
  },
]

/* ── Tips ─────────────────────────────────────────────────── */
const tips = [
  { icon: '📝', title: 'Prepare STAR Stories',          desc: 'Structure answers using Situation, Task, Action, Result for behavioral questions.',          tag: 'HR Tip',       tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.10)' },
  { icon: '🧠', title: 'Revise Core DSA Daily',          desc: 'Spend at least 1 hour on arrays, trees, graphs, and dynamic programming every day.',         tag: 'Technical',    tagColor: '#e8610a', tagBg: 'rgba(232,97,10,0.12)'  },
  { icon: '⏱️', title: 'Practice Under Time Pressure',   desc: 'Simulate real machine test conditions — solve problems with a timer running.',               tag: 'Machine Test', tagColor: '#0ea5e9', tagBg: 'rgba(14,165,233,0.10)' },
  { icon: '🗣️', title: 'Think Aloud While Solving',      desc: 'Interviewers assess your thought process. Narrate your approach as you code.',               tag: 'Mock',         tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.10)' },
  { icon: '🔍', title: 'Research the Company',           desc: "Study the company's product, tech stack, and culture before every interview.",               tag: 'HR Tip',       tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.10)' },
  { icon: '💬', title: 'Ask Clarifying Questions',       desc: 'Never jump straight to coding. Clarify constraints and edge cases first.',                   tag: 'Technical',    tagColor: '#e8610a', tagBg: 'rgba(232,97,10,0.12)'  },
]

/* ── Component ─────────────────────────────────────────────── */
export default function Interview() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <div className={styles.page}>

        {/* ══ HERO ══ */}
        <section className={styles.heroSection}>
          <div className={styles.heroInner}>

            {/* Left */}
            <div className={styles.heroLeft}>
              <div className={styles.heroPill}>
                <span className={styles.heroPillDot} />
                Interview Prep Hub
              </div>

              <h1 className={styles.heroTitle}>
                Land Your Dream Job.<br />
                <span className={styles.heroTitleAccent}>
                  Practice Like It's Real.
                </span>
              </h1>

              <p className={styles.heroDesc}>
                From HR rounds to machine tests — CodifyX prepares you
                end-to-end with AI mock interviews, live expert sessions,
                and real company challenges.
              </p>

              <div className={styles.heroBtns}>
                <button className={styles.btnPrimary} onClick={() => navigate(ROUTES.scheduleMock)}>
                  🎯 Schedule Interview
                </button>
                <button className={styles.btnSecondary} onClick={() => navigate(ROUTES.corporate)}>
                  📅 Schedule Live Session
                </button>
              </div>

              <div className={styles.heroStats}>
                {[
                  { val: '50K+',  label: 'Mock Interviews' },
                  { val: '1.2K+', label: 'Live Sessions'   },
                  { val: '4.8★',  label: 'Avg Rating'      },
                  { val: '200+',  label: 'Companies'        },
                ].map(s => (
                  <div key={s.label} className={styles.heroStat}>
                    <span className={styles.heroStatVal}>{s.val}</span>
                    <span className={styles.heroStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <div className={styles.heroRight}>
              <img
                src="https://i.pinimg.com/1200x/fc/3b/10/fc3b109e18db20d0468949425292c68d.jpg"
                alt="Interview Preparation"
                className={styles.heroImg}
              />
            </div>

          </div>
        </section>

        {/* ══ BODY ══ */}
        <div className={styles.main}>

          {/* 4 Cards */}
          <div className={styles.sectionHeader} style={{ marginBottom: '20px' }}>
            <div>
              <h2 className={styles.sectionTitle}>Choose Your Track</h2>
              <p className={styles.sectionSub}>Pick a category and start preparing today</p>
            </div>
          </div>

          <div className={styles.quickRow}>
            {quickCards.map((card, i) => (
              <div key={i} className={styles.quickCard} onClick={() => navigate(card.route)}>
                <div className={styles.quickCardTop}>
                  <span className={styles.quickIcon}>{card.icon}</span>
                  <span
                    className={styles.quickTag}
                    style={{ color: card.tagColor, background: card.tagBg, borderColor: `${card.tagColor}33` }}
                  >
                    {card.tag}
                  </span>
                </div>
                <h3 className={styles.quickTitle}>{card.title}</h3>
                <p className={styles.quickDesc}>{card.desc}</p>
                <button
                  className={styles.quickBtn}
                  style={{ color: card.tagColor, borderColor: `${card.tagColor}44`, background: card.tagBg }}
                  onClick={e => { e.stopPropagation(); navigate(card.route) }}
                >
                  Start 
                </button>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className={styles.tipsWrap}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>💡 Interview Tips & Tricks</h2>
                <p className={styles.sectionSub}>Quick tips to boost your interview performance</p>
              </div>
            </div>
            <div className={styles.tipsGrid}>
              {tips.map((tip, i) => (
                <div key={i} className={styles.tipCard}>
                  <div className={styles.tipTop}>
                    <span className={styles.tipIcon}>{tip.icon}</span>
                    <span
                      className={styles.tipTag}
                      style={{ color: tip.tagColor, background: tip.tagBg, borderColor: `${tip.tagColor}33` }}
                    >
                      {tip.tag}
                    </span>
                  </div>
                  <div className={styles.tipTitle}>{tip.title}</div>
                  <div className={styles.tipDesc}>{tip.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaBanner}>
            <div>
              <h3 className={styles.ctaTitle}>Ready to crack your next interview?</h3>
              <p className={styles.ctaSub}>
                Practice real machine tests with time pressure, hidden test cases,
                and instant auto-evaluation — just like top companies do it.
              </p>
            </div>
            <button className={styles.ctaBtn} onClick={() => navigate(ROUTES.machine)}>
              Start Machine Test 
            </button>
          </div>

        </div>
      </div>
      <Footer/>
    </>
  )
}