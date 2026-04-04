import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import styles from "../MachineTest/MachineTest.module.css";
import {
  FiClock, FiAward, FiCode, FiCalendar,
  FiArrowRight, FiAlertCircle
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const MachineTest = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mySubmissions, setMySubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [testsRes, subsRes] = await Promise.all([
          api.get("/machine-tests/available"),
          api.get("/submissions/my"),
        ]);
        setTests(testsRes.data);
        setMySubmissions(subsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasSubmitted = (testId) =>
    mySubmissions.some((s) => s.test?._id === testId || s.test === testId);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getStatus = (test) => {
    const now = new Date();
    if (now < new Date(test.startTime)) return { label: "Upcoming", cls: styles.upcoming };
    if (now > new Date(test.endTime)) return { label: "Ended", cls: styles.ended };
    return { label: "Live", cls: styles.live };
  };

  if (loading) return (
    <div className={styles.loadPage}>
      <div className={styles.spinner} />
      <span>Loading tests...</span>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}><HiSparkles size={12} /> Machine Tests</div>
        <h1 className={styles.heroTitle}>Available Tests</h1>
        <p className={styles.heroSub}>Complete the tasks within the time limit and submit your work.</p>
      </div>

      {tests.length === 0 ? (
        <div className={styles.empty}>
          <FiAlertCircle size={32} style={{ color: "#4a5070" }} />
          <p>No active tests right now. Check back later.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {tests.map((test) => {
            const status = getStatus(test);
            const submitted = hasSubmitted(test._id);
            return (
              <div key={test._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.statusRow}>
                    <span className={`${styles.statusBadge} ${status.cls}`}>{status.label}</span>
                    {submitted && <span className={styles.submittedBadge}><FiAward size={10} /> Submitted</span>}
                  </div>
                  <h2 className={styles.cardTitle}>{test.title}</h2>
                  <p className={styles.cardDesc}>{test.description?.slice(0, 120)}{test.description?.length > 120 ? "…" : ""}</p>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <FiClock size={13} /> {test.duration} min
                  </div>
                  <div className={styles.metaItem}>
                    <FiAward size={13} /> {test.totalMarks} marks
                  </div>
                  {test.codingProblems?.length > 0 && (
                    <div className={styles.metaItem}>
                      <FiCode size={13} /> {test.codingProblems.length} coding
                    </div>
                  )}
                </div>

                <div className={styles.dateRow}>
                  <div className={styles.dateItem}>
                    <FiCalendar size={11} />
                    <span>Ends {formatDate(test.endTime)}</span>
                  </div>
                </div>

                <button
                  className={`${styles.btn} ${submitted ? styles.btnDone : ""}`}
                  onClick={() => navigate(`/machine-test/${test._id}`)}
                  disabled={submitted}
                >
                  {submitted ? "Already Submitted" : <><span>Start Test</span> <FiArrowRight size={14} /></>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MachineTest;