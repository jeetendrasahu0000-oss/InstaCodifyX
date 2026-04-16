import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiFileText,
  FiChevronDown,
  FiGithub,
  FiTwitter,
  FiLinkedin,
} from "react-icons/fi";
import { BiSupport } from "react-icons/bi";
import styles from "./Contact.module.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

/* ─── Static Data ─── */

const contactInfo = [
  {
    icon: <FiMail size={22} />,
    label: "Email Us",
    value: "hr@instadotanalytics.com",
    sub: "We reply within 24 hours",
    colorVar: "green",
    href: "mailto:hr@instadotanalytics.com",
  },
  {
    icon: <FiPhone size={22} />,
    label: "Call Us",
    value: "+91 99811 21216",
    sub: "Mon – Sat, 11am – 7pm IST",
    colorVar: "blue",
    href: "tel:+91 9981121216",
  },
  {
    icon: <FiMapPin size={22} />,
    label: "Our Office",
    value: "P 13-14, Ground Floor, Metro Tower, Vijay Nagar, Indore[M.P.]",
    sub: "Indore — 452001",
    colorVar: "amber",
    href: "https://maps.google.com",
  },
  {
    icon: <FiClock size={22} />,
    label: "Support Hours",
    value: "Mon – Sat",
    sub: "10:00 AM – 7:00 PM IST",
    colorVar: "purple",
    href: null,
  },
];

const socialLinks = [
  {
    icon: <FiGithub size={18} />,
    label: "GitHub",
    href: "https://github.com",
  },
  {
    icon: <FiTwitter size={18} />,
    label: "Twitter",
    href: "https://twitter.com",
  },
  {
    icon: <FiLinkedin size={18} />,
    label: "LinkedIn",
    href: "https://linkedin.com",
  },
];

const subjectOptions = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Billing & Payments",
  "Contest Issue",
  "Partnership",
  "Other",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

