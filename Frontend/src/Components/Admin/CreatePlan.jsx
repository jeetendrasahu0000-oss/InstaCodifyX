import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import styles from "./CreatePlan.module.css";
import {
  FiPlus, FiEdit3, FiCheck, FiX, FiLoader,
  FiStar, FiEye, FiEyeOff, FiSave
} from "react-icons/fi";
import { FaCrown, FaGem } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const EMPTY = {
  name: "", price: "", durationDays: "",
  features: [], popular: false, description: "", level: 1
};

const LEVEL_COLORS = [
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#fef3c7", color: "#633806" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fce7f3", color: "#831843" },
  { bg: "#ede9fe", color: "#4c1d95" },
];

const getLevelStyle = (level) => LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];

const CreatePlan = () => {
  const [form, setForm] = useState(EMPTY);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [featureList, setFeatureList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/plans?all=true");
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

  const resetForm = () => {
    setForm(EMPTY); setFeatureList([]);
    setEditingId(null); setError(""); setSuccess("");
  };

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name || "", description: plan.description || "",
      price: plan.price || "", durationDays: plan.durationDays || "",
      popular: plan.popular || false, level: plan.level || 1,
    });
    setFeatureList(plan.features || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name || form.price === "" || form.durationDays === "") {
      setError("Name, price, and duration are required."); return;
    }
    if (featureList.length === 0) {
      setError("Add at least one feature."); return;
    }
    setLoading(true);

    // ✅ Robust parser — handles: "30", "30days", "30 days", "1month", "2months", "1year"
    const parseDuration = (val) => {
      const str = String(val).toLowerCase().trim();
      if (str.includes("year"))  return Math.round((parseFloat(str) || 1) * 365);
      if (str.includes("month")) return Math.round((parseFloat(str) || 1) * 30);
      const extracted = parseFloat(str.replace(/[^\d.]/g, ""));
      return extracted > 0 ? Math.round(extracted) : NaN;
    };

    const parsedDuration = parseDuration(form.durationDays);
    if (!parsedDuration || isNaN(parsedDuration)) {
      setError("Invalid duration. Use: 30, 30days, 1month, 1year");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name, description: form.description,
      price: Number(form.price), durationDays: parsedDuration,
      level: Number(form.level) || 1, popular: form.popular,
      features: featureList, active: true
    };
    try {
      if (editingId) {
        await api.put(`/plans/edit/${editingId}`, payload);
        setSuccess(`✨ Plan "${form.name}" updated successfully!`);
      } else {
        await api.post("/plans/add", payload);
        setSuccess(`🎉 Plan "${form.name}" created successfully!`);
      }
      resetForm(); fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await api.patch(`/plans/toggle/${plan._id}`);
      fetchPlans();
      setSuccess(`🔁 Plan "${plan.name}" ${!plan.active ? "activated" : "deactivated"}!`);
      setTimeout(() => setSuccess(""), 2500);
    } catch {
      setError("Could not update plan status.");
    }
  };

  return (
    <div className={styles.page}>
      {/* ── LEFT: FORM ── */}
      <div className={styles.formSection}>
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}>
            {editingId ? <FiEdit3 /> : <FaCrown />}
          </div>
          <div>
            <h2 className={styles.formTitle}>
              {editingId ? "Edit Plan" : "Create New Plan"}
            </h2>
            <p className={styles.formSub}>
              {editingId ? "Modify plan details below" : "Design a powerful subscription plan"}
            </p>
          </div>
          {editingId && (
            <button className={styles.cancelBtn} onClick={resetForm}>
              <FiX size={13} /> Cancel
            </button>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Plan Name</label>
            <input className={styles.input} name="name" placeholder="e.g., Pro Unlimited"
              value={form.name} onChange={handleChange} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <input className={styles.input} name="description"
              placeholder="What makes this plan special?"
              value={form.description} onChange={handleChange} />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Price (₹)</label>
              <div className={styles.inputPrefixWrap}>
                <span className={styles.inputPrefixSymbol}>₹</span>
                <input className={styles.input} name="price" type="number"
                  placeholder="0" value={form.price} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Duration</label>
              <input className={styles.input} name="durationDays"
                placeholder="30, 1month, 1year"
                value={form.durationDays} onChange={handleChange} />
              <span className={styles.hint}>days / 1month / 1year</span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Priority Level</label>
              <input className={styles.input} name="level" type="number"
                placeholder="1–10" value={form.level} onChange={handleChange} />
            </div>
            <div className={styles.field} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Features & Benefits</label>
            <div className={styles.featureRow}>
              <input className={styles.input} placeholder="e.g., Unlimited downloads"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
              <button type="button" className={styles.addFeatureBtn} onClick={addFeature}>
                <FiPlus size={16} />
              </button>
            </div>
            <div className={styles.featureTags}>
              {featureList.length === 0
                ? <span className={styles.hint}>✨ Add features to highlight value</span>
                : featureList.map((f, i) => (
                    <span key={i} className={styles.featureTag}>
                      <FiCheck size={11} /> {f}
                      <button type="button" className={styles.tagRemove} onClick={() => removeFeature(i)}>
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
            </div>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <div className={styles.toggleIconWrap}>
                <FiStar size={14} />
              </div>
              <div>
                <div className={styles.toggleLabel}>Mark as Popular</div>
                <div className={styles.toggleSub}>Featured badge & highlight</div>
              </div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          {error && <div className={styles.errorBox}><FiX size={13} /> {error}</div>}
          {success && <div className={styles.successBox}><FiCheck size={13} /> {success}</div>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading
              ? <><FiLoader className={styles.spin} /> Processing...</>
              : editingId
                ? <><FiSave size={15} /> Update Plan</>
                : <><HiSparkles size={15} /> Create Plan</>}
          </button>
        </form>
      </div>

      {/* ── RIGHT: PLANS LIST ── */}
      <div className={styles.plansSection}>
        <div className={styles.plansHeader}>
          <div className={styles.plansHeaderIcon}><FaGem /></div>
          <div>
            <div className={styles.formTitle}>All Subscription Plans</div>
            <div className={styles.formSub}>Manage and publish your plans</div>
          </div>
          <span className={styles.activeCount}>
            {plans.filter(p => p.active).length} active
          </span>
        </div>

        {fetching ? (
          <div className={styles.fetchingRow}>
            <div className={styles.miniSpinner} /> Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyEmoji}>📦</div>
            <p>No plans yet. Create your first plan!</p>
          </div>
        ) : (
          <div className={styles.plansList}>
            {plans.map((plan) => {
              const lvlStyle = getLevelStyle(plan.level);
              return (
                <div key={plan._id}
                  className={[
                    styles.planCard,
                    plan.popular ? styles.planCardPopular : "",
                    !plan.active ? styles.planCardInactive : "",
                  ].join(" ")}>

                  <div className={styles.planCardLeft}>
                    {plan.popular && <span className={styles.popularDot} />}
                    <div>
                      <div className={styles.planNameRow}>
                        <span className={styles.planName}>{plan.name}</span>
                        <span className={styles.levelBadge}
                          style={{ background: lvlStyle.bg, color: lvlStyle.color }}>
                          Lv.{plan.level}
                        </span>
                        {plan.active
                          ? <span className={styles.publishedBadge}>Published</span>
                          : <span className={styles.draftBadge}>Draft</span>}
                      </div>
                      <div className={styles.planMeta}>
                        ₹{plan.price} · {plan.durationDays} days · {plan.features?.length || 0} features
                      </div>
                    </div>
                  </div>

                  <div className={styles.planActions}>
                    {/* EDIT */}
                    <div className={styles.actionWrap}>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(plan)} title="Edit plan">
                        <FiEdit3 size={13} />
                      </button>
                      <span className={styles.actionLabel}>Edit</span>
                    </div>

                    {/* PUBLISH / UNPUBLISH */}
                    <div className={styles.actionWrap}>
                      <button
                        className={`${styles.actionBtn} ${plan.active ? styles.unpublishBtn : styles.publishBtn}`}
                        onClick={() => handleToggleActive(plan)}
                        title={plan.active ? "Unpublish" : "Publish"}>
                        {plan.active ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                      </button>
                      <span className={styles.actionLabel}>
                        {plan.active ? "Unpublish" : "Publish"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlan;