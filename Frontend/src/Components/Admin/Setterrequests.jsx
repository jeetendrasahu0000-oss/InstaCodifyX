import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllSetterRequestsAPI,
  approveSetterRequestAPI,
  rejectSetterRequestAPI,
} from "./adminApi";
import styles from "./SetterRequests.module.css"; // Make sure this matches the filename exactly

const SetterRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionId, setActionId] = useState(null);
  const navigate = useNavigate();

  // Dummy images for different filter states
  const filterImages = {
    pending:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"%3E%3C/path%3E%3C/svg%3E',
    approved:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M22 11.08V12a10 10 0 1 1-5.93-9.14"%3E%3C/path%3E%3Cpolyline points="22 4 12 14.01 9 11.01"%3E%3C/polyline%3E%3C/svg%3E',
    rejected:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"%3E%3C/circle%3E%3Cline x1="18" y1="6" x2="6" y2="18"%3E%3C/line%3E%3Cline x1="6" y1="6" x2="18" y2="18"%3E%3C/line%3E%3C/svg%3E',
  };

  const [currentImage, setCurrentImage] = useState(filterImages.pending);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getAllSetterRequestsAPI();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Update image when filter changes
  useEffect(() => {
    setCurrentImage(filterImages[filter]);
  }, [filter]);

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Approve this request? An account will be created and email sent.",
      )
    )
      return;
    setActionId(id);
    try {
      await approveSetterRequestAPI(id);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error approving request.");
    }
    setActionId(null);
  };

  const handleReject = async (id) => {
    if (
      !window.confirm(
        "Reject this request? The applicant will be notified via email.",
      )
    )
      return;
    setActionId(id);
    try {
      await rejectSetterRequestAPI(id);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting request.");
    }
    setActionId(null);
  };

  const filtered = requests.filter((r) => r.status === filter);

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className={styles.srpPage}>
      {/* Top Bar */}
      <div className={styles.srpTopbar}>
        <button
          className={styles.srpBack}
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h2 className={styles.srpHeading}>
          Setter <span>Requests</span>
        </h2>
      </div>

      {/* Stats & Image Container */}
      <div className={styles.srpStatsContainer}>
        <div className={styles.srpStats}>
          <div
            className={`${styles.srpStat} ${filter === "pending" ? styles.activePending : ""}`}
            onClick={() => setFilter("pending")}
          >
            <div className={`${styles.srpStatNum} ${styles.pending}`}>
              {counts.pending}
            </div>
            <div className={styles.srpStatLabel}>pending</div>
          </div>
          <div
            className={`${styles.srpStat} ${filter === "approved" ? styles.activeApproved : ""}`}
            onClick={() => setFilter("approved")}
          >
            <div className={`${styles.srpStatNum} ${styles.approved}`}>
              {counts.approved}
            </div>
            <div className={styles.srpStatLabel}>approved</div>
          </div>
          <div
            className={`${styles.srpStat} ${filter === "rejected" ? styles.activeRejected : ""}`}
            onClick={() => setFilter("rejected")}
          >
            <div className={`${styles.srpStatNum} ${styles.rejected}`}>
              {counts.rejected}
            </div>
            <div className={styles.srpStatLabel}>rejected</div>
          </div>
        </div>

        {/* Image that changes on filter click */}
        <div className={styles.srpImageContainer}>
          <img
            src={currentImage}
            alt={`${filter} requests`}
            className={styles.srpFilterImage}
          />
          <div className={styles.srpImageCaption}>
            {filter === "pending" && "⏳ Awaiting Review"}
            {filter === "approved" && "✓ Approved Applications"}
            {filter === "rejected" && "✗ Rejected Applications"}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.srpLoading}>
          <div className={styles.srpSpinner} /> Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.srpEmpty}>
          <div className={styles.srpEmptyIcon}>
            {filter === "pending" ? "📭" : filter === "approved" ? "✅" : "❌"}
          </div>
          <div className={styles.srpEmptyText}>No {filter} requests found</div>
        </div>
      ) : (
        <div className={styles.srpList}>
          {filtered.map((r, i) => (
            <div
              className={styles.srpItem}
              key={r._id}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={styles.srpItemLeft}>
                <div className={styles.srpAvatar}>
                  {r.username[0].toUpperCase()}
                </div>
                <div>
                  <div className={styles.srpName}>{r.username}</div>
                  <div className={styles.srpEmail}>{r.email}</div>
                  <div className={styles.srpDate}>
                    Applied:{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.srpActions}>
                <span className={`${styles.srpBadge} ${styles[r.status]}`}>
                  {r.status}
                </span>
                {r.status === "pending" && (
                  <>
                    <button
                      className={styles.srpApproveBtn}
                      disabled={actionId === r._id}
                      onClick={() => handleApprove(r._id)}
                    >
                      {actionId === r._id ? "..." : "✓ Approve"}
                    </button>
                    <button
                      className={styles.srpRejectBtn}
                      disabled={actionId === r._id}
                      onClick={() => handleReject(r._id)}
                    >
                      {actionId === r._id ? "..." : "✕ Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetterRequests;