/* ─── Main Component ─── */

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [charCount, setCharCount] = useState(0);

  /* Validation */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Invalid Indian mobile number";
    if (!form.subject) e.subject = "Please select a subject";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 20)
      e.message = "Message must be at least 20 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "message") setCharCount(value.length);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("loading");

    // Fallback: agar .env mein VITE_API_URL nahi set hai to localhost use karo
    const BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Safe JSON parse — empty response body ko handle karo
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      setStatus("success");
      setForm(initialForm);
      setCharCount(0);
    } catch (err) {
      console.error("[Contact Submit Error]:", err.message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrors({});
    setForm(initialForm);
    setCharCount(0);
  };

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        {/* ── Hero Banner ── */}
        <section className={styles.hero}>
          <div className={styles.heroDots} />
          <div className={styles.heroInner}>
            <div className={styles.heroBadge}>
              <BiSupport size={14} className={styles.heroBadgeIcon} />
              <span className={styles.heroBadgeText}>CONTACT & SUPPORT</span>
            </div>
            <h1 className={styles.heroTitle}>
              We're Here to <span className={styles.accent}>Help You</span>
            </h1>
            <p className={styles.heroSub}>
              Got a question, found a bug, or want to partner with us? Reach out
              — our team responds within 24 hours.
            </p>
          </div>
        </section>

        {/* ── Info Cards ── */}
        <section className={styles.infoSection}>
          <div className={styles.infoGrid}>
            {contactInfo.map((info, i) => (
              <InfoCard key={i} {...info} />
            ))}
          </div>
        </section>

        {/* ── Main Grid: Form + Sidebar ── */}
        <section className={styles.mainSection}>
          <div className={styles.mainGrid}>
            {/* ─── Contact Form ─── */}
            <div className={styles.formCard}>
              <div className={styles.formCardHeader}>
                <div className={styles.formCardIconWrap}>
                  <FiMessageSquare size={20} className={styles.formCardIcon} />
                </div>
                <div>
                  <h2 className={styles.formCardTitle}>Send a Message</h2>
                  <p className={styles.formCardSub}>
                    Fill the form below and we'll get back to you.
                  </p>
                </div>
              </div>

              {/* ── Success State ── */}
              {status === "success" && (
                <div className={styles.successBox}>
                  <FiCheckCircle size={40} className={styles.successIcon} />
                  <h3 className={styles.successTitle}>Message Sent!</h3>
                  <p className={styles.successSub}>
                    Thanks for reaching out. We'll get back to you within 24
                    hours.
                  </p>
                  <button className={styles.btnPrimary} onClick={handleReset}>
                    Send Another Message
                  </button>
                </div>
              )}

              {/* ── Error State ── */}
              {status === "error" && (
                <div className={styles.errorBanner}>
                  <FiAlertCircle size={18} className={styles.errorBannerIcon} />
                  <span>
                    Something went wrong. Please try again or email us directly.
                  </span>
                  <button
                    className={styles.errorBannerClose}
                    onClick={() => setStatus("idle")}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ── Form ── */}
              {status !== "success" && (
                <form
                  className={styles.form}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* Row 1: Name + Email */}
                  <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="name">
                        <FiUser size={13} className={styles.labelIcon} /> Full
                        Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Dipanshu Joshi"
                        value={form.name}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                        autoComplete="name"
                      />
                      {errors.name && (
                        <p className={styles.fieldError}>
                          <FiAlertCircle size={12} /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="email">
                        <FiMail size={13} className={styles.labelIcon} /> Email
                        Address <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className={styles.fieldError}>
                          <FiAlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone + Subject */}
                  <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="phone">
                        <FiPhone size={13} className={styles.labelIcon} /> Phone
                        Number{" "}
                        <span className={styles.optional}>(optional)</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <p className={styles.fieldError}>
                          <FiAlertCircle size={12} /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="subject">
                        <FiFileText size={13} className={styles.labelIcon} />{" "}
                        Subject <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.selectWrap}>
                        <select
                          id="subject"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className={`${styles.select} ${errors.subject ? styles.inputError : ""} ${!form.subject ? styles.selectPlaceholder : ""}`}
                        >
                          <option value="" disabled>
                            Select a subject
                          </option>
                          {subjectOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown
                          size={16}
                          className={styles.selectArrow}
                        />
                      </div>
                      {errors.subject && (
                        <p className={styles.fieldError}>
                          <FiAlertCircle size={12} /> {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="message">
                      <FiMessageSquare size={13} className={styles.labelIcon} />{" "}
                      Message <span className={styles.required}>*</span>
                      <span
                        className={`${styles.charCount} ${charCount > 1000 ? styles.charCountOver : ""}`}
                      >
                        {charCount}/1000
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      maxLength={1000}
                      placeholder="Describe your issue or question in detail..."
                      value={form.message}
                      onChange={handleChange}
                      className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                    />
                    {errors.message && (
                      <p className={styles.fieldError}>
                        <FiAlertCircle size={12} /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`${styles.btnPrimary} ${status === "loading" ? styles.btnLoading : ""}`}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <>
                        <span className={styles.spinner} /> Sending...
                      </>
                    ) : (
                      <>
                        <FiSend size={16} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* ─── Sidebar ─── */}
            <aside className={styles.sidebar}>
              {/* Quick Links */}
              <div className={styles.sideCard}>
                <h3 className={styles.sideCardTitle}>Quick Support</h3>
                <div className={styles.quickLinks}>
                  {[
                    { label: "Help Center", sub: "FAQs & guides" },
                    { label: "Report a Bug", sub: "Found an issue?" },
                    { label: "Feature Request", sub: "Suggest something" },
                    { label: "Billing Support", sub: "Payment queries" },
                  ].map((link, i) => (
                    <div key={i} className={styles.quickLink}>
                      <div>
                        <p className={styles.quickLinkLabel}>{link.label}</p>
                        <p className={styles.quickLinkSub}>{link.sub}</p>
                      </div>
                      <FiChevronDown
                        size={14}
                        className={styles.quickLinkArrow}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div className={`${styles.sideCard} ${styles.sideCardDark}`}>
                <div className={styles.rtHeader}>
                  <FiClock size={18} className={styles.rtIcon} />
                  <h3 className={styles.rtTitle}>Response Times</h3>
                </div>
                <div className={styles.rtList}>
                  {[
                    { type: "Email", time: "Within 24h", dot: "green" },
                    { type: "Phone", time: "Same day", dot: "blue" },
                    { type: "Chat", time: "~10 min", dot: "amber" },
                  ].map((rt, i) => (
                    <div key={i} className={styles.rtRow}>
                      <div className={styles.rtLeft}>
                        <span
                          className={`${styles.rtDot} ${styles[`rtDot_${rt.dot}`]}`}
                        />
                        <span className={styles.rtType}>{rt.type}</span>
                      </div>
                      <span className={styles.rtTime}>{rt.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className={styles.sideCard}>
                <h3 className={styles.sideCardTitle}>Follow CodifyX</h3>
                <div className={styles.socialRow}>
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.socialBtn}
                      aria-label={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
                <p className={styles.socialNote}>
                  Stay updated with contest announcements, new problems, and
                  community highlights.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

/* ─── InfoCard Sub-component ─── */
function InfoCard({ icon, label, value, sub, colorVar, href }) {
  const content = (
    <div className={`${styles.infoCard} ${styles[`infoCard_${colorVar}`]}`}>
      <div
        className={`${styles.infoCardIcon} ${styles[`infoCardIcon_${colorVar}`]}`}
      >
        {icon}
      </div>
      <div>
        <p className={styles.infoCardLabel}>{label}</p>
        <p className={styles.infoCardValue}>{value}</p>
        <p className={styles.infoCardSub}>{sub}</p>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={styles.infoCardLink}
    >
      {content}
    </a>
  ) : (
    <div className={styles.infoCardLink}>{content}</div>
  );
}
