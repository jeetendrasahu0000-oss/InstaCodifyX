// src/pages/Upgrade/Upgrade.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api.js";
import styles from "./Upgrade.module.css";
import { AuthContext } from "../../Context/AuthContext";
import {
  FiCheck, FiZap, FiStar, FiShield, FiArrowRight,
  FiClock, FiAward, FiLock, FiLoader, FiPlus, FiCreditCard,
  FiGift, FiRefreshCw, FiHeadphones
} from "react-icons/fi";
import { HiSparkles, HiOutlineFire } from "react-icons/hi2";
import { FaCrown, FaGem, FaBolt, FaMedal } from "react-icons/fa6";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_SXoYqS9QtZCf7M";

const planConfig = {
  Starter: {
    icon: <FaBolt />,
    accent: "#3b82f6",
    accentDark: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    stripe: "linear-gradient(90deg,#3b82f6,#818cf8)",
    btn: "btnBlue",
    wm: "⚡",
  },
  Pro: {
    icon: <FiStar />,
    accent: "#7c3aed",
    accentDark: "#5b21b6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    stripe: "linear-gradient(90deg,#7c3aed,#a78bfa)",
    btn: "btnPurple",
    wm: "★",
    popular: true,
  },
  Premium: {
    icon: <FaGem />,
    accent: "#d97706",
    accentDark: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    stripe: "linear-gradient(90deg,#f59e0b,#fbbf24)",
    btn: "btnAmber",
    wm: "💎",
  },
  Enterprise: {
    icon: <FaCrown />,
    accent: "#0891b2",
    accentDark: "#0e7490",
    bg: "#ecfeff",
    border: "#a5f3fc",
    stripe: "linear-gradient(90deg,#06b6d4,#38bdf8)",
    btn: "btnCyan",
    wm: "👑",
  },
};

const getFallbackConfig = (name) =>
  planConfig[name] || {
    icon: <FiZap />,
    accent: "#3b82f6",
    accentDark: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    stripe: "linear-gradient(90deg,#3b82f6,#818cf8)",
    btn: "btnBlue",
    wm: "⚡",
  };

const faqData = [
  {
    num: "01",
    icon: <FiAward />,
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. Cancel anytime from your dashboard — no hidden fees, no lengthy processes. Your access continues until the end of the billing cycle.",
  },
  {
    num: "02",
    icon: <FiCreditCard />,
    q: "What payment methods are accepted?",
    a: "We accept all major credit & debit cards, UPI (Google Pay, PhonePe, Paytm), and net banking — powered securely by Razorpay.",
  },
  {
    num: "03",
    icon: <FiGift />,
    q: "Is there a free trial available?",
    a: "Yes! Every plan includes a 3-day free trial. Explore all features without any commitment — no credit card required to start.",
  },
  {
    num: "04",
    icon: <FiArrowRight />,
    q: "How do I switch between plans?",
    a: "Switching is instant from your subscription settings. Upgrades apply immediately; downgrades take effect at the end of your current period.",
  },
  {
    num: "05",
    icon: <FiRefreshCw />,
    q: "What is the refund policy?",
    a: "We stand by our product with a 7-day hassle-free refund guarantee. Contact support within 7 days of purchase and we'll process a full refund.",
  },
];

const trustItems = [
  { icon: <FiShield />, color: "#2563eb", bg: "#eff6ff", title: "256-bit SSL Secure", sub: "Your data is fully protected" },
  { icon: <FaBolt />, color: "#16a34a", bg: "#f0fdf4", title: "Instant Activation", sub: "Access within seconds" },
  { icon: <FaMedal />, color: "#d97706", bg: "#fffbeb", title: "7-day Refund", sub: "No questions asked" },
  { icon: <FiHeadphones />, color: "#7c3aed", bg: "#f5f3ff", title: "24/7 Support", sub: "Real humans, fast replies" },
];

const Upgrade = () => {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [successPlan, setSuccessPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  const handleUpgrade = async (plan) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }
    setPaying(plan._id);
    const cfg = getFallbackConfig(plan.name);

    try {
      const { data } = await api.post("/payment/create-order", {
        userId: user?._id,
        plan,
      });

      const order = data.order;
      const finalAmount = data.finalAmount;

      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? { ...p, finalAmount } : p))
      );

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "CodifyX",
        description: `${plan.name} Plan - ${plan.durationDays} Days Access`,
        image: "/codifyxPngOrignal.png",
        prefill: { name: user?.fullname || "", email: user?.email || "" },
        theme: { color: cfg.accent },
        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?._id,
              plan: { ...plan, finalAmount },
            });
            setSuccessPlan(plan.name);
          } catch {
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: { ondismiss: () => setPaying(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        alert(`Payment failed: ${resp.error.description}`);
        setPaying(null);
      });
      rzp.open();
    } catch {
      alert("Could not initiate payment. Please try again.");
      setPaying(null);
    }
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingSpinner} />
        <p>Loading amazing plans for you...</p>
      </div>
    );

  /* ── Success ── */
  if (successPlan)
    return (
      <>
        <Header />
        <div className={styles.successPage}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🎉</div>
            <h2>
              Payment Successful! <span>✨</span>
            </h2>
            <p>
              Your <strong>{successPlan}</strong> plan has been activated
              successfully.
              <br />
              Start exploring premium features now!
            </p>
            <a href="/" className={styles.successBtn}>
              Go to Dashboard <FiArrowRight />
            </a>
          </div>
        </div>
        <Footer />
      </>
    );

  /* ── Main ── */
  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.bgMesh} aria-hidden />

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.pulse} />
            LIMITED TIME OFFER
          </div>
          <h1 className={styles.heroTitle}>
            Supercharge Your
            <br />
            <em className={styles.heroHighlight}>Learning Journey</em>
          </h1>
          <p className={styles.heroSub}>
            Unlock premium content, live mentorship sessions, and
            career-boosting tools. Pick the plan that fits you.
          </p>
        </div>

        {/* ── Plans Grid ── */}
        <div className={styles.grid}>
          {plans.map((plan) => {
            const cfg = getFallbackConfig(plan.name);
            const isPaying = paying === plan._id;
            const isPopular = cfg.popular;
            const hasDiscount =
              plan.finalAmount && plan.finalAmount < plan.price;

            return (
              <div
                key={plan._id}
                className={`${styles.card} ${isPopular ? styles.cardPop : ""}`}
                style={{
                  "--stripe": cfg.stripe,
                  "--accent": cfg.accent,
                  "--accent-bg": cfg.bg,
                }}
              >
                {/* watermark */}
                <span className={styles.cardWm} aria-hidden>
                  {cfg.wm}
                </span>

                {/* popular badge */}
                {isPopular && (
                  <div className={styles.popWrap}>
                    <div className={styles.popBadge}>
                      <HiOutlineFire /> MOST POPULAR
                    </div>
                  </div>
                )}

                {/* header */}
                <div className={styles.planHeader}>
                  <div
                    className={styles.planIcon}
                    style={{ background: cfg.bg, color: cfg.accent }}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <h2 className={styles.planName}>{plan.name}</h2>
                    <p className={styles.planDur}>
                      <FiClock size={11} />
                      &nbsp;{plan.durationDays} days access
                    </p>
                  </div>
                </div>

                <div className={styles.sep} />

                {/* price */}
                <div className={styles.priceRow}>
                  {hasDiscount ? (
                    <div className={styles.priceMain}>
                      <span className={styles.oldPrice}>
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className={styles.price}>
                        ₹{plan.finalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.priceMain}>
                      <span className={styles.currency}>₹</span>
                      <span className={styles.price}>
                        {plan.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <p className={styles.priceNote}>one-time payment</p>
                </div>

                {/* features */}
                <ul className={styles.features}>
                  {plan.features?.map((feat, i) => (
                    <li key={i} className={styles.feat}>
                      <span
                        className={styles.check}
                        style={{ background: cfg.bg, color: cfg.accent }}
                      >
                        <FiCheck size={10} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* button */}
                <button
                  className={`${styles.btn} ${styles[cfg.btn]}`}
                  style={{ "--accent-dark": cfg.accentDark }}
                  onClick={() => handleUpgrade(plan)}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <FiLoader className={styles.spin} /> Processing...
                    </>
                  ) : (
                    <>
                      {cfg.icon} Get {plan.name}{" "}
                      <FiArrowRight className={styles.arr} />
                    </>
                  )}
                </button>

                <div className={styles.cardFoot}>
                  <FiLock size={9} />
                  <span>Secure encrypted payment</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Trust ── */}
        <div className={styles.trustSection}>
          <p className={styles.trustHead}>
            <FiShield /> &nbsp;Why 50,000+ learners trust CodifyX
          </p>
          <div className={styles.trustGrid}>
            {trustItems.map((t, i) => (
              <div key={i} className={styles.trustCard}>
                <div
                  className={styles.tCircle}
                  style={{ background: t.bg, color: t.color }}
                >
                  {t.icon}
                </div>
                <h4>{t.title}</h4>
                <p>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className={styles.faqSection}>
          <div className={styles.faqHead}>
            <h3>
              Got questions?
              <br />
              We've got answers.
            </h3>
            <p>Everything you need to know before upgrading your plan</p>
          </div>

          <div className={styles.faqList}>
            {faqData.map((f, i) => (
              <div
                key={i}
                className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ""}`}
              >
                <button
                  className={styles.faqQ}
                  onClick={() => toggleFaq(i)}
                >
                  <div className={styles.faqLeft}>
                    <div className={styles.faqNum}>{f.num}</div>
                    {f.q}
                  </div>
                  <div className={styles.faqToggle}>
                    <FiPlus size={13} />
                  </div>
                </button>
                <div className={styles.faqSep} />
                <div className={styles.faqA}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Upgrade;