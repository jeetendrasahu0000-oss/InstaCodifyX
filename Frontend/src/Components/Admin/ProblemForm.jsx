import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProblemAPI, updateProblemAPI, getAllProblemsAPI } from '../../Components/Admin/adminApi';
import styles from './ProblemForm.module.css';

const defaultForm = {
  title: '',
  description: '',
  difficulty: 'Easy',
  tags: '',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  sampleTestCases: [{ input: '', output: '', explanation: '' }],
  hiddenTestCases: [{ input: '', output: '' }]
};

export default function ProblemForm() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getAllProblemsAPI().then(({ data }) => {
        const p = data.find(x => x._id === id);
        if (p) setForm({ ...p, tags: p.tags.join(', ') });
      });
    }
  }, [id]);

  const handleSample = (index, field, value) => {
    const updated = [...form.sampleTestCases];
    updated[index][field] = value;
    setForm({ ...form, sampleTestCases: updated });
  };

  const handleHidden = (index, field, value) => {
    const updated = [...form.hiddenTestCases];
    updated[index][field] = value;
    setForm({ ...form, hiddenTestCases: updated });
  };

  const removeSampleCase = (index) => {
    const updated = form.sampleTestCases.filter((_, i) => i !== index);
    setForm({ ...form, sampleTestCases: updated });
  };

  const removeHiddenCase = (index) => {
    const updated = form.hiddenTestCases.filter((_, i) => i !== index);
    setForm({ ...form, hiddenTestCases: updated });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('Please enter a problem title');
      return;
    }
    if (!form.description.trim()) {
      alert('Please enter a problem description');
      return;
    }
    
    setLoading(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    try {
      if (id) await updateProblemAPI(id, payload);
      else await createProblemAPI(payload);
      navigate('/admin/problems');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving problem');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {id ? '✏️ Edit Problem' : '➕ Add New Problem'}
        </h2>
        <p className={styles.subtitle}>
          {id ? 'Update your problem details' : 'Create a new coding challenge for the community'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className={styles.progressSteps}>
        <div 
          className={`${styles.step} ${activeSection === 'basic' ? styles.active : ''}`}
          onClick={() => setActiveSection('basic')}
        >
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepLabel}>Basic Info</span>
        </div>
        <div className={styles.stepLine}></div>
        <div 
          className={`${styles.step} ${activeSection === 'details' ? styles.active : ''}`}
          onClick={() => setActiveSection('details')}
        >
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepLabel}>Specifications</span>
        </div>
        <div className={styles.stepLine}></div>
        <div 
          className={`${styles.step} ${activeSection === 'testcases' ? styles.active : ''}`}
          onClick={() => setActiveSection('testcases')}
        >
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>Test Cases</span>
        </div>
      </div>

      <div className={styles.form}>
        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>📝 Basic Information</h3>
              <p className={styles.sectionDesc}>Provide the core details of your problem</p>
            </div>
            
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Problem Title <span className={styles.required}>*</span>
              </label>
              <input 
                className={styles.input} 
                placeholder="e.g., Two Sum, Reverse Linked List"
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Description <span className={styles.required}>*</span>
                <span className={styles.hint}>(Markdown supported)</span>
              </label>
              <textarea 
                className={`${styles.textarea} ${styles.textareaTall}`}
                placeholder="Describe the problem in detail. Include examples, edge cases, and any special requirements..."
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
              />
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Difficulty Level</label>
                <select 
                  className={styles.select} 
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Tags <span className={styles.hint}>(comma separated)</span>
                </label>
                <input 
                  className={styles.input} 
                  placeholder="array, two-pointers, dynamic-programming"
                  value={form.tags} 
                  onChange={e => setForm({ ...form, tags: e.target.value })} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Problem Specifications Section */}
        {activeSection === 'details' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>⚙️ Problem Specifications</h3>
              <p className={styles.sectionDesc}>Define input/output formats and constraints</p>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Input Format</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Describe how input will be provided to the solution..."
                value={form.inputFormat} 
                onChange={e => setForm({ ...form, inputFormat: e.target.value })} 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Output Format</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Describe the expected output format..."
                value={form.outputFormat} 
                onChange={e => setForm({ ...form, outputFormat: e.target.value })} 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Constraints</label>
              <textarea 
                className={styles.textarea} 
                placeholder="e.g., 1 ≤ n ≤ 10^5, -10^9 ≤ arr[i] ≤ 10^9"
                value={form.constraints} 
                onChange={e => setForm({ ...form, constraints: e.target.value })} 
              />
            </div>
          </div>
        )}

        {/* Test Cases Section */}
        {activeSection === 'testcases' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>🧪 Test Cases</h3>
              <p className={styles.sectionDesc}>Define sample and hidden test cases</p>
            </div>

            {/* Sample Test Cases */}
            <div className={styles.testCasesSection}>
              <div className={styles.testHeader}>
                <h4 className={styles.testTitle}>📖 Sample Test Cases</h4>
                <p className={styles.testHint}>Visible to users - Include examples and explanations</p>
              </div>
              
              {form.sampleTestCases.map((tc, i) => (
                <div key={i} className={styles.testCard}>
                  <div className={styles.testCardHeader}>
                    <span className={styles.testNumber}>Case {i + 1}</span>
                    {form.sampleTestCases.length > 1 && (
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeSampleCase(i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className={styles.testCardContent}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.labelSmall}>Input</label>
                      <textarea 
                        className={`${styles.input} ${styles.monospace}`} 
                        placeholder="Sample input..."
                        value={tc.input}
                        onChange={e => handleSample(i, 'input', e.target.value)} 
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.labelSmall}>Expected Output</label>
                      <textarea 
                        className={`${styles.input} ${styles.monospace}`} 
                        placeholder="Expected output..."
                        value={tc.output}
                        onChange={e => handleSample(i, 'output', e.target.value)} 
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.labelSmall}>Explanation (Optional)</label>
                      <input 
                        className={styles.input} 
                        placeholder="Explain the sample case..."
                        value={tc.explanation}
                        onChange={e => handleSample(i, 'explanation', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className={styles.addCaseBtn}
                onClick={() => setForm({ 
                  ...form, 
                  sampleTestCases: [...form.sampleTestCases, { input: '', output: '', explanation: '' }] 
                })}
              >
                + Add Sample Test Case
              </button>
            </div>

            {/* Hidden Test Cases */}
            <div className={styles.testCasesSection}>
              <div className={styles.testHeader}>
                <h4 className={styles.testTitle}>🔒 Hidden Test Cases</h4>
                <p className={styles.testHint}>Used for evaluation - Not visible to users</p>
              </div>
              
              {form.hiddenTestCases.map((tc, i) => (
                <div key={i} className={styles.testCard}>
                  <div className={styles.testCardHeader}>
                    <span className={styles.testNumber}>Hidden Case {i + 1}</span>
                    {form.hiddenTestCases.length > 1 && (
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeHiddenCase(i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className={styles.testCardContent}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.labelSmall}>Input</label>
                      <textarea 
                        className={`${styles.input} ${styles.monospace}`} 
                        placeholder="Hidden test input..."
                        value={tc.input}
                        onChange={e => handleHidden(i, 'input', e.target.value)} 
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.labelSmall}>Expected Output</label>
                      <textarea 
                        className={`${styles.input} ${styles.monospace}`} 
                        placeholder="Expected output..."
                        value={tc.output}
                        onChange={e => handleHidden(i, 'output', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className={styles.addCaseBtn}
                onClick={() => setForm({ 
                  ...form, 
                  hiddenTestCases: [...form.hiddenTestCases, { input: '', output: '' }] 
                })}
              >
                + Add Hidden Test Case
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.footer}>
          <div className={styles.navigationButtons}>
            {activeSection !== 'basic' && (
              <button 
                onClick={() => setActiveSection(activeSection === 'details' ? 'basic' : 'details')}
                className={styles.navBtn}
              >
                ← Previous
              </button>
            )}
            {activeSection !== 'testcases' ? (
              <button 
                onClick={() => setActiveSection(activeSection === 'basic' ? 'details' : 'testcases')}
                className={styles.navBtnPrimary}
              >
                Next →
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className={styles.submitBtn}
              >
                {loading ? 'Saving...' : id ? '✏️ Update Problem' : '✅ Create Problem'}
              </button>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/problems')} 
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}