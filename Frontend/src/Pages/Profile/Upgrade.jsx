// src/pages/Upgrade/Upgrade.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api.js";
import styles from "./Upgrade.module.css";
import { AuthContext } from "../../Context/AuthContext";
import { FiCheck, FiZap, FiStar, FiShield, FiArrowRight, FiLoader, FiClock, FiAward, FiLock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { FaCrown, FaGem, FaRocket } from "react-icons/fa";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_SXoYqS9QtZCf7M";

const iconMap = {
    Basic: <FiZap />,
    Pro: <FiStar />,
    Premium: <FaGem />,
    Enterprise: <FaCrown />,
    Standard: <FiZap />,
    Advanced: <FaRocket />
};

const colorMap = {
    Basic: { accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    Pro: { accent: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    Premium: { accent: "#f59e0b", bg: "#fffbeb", border: "#fde68a", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
    Enterprise: { accent: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)" }
};

const Upgrade = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(null);
    const [successPlan, setSuccessPlan] = useState(null);

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

    useEffect(() => { fetchPlans(); }, []);

    const handleUpgrade = async (plan) => {
        if (!window.Razorpay) {
            alert("Razorpay SDK not loaded. Please refresh the page.");
            return;
        }
        setPaying(plan._id);

        try {
            const { data } = await api.post("/payment/create-order", {
                userId: user?._id,
                plan: plan
            });

            const order = data.order;
            const finalAmount = data.finalAmount;
            plan.finalAmount = finalAmount;

            setPlans(prev =>
                prev.map(p =>
                    p._id === plan._id ? { ...p, finalAmount } : p
                )
            );

            const options = {
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: "INR",
                order_id: order.id,
                name: "CodifyX",
                description: `${plan.name} Plan - ${plan.durationDays} Days Access`,
                image: "/codifyxPngOrignal.png",
                prefill: {
                    name: user?.fullname || "",
                    email: user?.email || "",
                },
                theme: { color: colorMap[plan.name]?.accent || "#3b82f6" },
                handler: async (response) => {
                    try {
                        await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user?._id,
                            plan,
                        });
                        setSuccessPlan(plan.name);
                    } catch (err) {
                        console.error("Verify failed:", err);
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

        } catch (err) {
            console.error("Order error:", err);
            alert("Could not initiate payment. Please try again.");
            setPaying(null);
        }
    };

    if (loading) return (
        <div className={styles.loadingPage}>
            <div className={styles.loadingSpinner} />
            <p>Loading amazing plans for you...</p>
        </div>
    );

    if (successPlan) return (
        <>
            <Header />
            <div className={styles.successPage}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>🎉</div>
                    <h2>Payment Successful! <span>✨</span></h2>
                    <p>Your <strong>{successPlan}</strong> plan has been activated successfully.<br />Start exploring premium features now!</p>
                    <a href="/upgrade" className={styles.successBtn}>
                        Go to Dashboard <FiArrowRight />
                    </a>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Header />
            <div className={styles.page}>
                {/* Hero Section */}
                <div className={styles.hero}>
                    <div className={styles.heroBadge}>
                        <HiSparkles /> LIMITED TIME OFFER
                    </div>
                    <h1 className={styles.heroTitle}>
                        Upgrade Your<br />
                        <span className={styles.heroHighlight}>Learning Journey</span>
                    </h1>
                    <p className={styles.heroSub}>
                        Get access to premium content, live sessions, and career-boosting resources.
                        Choose the plan that works best for you.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className={styles.grid}>
                    {plans.map((plan) => {
                        const colors = colorMap[plan.name] || colorMap.Basic;
                        const isPaying = paying === plan._id;
                        const isPopular = plan.name === "Pro" || plan.name === "Premium";

                        return (
                            <div
                                key={plan._id}
                                className={`${styles.card} ${isPopular ? styles.cardPopular : ""}`}
                                style={{ "--accent": colors.accent, "--accent-bg": colors.bg, "--accent-border": colors.border }}
                            >
                                {isPopular && (
                                    <div className={styles.popularBadge}>
                                        <FiAward /> Most Popular
                                    </div>
                                )}

                                <div className={styles.cardHeader}>
                                    <div className={styles.planIcon} style={{ background: colors.bg, color: colors.accent }}>
                                        {iconMap[plan.name] || <FiZap />}
                                    </div>
                                    <div>
                                        <h2 className={styles.planName}>{plan.name}</h2>
                                        <p className={styles.planDuration}>
                                            <FiClock size={12} /> {plan.durationDays} days access
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.priceRow}>
                                    {plan.finalAmount && plan.finalAmount < plan.price ? (
                                        <>
                                            <span className={styles.oldPrice}>
                                                ₹{plan.price.toLocaleString("en-IN")}
                                            </span>
                                            <span className={styles.price}>
                                                ₹{plan.finalAmount.toLocaleString("en-IN")}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles.currency}>₹</span>
                                            <span className={styles.price}>
                                                {plan.price.toLocaleString("en-IN")}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <ul className={styles.features}>
                                    {plan.features?.map((feature, idx) => (
                                        <li key={idx} className={styles.featureItem}>
                                            <span className={styles.featureCheck} style={{ background: colors.bg, color: colors.accent }}>
                                                <FiCheck />
                                            </span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`${styles.buyBtn} ${isPopular ? styles.buyBtnPopular : ""}`}
                                    style={isPopular ? { background: colors.gradient } : {}}
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={isPaying}
                                >
                                    {isPaying ? (
                                        <><FiLoader className={styles.spinIcon} /> Processing...</>
                                    ) : (
                                        <>Get {plan.name} <FiArrowRight /></>
                                    )}
                                </button>

                                <div className={styles.cardFooter}>
                                    <FiLock size={12} />
                                    <span>Secure encrypted payment</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Section */}
                <div className={styles.trustSection}>
                    <div className={styles.trustGrid}>
                        <div className={styles.trustItem}>
                            <FiShield className={styles.trustIcon} />
                            <div>
                                <h4>256-bit SSL Secure</h4>
                                <p>Your data is protected</p>
                            </div>
                        </div>
                        <div className={styles.trustItem}>
                            <FiClock className={styles.trustIcon} />
                            <div>
                                <h4>Instant Access</h4>
                                <p>Activate immediately</p>
                            </div>
                        </div>
                        <div className={styles.trustItem}>
                            <FiAward className={styles.trustIcon} />
                            <div>
                                <h4>Money-back Guarantee</h4>
                                <p>7-day hassle-free refund</p>
                            </div>
                        </div>
                        <div className={styles.trustItem}>
                            <HiSparkles className={styles.trustIcon} />
                            <div>
                                <h4>24/7 Support</h4>
                                <p>Dedicated help desk</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className={styles.faqSection}>
                    <h3>Frequently Asked Questions</h3>
                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <strong>Can I cancel anytime?</strong>
                            <p>Yes, you can cancel your subscription anytime from your dashboard.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <strong>What payment methods are accepted?</strong>
                            <p>We accept all major credit/debit cards, UPI, and net banking via Razorpay.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <strong>Is there a free trial?</strong>
                            <p>Yes, we offer a 3-day free trial on all plans!</p>
                        </div>
                        <div className={styles.faqItem}>
                            <strong>How do I upgrade/downgrade?</strong>
                            <p>You can change your plan anytime from the subscription settings.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Upgrade;