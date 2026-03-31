import React from "react";
import styles from "./HrPreparation.module.css";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { BsCalendar2Check, BsChatSquareText } from "react-icons/bs";
import { FiArrowRight, FiZap, FiUsers, FiAward, FiClock } from "react-icons/fi";
import { MdOutlineSchedule } from "react-icons/md";

const stats = [
  { icon: <FiUsers />, value: "2,400+", label: "Interviews Done" },
  { icon: <FiAward />, value: "94%", label: "Success Rate" },
  { icon: <FiClock />, value: "15 min", label: "Avg Session" },
];

const HrPreparation = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className={styles.page}>

        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.badge}>
            <HiOutlineLightningBolt className={styles.badgeIcon} />
            AI-Powered HR Prep
          </div>
          <h1 className={styles.heroTitle}>
            Ace Your Next<br />
            <span className={styles.highlight}>HR Interview</span>
          </h1>
          <p className={styles.heroSub}>
            Practice with real questions or book a live session with our HR experts.
            Build confidence before the real thing.
          </p>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            {stats.map((s, i) => (
              <div className={styles.statItem} key={i}>
                <span className={styles.statIcon}>{s.icon}</span>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className={styles.cardGrid}>

          {/* Start Interview Card */}
          <div className={`${styles.card} ${styles.cardStart}`}>
            <div className={styles.cardIconWrap} style={{ background: "#fff3e0" }}>
              <BsChatSquareText className={styles.cardIcon} style={{ color: "#f97316" }} />
            </div>
            <div className={styles.cardTag} style={{ background: "#fff3e0", color: "#ea580c" }}>
              <FiZap /> Instant Access
            </div>
            <h2 className={styles.cardTitle}>Start Interview</h2>
            <p className={styles.cardDesc}>
              Practice dynamic HR questions tailored to your experience level. Get real-time AI feedback and improve instantly.
            </p>

            <ul className={styles.featureList}>
              <li><FiArrowRight /> 50+ HR question bank</li>
              <li><FiArrowRight /> Instant AI feedback</li>
              <li><FiArrowRight /> Track your progress</li>
            </ul>

            <button
              className={`${styles.btn} ${styles.btnOrange}`}
              onClick={() => navigate("/interview/start")}
            >
              Start Now
              <FiArrowRight className={styles.btnArrow} />
            </button>
          </div>

          {/* Schedule Interview Card */}
          <div className={`${styles.card} ${styles.cardSchedule}`}>
            <div className={styles.cardIconWrap} style={{ background: "#e8f5e9" }}>
              <BsCalendar2Check className={styles.cardIcon} style={{ color: "#16a34a" }} />
            </div>
            <div className={styles.cardTag} style={{ background: "#e8f5e9", color: "#15803d" }}>
              <MdOutlineSchedule /> Live Session
            </div>
            <h2 className={styles.cardTitle}>Schedule Live Interview</h2>
            <p className={styles.cardDesc}>
              Book a real-time session with HR professionals. Get personal feedback and industry-specific guidance.
            </p>

            <ul className={styles.featureList}>
              <li><FiArrowRight /> Expert HR panel</li>
              <li><FiArrowRight /> Google Meet integration</li>
              <li><FiArrowRight /> Calendar sync</li>
            </ul>

            <button
              className={`${styles.btn} ${styles.btnGreen}`}
              onClick={() => navigate("/interview/schedule")}
            >
              Schedule Now
              <FiArrowRight className={styles.btnArrow} />
            </button>
          </div>

        </div>

        {/* Bottom Note */}
        <p className={styles.bottomNote}>
          🔒 All sessions are private and confidential
        </p>
      </div>
      <Footer />
    </>
  );
};

export default HrPreparation;