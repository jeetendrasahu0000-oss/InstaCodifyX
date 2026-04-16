import { useState, useEffect, useRef } from "react";
import {
  FiCode,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiTarget,
  FiZap,
  FiBookOpen,
  FiCpu,
  FiGlobe,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
  FiMonitor,
  FiMessageSquare,
  FiBriefcase,
  FiPlay,
} from "react-icons/fi";
import {
  SiReact,
  SiNodedotjs,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiLeetcode,
} from "react-icons/si";
import { BiCodeCurly, BiRocket, BiTrophy, BiBrain } from "react-icons/bi";
import styles from "./AboutUs.module.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

/* ─── Data ─── */

const stats = [
  {
    icon: <FiUsers size={22} />,
    value: "50,000+",
    label: "Developers Enrolled",
    colorVar: "green",
  },
  {
    icon: <FiCode size={22} />,
    value: "1,200+",
    label: "Coding Problems",
    colorVar: "blue",
  },
  {
    icon: <FiAward size={22} />,
    value: "94%",
    label: "Placement Success Rate",
    colorVar: "amber",
  },
  {
    icon: <FiTrendingUp size={22} />,
    value: "500+",
    label: "Companies Hiring",
    colorVar: "purple",
  },
];

const features = [
  {
    icon: <BiCodeCurly size={26} />,
    title: "Real Interview Problems",
    desc: "Curated DSA problems from FAANG and top product companies with detailed solutions.",
    colorVar: "green",
  },
  {
    icon: <BiBrain size={26} />,
    title: "AI-Powered HR Prep",
    desc: "Mock behavioral sessions with instant AI feedback using the proven STAR method.",
    colorVar: "indigo",
  },
  {
    icon: <BiRocket size={26} />,
    title: "Live Contests",
    desc: "Weekly rated contests to benchmark your performance against real developers globally.",
    colorVar: "amber",
  },
  {
    icon: <BiTrophy size={26} />,
    title: "Interview & Placement Kit",
    desc: "Company-specific roadmaps, discussion forums, and mentorship to land your dream job.",
    colorVar: "pink",
  },
];

const techStack = [
  { icon: <SiJavascript size={28} />, name: "JavaScript", colorVar: "js" },
  { icon: <SiPython size={28} />, name: "Python", colorVar: "py" },
  { icon: <SiTypescript size={28} />, name: "TypeScript", colorVar: "ts" },
  { icon: <SiReact size={28} />, name: "React", colorVar: "react" },
  { icon: <SiNodedotjs size={28} />, name: "Node.js", colorVar: "node" },
  { icon: <SiLeetcode size={28} />, name: "DSA", colorVar: "lc" },
];

const journey = [
  {
    year: "2021",
    title: "Founded",
    desc: "CodifyX was born with a mission to democratize tech interview prep.",
  },
  {
    year: "2022",
    title: "10K Users",
    desc: "Crossed 10,000 active developers with our problem bank launch.",
  },
  {
    year: "2023",
    title: "AI Integration",
    desc: "Launched AI-powered mock HR sessions and code review engine.",
  },
  {
    year: "2024",
    title: "50K Community",
    desc: "50,000+ developers trust CodifyX for their interview preparation.",
  },
];

const team = [
  {
    initials: "JSK",
    name: "Jeetendra Sahu",
    role: "MERN Stack Developer & Trainer",
    colorVar: "green",
  },
  {
    initials: "DJ",
    name: "Dipanshu Jangde",
    role: "Full Stack Developer",
    colorVar: "indigo",
  },
  {
    initials: "MK",
    name: "Muskan Raghuvanshi",
    role: "UI/UX Designer",
    colorVar: "pink",
  },
  {
    initials: "NS",
    name: "Nipun Setthi",
    role: "Head of Product",
    colorVar: "amber",
  },
];

const missionChecks = [
  "Structured learning paths",
  "Real company problems",
  "AI-powered feedback",
  "Supportive community",
];

const missionMiniStats = [
  { value: "3+", label: "Years Active", colorVar: "green" },
  { value: "24/7", label: "Support", colorVar: "indigo" },
  { value: "Free", label: "to Start", colorVar: "amber" },
];

const missionHighlights = [
  { icon: <FiMonitor size={18} />, text: "1,200+ Problems" },
  { icon: <FiMessageSquare size={18} />, text: "Active Discussions" },
  { icon: <FiBriefcase size={18} />, text: "Job Placement" },
];

