// RegisterAdmin.jsx
// Content-only component — rendered inside AdminDashboard <Outlet />
// No full-page layout, no own background

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";
import { registerAdminAPI } from "./adminApi";
import styles from "./RegisterAdmin.module.css";
import {
  MdPersonAdd,
  MdPerson,
  MdEmail,
  MdLock,
  MdAdminPanelSettings,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";

export default function RegisterAdmin() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "problem-setter",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { admin } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await registerAdminAPI(form);
      setSuccess(`"${data.username}" (${data.role}) successfully created!`);
      setForm({
        username: "",
        email: "",
        password: "",
        role: "problem-setter",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>Dashboard / Create Account</div>
        <h1 className={styles.pageTitle}>Create New Account</h1>
        <p className={styles.pageSubtitle}>
          Add a new Admin or Problem Setter to the platform
        </p>
      </div>

      {/* Form Card */}
      <div className={styles.card}>
        {/* Alerts */}
        {error && (
          <div className={styles.alertError}>
            <MdErrorOutline size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className={styles.alertSuccess}>
            <MdCheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label}>
              <MdPerson size={15} />
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className={styles.input}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>
              <MdEmail size={15} />
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              className={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>
              <MdLock size={15} />
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className={styles.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Role */}
          <div className={styles.field}>
            <label className={styles.label}>
              <MdAdminPanelSettings size={15} />
              Role
            </label>
            <select
              className={styles.select}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="problem-setter">Problem Setter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Role info chips */}
          <div className={styles.roleInfo}>
            <div
              className={`${styles.roleChip} ${form.role === "problem-setter" ? styles.roleChipActive : ""}`}
            >
              <span
                className={styles.roleChipDot}
                style={{ background: "#7c3aed" }}
              />
              <span>Problem Setter — Can add/edit problems</span>
            </div>
            <div
              className={`${styles.roleChip} ${form.role === "admin" ? styles.roleChipActive : ""}`}
            >
              <span
                className={styles.roleChipDot}
                style={{ background: "#dc2626" }}
              />
              <span>Admin — Full platform access</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <>
                <span className={styles.btnSpinner} />
                Creating...
              </>
            ) : (
              <>
                <MdPersonAdd size={18} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
