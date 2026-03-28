import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const LOGO = '../../../public/codifyxPngOrignal.png'

const LINKS = {
  Platform: [
    { label: 'Explore',           to: '/explore' },
    { label: 'Problems',          to: '/problems' },
    { label: 'Contests',          to: '/contests',  badge: 'Hot',  badgeColor: '#ef4444', badgeBg: 'rgba(239,68,68,0.10)' },
    { label: 'Discuss',           to: '/discuss' },
    { label: 'Store',             to: '/store' },
  ],
  Interview: [
    { label: 'Mock Interview',    to: '/interview-preparation/mock' },
    { label: 'HR Interview Prep', to: '/interview-preparation/hr-prep' },
    { label: 'Technical Round',   to: '/interview-preparation/technical' },
    { label: 'Machine Test',      to: '/interview-preparation/machine-test' },
    { label: 'Corporate Prep',    to: '/interview-preparation/corporate-prep' },
    { label: 'Live Sessions',     to: '/interview-preparation/live-sessions', badge: 'Free', badgeColor: '#10b981', badgeBg: 'rgba(16,185,129,0.10)' },
  ],
  Company: [
    { label: 'About Us',          to: '/about' },
    { label: 'Careers',           to: '/careers',   badge: 'Hiring', badgeColor: '#2c6ee8', badgeBg: 'rgba(44,110,232,0.10)' },
    { label: 'Blog',              to: '/blog' },
    { label: 'Press Kit',         to: '/press' },
    { label: 'Contact',           to: '/contact' },
  ],
  Support: [
    { label: 'Help Center',       to: '/help' },
    { label: 'Privacy Policy',    to: '/privacy' },
    { label: 'Terms of Service',  to: '/terms' },
    { label: 'Cookie Policy',     to: '/cookies' },
    { label: 'Report a Bug',      to: '/report' },
  ],
}

const SOCIALS = [
  { icon: '𝕏', label: 'Twitter/X',  href: '#' },
  { icon: 'in', label: 'LinkedIn',   href: '#' },
  { icon: 'gh', label: 'GitHub',     href: '#' },
  { icon: 'yt', label: 'YouTube',    href: '#' },
  { icon: 'dс', label: 'Discord',    href: '#' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className={styles.footer}>

      {/* ── Top CTA Strip ── */}
      <div className={styles.topStrip}>
        <div className={styles.topStripInner}>
          <div className={styles.topStripLeft}>
           
            <div>
              <p className={styles.topStripTitle}>Start your coding journey today</p>
              <p className={styles.topStripSub}>Join 50,000+ developers preparing for top tech interviews on CodifyX</p>
            </div>
          </div>
          <div className={styles.topStripBtns}>
            <Link to="/interview-preparation/machine-test" className={styles.btnPrimary}>
              Get Started Free →
            </Link>
            <Link to="/problems" className={styles.btnSecondary}>
              Browse Problems
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className={styles.body}>

        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.brandLogo}>
            <img src={LOGO} alt="CodifyX" className={styles.brandLogoImg} />
           
          </Link>

          <p className={styles.brandDesc}>
            The modern platform for developers to practice coding, prepare for interviews,
            and land their dream job at top tech companies.
          </p>

          <div className={styles.brandStats}>
            {[
              { val: '50K+',  label: 'Users'     },
              { val: '2K+',   label: 'Problems'   },
              { val: '200+',  label: 'Companies'  },
            ].map(s => (
              <div key={s.label} className={styles.brandStat}>
                <span className={styles.brandStatVal}>{s.val}</span>
                <span className={styles.brandStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.socials}>
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                className={styles.socialBtn}
                title={s.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {s.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title} className={styles.linkCol}>
            <h4 className={styles.colTitle}>{title}</h4>
            <ul className={styles.linkList}>
              {links.map(link => (
                <li key={link.to} className={styles.linkItem}>
                  <Link to={link.to}>
                    {link.label}
                    {link.badge && (
                      <span
                        className={styles.linkBadge}
                        style={{ color: link.badgeColor, background: link.badgeBg }}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* ── Newsletter ── */}
      <div className={styles.newsletter}>
        <div className={styles.newsletterBox}>
          <div className={styles.newsletterLeft}>
            <p className={styles.newsletterTitle}>Stay updated with CodifyX</p>
            <p className={styles.newsletterSub}>
              Get weekly contest alerts, new problems, and interview tips — no spam.
            </p>
          </div>
          {subscribed ? (
            <p style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
              ✅ You're subscribed! Check your inbox.
            </p>
          ) : (
            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <input
                type="email"
                className={styles.newsletterInput}
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className={styles.newsletterBtn}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} <strong>CodifyX</strong>. All rights reserved.
          </p>

          <div className={styles.bottomLinks}>
            <Link to="/privacy" className={styles.bottomLink}>Privacy</Link>
            <Link to="/terms"   className={styles.bottomLink}>Terms</Link>
            <Link to="/cookies" className={styles.bottomLink}>Cookies</Link>
            <Link to="/sitemap" className={styles.bottomLink}>Sitemap</Link>
          </div>

          <div className={styles.madeBadge}>
            <span>⚡</span>
            <span>Built for developers</span>
          </div>
        </div>
      </div>

    </footer>
  )
}