const howSteps = [
  {
    icon: <FiBookOpen size={22} />,
    num: "01",
    title: "Pick a Problem",
    desc: "Browse 1,200+ curated problems by company, topic, or difficulty.",
  },
  {
    icon: <FiCpu size={22} />,
    num: "02",
    title: "Code & Submit",
    desc: "Write your solution in our feature-rich online IDE with real-time feedback.",
  },
  {
    icon: <FiUsers size={22} />,
    num: "03",
    title: "Mock HR Rounds",
    desc: "Practice behavioral rounds with our AI coach using the STAR method.",
  },
  {
    icon: <FiGlobe size={22} />,
    num: "04",
    title: "Get Hired",
    desc: "Apply to 500+ companies hiring directly through the CodifyX platform.",
  },
];

/* ─── Hooks ─── */

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Animated Counter ─── */

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const numTarget = parseInt(target.replace(/\D/g, ""));
  const [ref, visible] = useInView();

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(numTarget / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= numTarget) {
        setCount(numTarget);
        clearInterval(timer);
      } else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [visible, numTarget]);

  const formatted = target.includes(",")
    ? count.toLocaleString() + (target.includes("+") ? "+" : "")
    : count + (target.includes("%") ? "%" : target.includes("+") ? "+" : "");

  return <span ref={ref}>{formatted}</span>;
}

/* ─── Shared: SectionHeader ─── */

function SectionHeader({ badge, title, sub }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`${styles.sectionHeader} ${styles.fadeUp} ${visible ? styles.show : ""}`}
    >
      <span className={styles.sectionBadge}>{badge}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionSub}>{sub}</p>
    </div>
  );
}

/* ─── Main Component ─── */

