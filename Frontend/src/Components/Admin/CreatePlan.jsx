// src/pages/Admin/CreatePlan/CreatePlan.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import styles from "./CreatePlan.module.css";
import { FiPlus, FiTrash2, FiCheck, FiX, FiLoader, FiStar, FiEdit3 } from "react-icons/fi";
// import { FaCrown } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const EMPTY = { name: "", price: "", durationDays: "", features: "", popular: false, description: "" };

const CreatePlan = () => {
    const [form, setForm] = useState(EMPTY);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [featureInput, setFeatureInput] = useState("");
    const [featureList, setFeatureList] = useState([]);

    const fetchPlans = async () => {
        try {
            const res = await api.get("/plans");
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
        setError(""); setSuccess("");
    };

    const addFeature = () => {
        const trimmed = featureInput.trim();
        if (!trimmed || featureList.includes(trimmed)) return;
        setFeatureList([...featureList, trimmed]);
        setFeatureInput("");
    };

    const removeFeature = (i) => setFeatureList(featureList.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        if (!form.name || !form.price || !form.durationDays) {
            setError("Name, price, and duration are required."); return;
        }
        if (featureList.length === 0) {
            setError("Add at least one feature."); return;
        }
        setLoading(true);
        try {
            await api.post("/plans/add", {
                ...form,
                price: Number(form.price),
                durationDays: Number(form.durationDays),
                features: featureList,
            });
            setSuccess(`Plan "${form.name}" created successfully!`);
            setForm(EMPTY);
            setFeatureList([]);
            fetchPlans();
        } catch (err) {
            setError(err.response?.data?.message || "Error creating plan.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            await api.delete(`/plans/${id}`);
            fetchPlans();
        } catch (err) {
            alert("Could not delete plan.");
        }
    };

    return (
        <div className={styles.page}>

            {/* Left: Create Form */}
            <div className={styles.formSection}>
                <div className={styles.formHeader}>
                    <div className={styles.formHeaderIcon}><HiSparkles /></div>
                    <div>
                        <h2>Create Plan</h2>
                        <p>Add a new subscription plan</p>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>

                    {/* Plan Name */}
                    <div className={styles.field}>
                        <label className={styles.label}>Plan Name</label>
                        <input className={styles.input} name="name" placeholder="e.g. Basic, Pro, Enterprise"
                            value={form.name} onChange={handleChange} />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label className={styles.label}>Short Description</label>
                        <input className={styles.input} name="description" placeholder="e.g. Perfect for beginners"
                            value={form.description} onChange={handleChange} />
                    </div>

                    {/* Price + Duration Row */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Price (₹)</label>
                            <div className={styles.inputPrefix}>
                                <span>₹</span>
                                <input className={`${styles.input} ${styles.inputWithPrefix}`} name="price" type="number"
                                    placeholder="499" value={form.price} onChange={handleChange} min="0" />
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Duration (Days)</label>
                            <input className={styles.input} name="durationDays" type="number"
                                placeholder="30" value={form.durationDays} onChange={handleChange} min="1" />
                        </div>
                    </div>

                    {/* Features */}
                    <div className={styles.field}>
                        <label className={styles.label}>Features</label>
                        <div className={styles.featureInputRow}>
                            <input className={styles.input} placeholder="e.g. Unlimited Submissions"
                                value={featureInput}
                                onChange={e => setFeatureInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFeature())}
                            />
                            <button type="button" className={styles.addFeatureBtn} onClick={addFeature}>
                                <FiPlus />
                            </button>
                        </div>

                        {featureList.length > 0 && (
                            <div className={styles.featureTags}>
                                {featureList.map((f, i) => (
                                    <div key={i} className={styles.featureTag}>
                                        <FiCheck className={styles.featureTagIcon} />
                                        <span>{f}</span>
                                        <button type="button" className={styles.featureTagRemove} onClick={() => removeFeature(i)}>
                                            <FiX />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Popular Toggle */}
                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <FaCrown className={styles.toggleIcon} />
                            <div>
                                <p className={styles.toggleLabel}>Mark as Popular</p>
                                <p className={styles.toggleSub}>Highlights this plan with a "Most Popular" badge</p>
                            </div>
                        </div>
                        <label className={styles.toggle}>
                            <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} />
                            <span className={styles.toggleSlider} />
                        </label>
                    </div>

                    {error && <div className={styles.errorBox}><FiX /> {error}</div>}
                    {success && <div className={styles.successBox}><FiCheck /> {success}</div>}

                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? <><FiLoader className={styles.spinIcon} /> Creating…</> : <><FiPlus /> Create Plan</>}
                    </button>
                </form>
            </div>

            {/* Right: Plans List */}
            <div className={styles.plansSection}>
                <h3 className={styles.plansTitle}>
                    <FiStar /> Existing Plans
                    <span className={styles.planCount}>{plans.length}</span>
                </h3>

                {fetching ? (
                    <div className={styles.fetchingRow}><div className={styles.miniSpinner} /> Loading…</div>
                ) : plans.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyEmoji}>📦</div>
                        <p>No plans yet. Create your first one!</p>
                    </div>
                ) : (
                    <div className={styles.plansList}>
                        {plans.map(p => (
                            <div key={p._id} className={`${styles.planRow} ${p.popular ? styles.planRowPopular : ""}`}>
                                <div className={styles.planRowLeft}>
                                    {p.popular && <FaCrown className={styles.popularIcon} />}
                                    <div>
                                        <p className={styles.planRowName}>{p.name}</p>
                                        <p className={styles.planRowMeta}>₹{p.price} · {p.durationDays} days · {p.features.length} features</p>
                                    </div>
                                </div>
                                <div className={styles.planRowActions}>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(p._id)} title="Delete">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default CreatePlan;