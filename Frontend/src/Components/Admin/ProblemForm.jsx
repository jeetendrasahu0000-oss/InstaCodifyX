// ProblemForm.jsx — White theme | Renders inside AdminDashboard <Outlet />
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProblemAPI,
  updateProblemAPI,
  getAllProblemsAPI,
} from "../../Components/Admin/adminApi";
import {
  MdOutlineAssignment,
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdAdd,
  MdClose,
  MdInfoOutline,
  MdSettings,
  MdBugReport,
} from "react-icons/md";
import styles from "./ProblemForm.module.css";

const defaultForm = {
  title: "",
  description: "",
  difficulty: "Easy",
  tags: "",
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  sampleTestCases: [{ input: "", output: "", explanation: "" }],
  hiddenTestCases: [{ input: "", output: "" }],
};

const STEPS = [
  { key: "basic", label: "Basic Info", Icon: MdInfoOutline },
  { key: "details", label: "Specifications", Icon: MdSettings },
  { key: "testcases", label: "Test Cases", Icon: MdBugReport },
];

export default function ProblemForm() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("basic");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getAllProblemsAPI().then(({ data }) => {
        const p = data.find((x) => x._id === id);
        if (p) setForm({ ...p, tags: p.tags.join(", ") });
      });
    }
  }, [id]);

  const stepIndex = STEPS.findIndex((s) => s.key === activeStep);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setActiveStep(STEPS[stepIndex + 1].key);
  };
  const goPrev = () => {
    if (stepIndex > 0) setActiveStep(STEPS[stepIndex - 1].key);
  };

  const handleSample = (i, field, val) => {
    const u = [...form.sampleTestCases];
    u[i][field] = val;
    setForm({ ...form, sampleTestCases: u });
  };
  const handleHidden = (i, field, val) => {
    const u = [...form.hiddenTestCases];
    u[i][field] = val;
    setForm({ ...form, hiddenTestCases: u });
  };
  const removeSample = (i) =>
    setForm({
      ...form,
      sampleTestCases: form.sampleTestCases.filter((_, j) => j !== i),
    });
  const removeHidden = (i) =>
    setForm({
      ...form,
      hiddenTestCases: form.hiddenTestCases.filter((_, j) => j !== i),
    });

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Please enter a problem title");
      return;
    }
    if (!form.description.trim()) {
      alert("Please enter a problem description");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (id) await updateProblemAPI(id, payload);
      else await createProblemAPI(payload);
      navigate("/admin/problems");
    } catch (err) {
      alert(err.response?.data?.message || "Error saving problem");
    }
    setLoading(false);
  };

  const DIFF_OPTIONS = [
    { val: "Easy", color: "#059669", bg: "#f0fdf4" },
    { val: "Medium", color: "#d97706", bg: "#fffbeb" },
    { val: "Hard", color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin/problems")}
        >
          <MdArrowBack size={16} /> Problems
        </button>
        <div>
          <div className={styles.breadcrumb}>
            <MdOutlineAssignment size={13} />
            {id ? "Edit Problem" : "New Problem"}
          </div>
          <h2 className={styles.pageTitle}>
            {id ? "Edit Problem" : "Add New Problem"}
          </h2>
          <p className={styles.pageSub}>
            {id
              ? "Update the details of this problem"
              : "Create a new coding challenge"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className={styles.steps}>
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = s.key === activeStep;
          const IconComp = s.Icon;
          return (
            <div key={s.key} className={styles.stepWrap}>
              <button
                className={[
                  styles.step,
                  current ? styles.stepCurrent : "",
                  done ? styles.stepDone : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveStep(s.key)}
              >
                <span className={styles.stepBubble}>
                  {done ? <MdCheck size={15} /> : <IconComp size={15} />}
                </span>
                <span className={styles.stepLabel}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`${styles.stepLine} ${done ? styles.stepLineDone : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div className={styles.card}>
        {/* ── Step 1: Basic Info ── */}
        {activeStep === "basic" && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <MdInfoOutline size={20} color="#2563eb" />
              <div>
                <div className={styles.sectionTitle}>Basic Information</div>
                <div className={styles.sectionSub}>
                  Core details of the problem
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Problem Title <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                placeholder="e.g., Two Sum, Reverse Linked List"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Description <span className={styles.req}>*</span>
                <span className={styles.hint}>Markdown supported</span>
              </label>
              <textarea
                className={`${styles.textarea} ${styles.textareaTall}`}
                placeholder="Describe the problem in detail..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Difficulty Level</label>
                <div className={styles.diffRow}>
                  {DIFF_OPTIONS.map(({ val, color, bg }) => (
                    <button
                      key={val}
                      type="button"
                      className={`${styles.diffBtn} ${form.difficulty === val ? styles.diffBtnActive : ""}`}
                      style={
                        form.difficulty === val
                          ? { background: bg, borderColor: color, color }
                          : {}
                      }
                      onClick={() => setForm({ ...form, difficulty: val })}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Tags <span className={styles.hint}>comma separated</span>
                </label>
                <input
                  className={styles.input}
                  placeholder="array, two-pointers, dp"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Specifications ── */}
        {activeStep === "details" && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <MdSettings size={20} color="#7c3aed" />
              <div>
                <div className={styles.sectionTitle}>
                  Problem Specifications
                </div>
                <div className={styles.sectionSub}>
                  Define input/output formats and constraints
                </div>
              </div>
            </div>

            {[
              {
                key: "inputFormat",
                label: "Input Format",
                ph: "Describe how input is provided...",
              },
              {
                key: "outputFormat",
                label: "Output Format",
                ph: "Describe the expected output...",
              },
              {
                key: "constraints",
                label: "Constraints",
                ph: "e.g., 1 ≤ n ≤ 10^5, -10^9 ≤ arr[i] ≤ 10^9",
              },
            ].map(({ key, label, ph }) => (
              <div className={styles.field} key={key}>
                <label className={styles.label}>{label}</label>
                <textarea
                  className={styles.textarea}
                  placeholder={ph}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Step 3: Test Cases ── */}
        {activeStep === "testcases" && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <MdBugReport size={20} color="#059669" />
              <div>
                <div className={styles.sectionTitle}>Test Cases</div>
                <div className={styles.sectionSub}>
                  Sample and hidden test cases
                </div>
              </div>
            </div>

            {/* Sample Test Cases */}
            <div className={styles.tcGroup}>
              <div className={styles.tcGroupHeader}>
                <div className={styles.tcGroupTitle}>Sample Test Cases</div>
                <div className={styles.tcGroupSub}>
                  Visible to users — include explanations
                </div>
              </div>
              {form.sampleTestCases.map((tc, i) => (
                <div key={i} className={styles.tcCard}>
                  <div className={styles.tcCardHeader}>
                    <span className={styles.tcNum}>Case {i + 1}</span>
                    {form.sampleTestCases.length > 1 && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeSample(i)}
                        title="Remove"
                      >
                        <MdClose size={14} />
                      </button>
                    )}
                  </div>
                  <div className={styles.tcCardBody}>
                    <div className={styles.tcField}>
                      <label className={styles.labelSm}>Input</label>
                      <textarea
                        className={`${styles.input} ${styles.mono}`}
                        placeholder="Sample input..."
                        value={tc.input}
                        onChange={(e) =>
                          handleSample(i, "input", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.tcField}>
                      <label className={styles.labelSm}>Expected Output</label>
                      <textarea
                        className={`${styles.input} ${styles.mono}`}
                        placeholder="Expected output..."
                        value={tc.output}
                        onChange={(e) =>
                          handleSample(i, "output", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.tcField}>
                      <label className={styles.labelSm}>
                        Explanation{" "}
                        <span className={styles.hint}>optional</span>
                      </label>
                      <input
                        className={styles.input}
                        placeholder="Explain this case..."
                        value={tc.explanation}
                        onChange={(e) =>
                          handleSample(i, "explanation", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                className={styles.addCaseBtn}
                onClick={() =>
                  setForm({
                    ...form,
                    sampleTestCases: [
                      ...form.sampleTestCases,
                      { input: "", output: "", explanation: "" },
                    ],
                  })
                }
              >
                <MdAdd size={16} /> Add Sample Test Case
              </button>
            </div>

            {/* Hidden Test Cases */}
            <div className={styles.tcGroup}>
              <div className={styles.tcGroupHeader}>
                <div className={styles.tcGroupTitle}>Hidden Test Cases</div>
                <div className={styles.tcGroupSub}>
                  Used for evaluation — not visible to users
                </div>
              </div>
              {form.hiddenTestCases.map((tc, i) => (
                <div key={i} className={styles.tcCard}>
                  <div className={styles.tcCardHeader}>
                    <span className={styles.tcNum}>Hidden Case {i + 1}</span>
                    {form.hiddenTestCases.length > 1 && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeHidden(i)}
                        title="Remove"
                      >
                        <MdClose size={14} />
                      </button>
                    )}
                  </div>
                  <div className={styles.tcCardBody}>
                    <div className={styles.tcField}>
                      <label className={styles.labelSm}>Input</label>
                      <textarea
                        className={`${styles.input} ${styles.mono}`}
                        placeholder="Hidden test input..."
                        value={tc.input}
                        onChange={(e) =>
                          handleHidden(i, "input", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.tcField}>
                      <label className={styles.labelSm}>Expected Output</label>
                      <textarea
                        className={`${styles.input} ${styles.mono}`}
                        placeholder="Expected output..."
                        value={tc.output}
                        onChange={(e) =>
                          handleHidden(i, "output", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                className={styles.addCaseBtn}
                onClick={() =>
                  setForm({
                    ...form,
                    hiddenTestCases: [
                      ...form.hiddenTestCases,
                      { input: "", output: "" },
                    ],
                  })
                }
              >
                <MdAdd size={16} /> Add Hidden Test Case
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={() => navigate("/admin/problems")}
          >
            Cancel
          </button>
          <div className={styles.navBtns}>
            {stepIndex > 0 && (
              <button className={styles.prevBtn} onClick={goPrev}>
                <MdArrowBack size={16} /> Previous
              </button>
            )}
            {stepIndex < STEPS.length - 1 ? (
              <button className={styles.nextBtn} onClick={goNext}>
                Next <MdArrowForward size={16} />
              </button>
            ) : (
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                <MdCheck size={16} />
                {loading
                  ? "Saving..."
                  : id
                    ? "Update Problem"
                    : "Create Problem"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