export default function AboutUs() {
  const [activeJourney, setActiveJourney] = useState(0);
  const [heroRef, heroVisible] = useInView(0.1);

  return (
    <div className={styles.wrapper}>
      <Header />
      {/* ── HERO ── */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroDotPattern} />
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            {/* Hero Left */}
            <div
              className={`${styles.heroLeft} ${styles.fadeUp} ${heroVisible ? styles.show : ""}`}
            >
              <div className={styles.badge}>
                <FiCode size={14} className={styles.badgeIcon} />
                <span className={styles.badgeText}>ABOUT CODIFYX</span>
              </div>
              <h1 className={styles.heroTitle}>
                Where Developers <br />
                <span className={styles.heroAccent}>Crack</span> Their Dream{" "}
                <br />
                Interviews
              </h1>
              <p className={styles.heroDesc}>
                CodifyX is an end-to-end tech interview preparation platform —
                combining curated DSA problems, live contests, AI-powered HR
                prep, and community support to help 50,000+ developers land top
                tech jobs.
              </p>
              <div className={styles.heroBtns}>
                <button className={styles.btnPrimary}>
                  Start Preparing <FiArrowRight size={16} />
                </button>
                <button className={styles.btnOutline}>
                  <FiPlay size={14} /> Watch Demo
                </button>
              </div>
            </div>

            {/* Hero Right — Code Window */}
            <div className={`${styles.heroRight} ${styles.float}`}>
              <div className={styles.codeWindow}>
                <div className={styles.codeBar}>
                  <span className={`${styles.dot} ${styles.dotRed}`} />
                  <span className={`${styles.dot} ${styles.dotYellow}`} />
                  <span className={`${styles.dot} ${styles.dotGreen}`} />
                  <span className={styles.codeFileName}>
                    solution.py — CodifyX
                  </span>
                  <span className={styles.liveBadge}>LIVE</span>
                </div>
                <div className={styles.codeBody}>
                  <p className={styles.codeLine}>
                    <span className={styles.cKw}>class </span>
                    <span className={styles.cCls}>Solution</span>
                    <span className={styles.cTxt}>:</span>
                  </p>
                  <p className={`${styles.codeLine} ${styles.pl1}`}>
                    <span className={styles.cKw}>def </span>
                    <span className={styles.cFn}>twoSum</span>
                    <span className={styles.cTxt}>(self, nums, target):</span>
                  </p>
                  <p
                    className={`${styles.codeLine} ${styles.pl2} ${styles.cMuted}`}
                  >
                    seen = {"{}"}
                  </p>
                  <p className={`${styles.codeLine} ${styles.pl2}`}>
                    <span className={styles.cKw}>for </span>
                    <span className={styles.cTxt}>i, n </span>
                    <span className={styles.cKw}>in </span>
                    <span className={styles.cFn}>enumerate</span>
                    <span className={styles.cTxt}>(nums):</span>
                  </p>
                  <p
                    className={`${styles.codeLine} ${styles.pl3} ${styles.cTxt}`}
                  >
                    diff = target - n
                  </p>
                  <p className={`${styles.codeLine} ${styles.pl3}`}>
                    <span className={styles.cKw}>if </span>
                    <span className={styles.cTxt}>diff </span>
                    <span className={styles.cKw}>in </span>
                    <span className={styles.cTxt}>seen:</span>
                  </p>
                  <p className={`${styles.codeLine} ${styles.pl4}`}>
                    <span className={styles.cKw}>return </span>
                    <span className={styles.cTxt}>[seen[diff], i]</span>
                  </p>
                  <p
                    className={`${styles.codeLine} ${styles.pl3} ${styles.cTxt}`}
                  >
                    seen[n] = i
                  </p>
                  <div className={styles.codeResult}>
                    <span className={styles.cSuccess}>✓ Accepted &nbsp;</span>
                    <span className={styles.cMuted}>
                      Runtime: 48ms · Beats 97.4%
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.floatingBadge}>
                <div className={styles.floatingBadgeIcon}>
                  <FiTrendingUp
                    size={18}
                    className={styles.floatingBadgeIconColor}
                  />
                </div>
                <div>
                  <p className={styles.floatingBadgeValue}>94% Success</p>
                  <p className={styles.floatingBadgeLabel}>Placement Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── STATS ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <StatCard key={i} {...s} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>
      {/* ── MISSION ── */}
      <MissionSection />
      {/* ── FEATURES ── */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionInner}>
          <SectionHeader
            badge="WHAT WE OFFER"
            title="Everything You Need to Crack Interviews"
            sub="From DSA to behavioral rounds — we've got every round covered."
          />
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>
      {/* ── TECH STACK ── */}
      <section className={styles.techSection}>
        <div className={styles.sectionInner}>
          <p className={styles.techLabel}>
            Languages &amp; Technologies Supported
          </p>
          <div className={styles.techRow}>
            {techStack.map((t, i) => (
              <div
                key={i}
                className={`${styles.techPill} ${styles[`tech_${t.colorVar}`]}`}
              >
                <span
                  className={`${styles.techIcon} ${styles[`techIcon_${t.colorVar}`]}`}
                >
                  {t.icon}
                </span>
                <span className={styles.techName}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── JOURNEY ── */}
      <JourneySection
        activeJourney={activeJourney}
        setActiveJourney={setActiveJourney}
      />
      {/* ── HOW IT WORKS ── */}
      <HowItWorks />
      {/* ── TEAM ── */}
      <section className={styles.teamSection}>
        <div className={styles.sectionInner}>
          <SectionHeader
            badge="OUR TEAM"
            title="The Minds Behind CodifyX"
            sub="Built by engineers who've been through the grind — and want to make it easier for you."
          />
          <div className={styles.teamGrid}>
            {team.map((m, i) => (
              <TeamCard key={i} {...m} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>
      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <div className={styles.ctaInner}>
          <div className={styles.ctaBadge}>
            <FiZap size={14} className={styles.ctaBadgeIcon} />
            <span className={styles.ctaBadgeText}>JOIN 50,000+ DEVELOPERS</span>
          </div>
          <h2 className={styles.ctaTitle}>
            Start Your Interview Journey Today
          </h2>
          <p className={styles.ctaDesc}>
            Practice problems, get AI feedback on your HR rounds, and join live
            contests — all in one platform.
          </p>
          <div className={styles.ctaBtns}>
            <button className={styles.btnPrimary}>
              Get Started Free <FiArrowRight size={16} />
            </button>
            <button className={styles.btnDark}>
              <FiBookOpen size={15} /> Browse Problems
            </button>
          </div>
        </div>
      </section>
      <Footer />;
    </div>
  );
}

/* ─── Sub-components ─── */

function StatCard({ icon, value, label, colorVar, delay }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`${styles.statCard} ${styles.fadeUp} ${visible ? styles.show : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`${styles.statIcon} ${styles[`statIcon_${colorVar}`]}`}>
        {icon}
      </div>
      <div className={styles.statValue}>
        <AnimatedCounter target={value} />
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, colorVar, delay }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`${styles.featureCard} ${styles.fadeUp} ${visible ? styles.show : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`${styles.featureIcon} ${styles[`featureIcon_${colorVar}`]}`}
      >
        {icon}
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </div>
  );
}

function MissionSection() {
  const [ref, visible] = useInView();
  return (
    <section className={styles.missionSection}>
      <div className={styles.missionInner}>
        {/* Dark Visual Card */}
        <div
          ref={ref}
          className={`${styles.missionVisual} ${styles.fadeUp} ${visible ? styles.show : ""}`}
        >
          <div className={styles.missionVisualGlow} />
          <div className={styles.missionVisualHeader}>
            <div className={styles.missionVisualIconWrap}>
              <FiTarget size={20} className={styles.missionTargetIcon} />
            </div>
            <span className={styles.missionVisualTitle}>Our Mission</span>
          </div>
          <p className={styles.missionVisualDesc}>
            To make world-class tech interview preparation accessible and
            structured for every developer — regardless of background, college,
            or location.
          </p>
          {missionChecks.map((item, i) => (
            <div key={i} className={styles.missionCheckRow}>
              <FiCheckCircle size={16} className={styles.missionCheckIcon} />
              <span className={styles.missionCheckText}>{item}</span>
            </div>
          ))}
          <div className={styles.missionMiniStats}>
            {missionMiniStats.map((s, i) => (
              <div
                key={i}
                className={`${styles.missionMiniStat} ${styles[`miniStat_${s.colorVar}`]}`}
              >
                <p className={styles.missionMiniStatValue}>{s.value}</p>
                <p className={styles.missionMiniStatLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Text Side */}
        <div className={styles.missionText}>
          <span className={styles.sectionBadge}>OUR MISSION</span>
          <h2 className={styles.missionTextTitle}>
            Built by Developers, <br />
            <span className={styles.heroAccent}>for Developers</span>
          </h2>
          <p className={styles.missionPara}>
            CodifyX was founded with a simple belief: every developer deserves a
            fair shot at cracking top tech interviews. We saw friends with
            brilliant minds fail interviews due to lack of structured practice —
            and we decided to fix that.
          </p>
          <p className={styles.missionPara}>
            Today, CodifyX is a comprehensive preparation ecosystem — combining
            real problems from top companies, AI-driven behavioral coaching,
            weekly contests, and a thriving community of 50,000+ learners.
          </p>
          <div className={styles.missionHighlights}>
            {missionHighlights.map((it, i) => (
              <div key={i} className={styles.missionHighlightItem}>
                <span className={styles.missionHighlightIcon}>{it.icon}</span>
                {it.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneySection({ activeJourney, setActiveJourney }) {
  const [ref, visible] = useInView();
  return (
    <section className={styles.journeySection}>
      <div className={styles.journeyInner}>
        <SectionHeader
          badge="OUR JOURNEY"
          title="How CodifyX Grew"
          sub="From a small idea to India's fastest-growing coding interview platform."
        />
        <div
          ref={ref}
          className={`${styles.journeyTimeline} ${styles.fadeUp} ${visible ? styles.show : ""}`}
        >
          <div className={styles.timelineLine} />
          <div className={styles.timelineDots}>
            {journey.map((j, i) => (
              <button
                key={i}
                className={styles.journeyDot}
                onClick={() => setActiveJourney(i)}
              >
                <div
                  className={`${styles.dotCircle} ${activeJourney === i ? styles.dotCircleActive : ""}`}
                >
                  <FiStar
                    size={16}
                    className={
                      activeJourney === i
                        ? styles.dotStarActive
                        : styles.dotStar
                    }
                  />
                </div>
                <span
                  className={`${styles.dotYear} ${activeJourney === i ? styles.dotYearActive : ""}`}
                >
                  {j.year}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.journeyContent}>
            <h3 className={styles.journeyTitle}>
              {journey[activeJourney].title}
            </h3>
            <p className={styles.journeyDesc}>{journey[activeJourney].desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const [ref, visible] = useInView();
  return (
    <section className={styles.howSection}>
      <div className={styles.sectionInner}>
        <SectionHeader
          badge="HOW IT WORKS"
          title="Your Path to Getting Hired"
          sub="A simple 4-step process designed to take you from beginner to interview-ready."
        />
        <div
          ref={ref}
          className={`${styles.stepsGrid} ${styles.fadeUp} ${visible ? styles.show : ""}`}
        >
          {howSteps.map((s, i) => (
            <div key={i} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.num}</span>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ initials, name, role, colorVar, delay }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`${styles.teamCard} ${styles.fadeUp} ${visible ? styles.show : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`${styles.avatar} ${styles[`avatar_${colorVar}`]}`}>
        {initials}
      </div>
      <p className={styles.teamName}>{name}</p>
      <p className={styles.teamRole}>{role}</p>
    </div>
  );
}
