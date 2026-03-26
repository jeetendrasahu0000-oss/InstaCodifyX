import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../utils/api';
import styles from './ProblemDetail.module.css';

const LANGUAGES = [
  { id: 63,  name: 'JavaScript', monaco: 'javascript', stub: '// Write your solution here\n\n' },
  { id: 54,  name: 'C++',        monaco: 'cpp',        stub: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 71,  name: 'Python',     monaco: 'python',     stub: '# Write your solution here\n\n' },
  { id: 62,  name: 'Java',       monaco: 'java',       stub: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n' },
];

const TABS = ['Description', 'Examples', 'Constraints'];

export default function ProblemDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('Description');
  const [lang, setLang]             = useState(LANGUAGES[0]);
  const [code, setCode]             = useState(LANGUAGES[0].stub);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput]         = useState(null);
  const [running, setRunning]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [rightTab, setRightTab]     = useState('code'); // 'code' | 'result'
  const [dividerX, setDividerX]     = useState(42);     // percent
  const dragging = useRef(false);

  useEffect(() => {
    api.get(`/problems/public/${slug}`)
      .then(({ data }) => { setProblem(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  // ── Divider drag ───────────────────────────────────────────────
  const onMouseDown = () => { dragging.current = true; };
  useEffect(() => {
    const onMove = e => {
      if (!dragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setDividerX(Math.min(Math.max(pct, 25), 70));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // ── Language switch ────────────────────────────────────────────
  const switchLang = l => { setLang(l); setCode(l.stub); setOutput(null); setSubmitResult(null); };

  // ── Run Code ───────────────────────────────────────────────────
  const runCode = async () => {
    setRunning(true); setRightTab('result'); setOutput(null); setSubmitResult(null);
    try {
      const { data } = await api.post('/code/run', { code, language_id: lang.id, input: customInput });
      setOutput({ type: 'run', ...data });
    } catch (err) {
      setOutput({ type: 'error', message: err.response?.data?.message || 'Execution failed' });
    } finally { setRunning(false); }
  };

  // ── Submit (run against hidden test cases) ─────────────────────
  const submitCode = async () => {
    if (!problem?.hiddenTestCases?.length) {
      alert('No hidden test cases available for this problem.');
      return;
    }
    setSubmitting(true); setRightTab('result'); setOutput(null); setSubmitResult(null);
    try {
      const results = await Promise.all(
        problem.hiddenTestCases.map(tc =>
          api.post('/code/run', { code, language_id: lang.id, input: tc.input })
            .then(({ data }) => ({
              input: tc.input,
              expected: tc.output,
              got: (data.stdout || '').trim(),
              passed: (data.stdout || '').trim() === tc.output.trim(),
              stderr: data.stderr,
              compile_output: data.compile_output,
            }))
        )
      );
      const passed = results.filter(r => r.passed).length;
      setSubmitResult({ results, passed, total: results.length });
    } catch (err) {
      setOutput({ type: 'error', message: err.response?.data?.message || 'Submission failed' });
    } finally { setSubmitting(false); }
  };

  // ── Verdict color ──────────────────────────────────────────────
  const diffClass = d => d === 'Easy' ? styles.easy : d === 'Medium' ? styles.medium : styles.hard;

  if (loading) return (
    <div className={styles.loadScreen}>
      <div className={styles.loadSpinner} />
      <p>Loading problem…</p>
    </div>
  );

  if (!problem) return (
    <div className={styles.loadScreen}>
      <span className={styles.notFoundIcon}>🔎</span>
      <p>Problem not found</p>
      <button onClick={() => navigate('/problems')} className={styles.backBtn}>← Back to Problems</button>
    </div>
  );

  return (
    <div className={styles.root}>

      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <button className={styles.logoBack} onClick={() => navigate('/problems')}>
          <span className={styles.logoMark}>CX</span>
          <span className={styles.logoSep}>/</span>
          <span className={styles.logoProblems}>Problems</span>
        </button>

        <div className={styles.topCenter}>
          <span className={styles.problemName}>{problem.title}</span>
          <span className={`${styles.diffPill} ${diffClass(problem.difficulty)}`}>{problem.difficulty}</span>
        </div>

        <div className={styles.topRight}>
          <button className={styles.runBtn} onClick={runCode} disabled={running || submitting}>
            {running ? <span className={styles.btnSpinner} /> : '▶'} Run
          </button>
          <button className={styles.submitBtn} onClick={submitCode} disabled={running || submitting}>
            {submitting ? <span className={styles.btnSpinner} /> : ''} Submit
          </button>
        </div>
      </header>

      {/* ── Split Body ── */}
      <div className={styles.body}>

        {/* LEFT PANEL */}
        <div className={styles.leftPanel} style={{ width: `${dividerX}%` }}>

          {/* Tab Bar */}
          <div className={styles.tabBar}>
            {TABS.map(t => (
              <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          <div className={styles.leftScroll}>

            {/* ── Description Tab ── */}
            {activeTab === 'Description' && (
              <div className={styles.descSection}>
                <div className={styles.tagRow}>
                  {problem.tags?.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
                <div className={styles.prose} dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br/>') }} />
                {problem.inputFormat && (
                  <div className={styles.formatBlock}>
                    <h4 className={styles.formatTitle}>Input Format</h4>
                    <p>{problem.inputFormat}</p>
                  </div>
                )}
                {problem.outputFormat && (
                  <div className={styles.formatBlock}>
                    <h4 className={styles.formatTitle}>Output Format</h4>
                    <p>{problem.outputFormat}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Examples Tab ── */}
            {activeTab === 'Examples' && (
              <div className={styles.examplesSection}>
                {problem.sampleTestCases?.length ? problem.sampleTestCases.map((tc, i) => (
                  <div key={i} className={styles.exampleCard}>
                    <div className={styles.exampleNum}>Example {i + 1}</div>
                    <div className={styles.ioRow}>
                      <div className={styles.ioBlock}>
                        <span className={styles.ioLabel}>Input</span>
                        <pre className={styles.ioCode}>{tc.input}</pre>
                      </div>
                      <div className={styles.ioArrow}>→</div>
                      <div className={styles.ioBlock}>
                        <span className={styles.ioLabel}>Output</span>
                        <pre className={styles.ioCode}>{tc.output}</pre>
                      </div>
                    </div>
                    {tc.explanation && (
                      <div className={styles.explanation}>
                        <span className={styles.explLabel}>Explanation:</span> {tc.explanation}
                      </div>
                    )}
                  </div>
                )) : <p className={styles.noData}>No examples provided.</p>}
              </div>
            )}

            {/* ── Constraints Tab ── */}
            {activeTab === 'Constraints' && (
              <div className={styles.constraintsSection}>
                {problem.constraints
                  ? <pre className={styles.constraintsPre}>{problem.constraints}</pre>
                  : <p className={styles.noData}>No constraints listed.</p>}
              </div>
            )}

          </div>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} onMouseDown={onMouseDown} />

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel} style={{ width: `${100 - dividerX - 0.4}%` }}>

          {/* Right Tab Bar */}
          <div className={styles.rightTabBar}>
            <button className={`${styles.rTab} ${rightTab === 'code' ? styles.rTabActive : ''}`}
              onClick={() => setRightTab('code')}>Code</button>
            <button className={`${styles.rTab} ${rightTab === 'result' ? styles.rTabActive : ''}`}
              onClick={() => setRightTab('result')}>
              Result
              {submitResult && (
                <span className={submitResult.passed === submitResult.total ? styles.verdictBadgePass : styles.verdictBadgeFail}>
                  {submitResult.passed}/{submitResult.total}
                </span>
              )}
            </button>

            {/* Language selector (always visible) */}
            <div className={styles.langWrap}>
              <select className={styles.langSelect} value={lang.id}
                onChange={e => switchLang(LANGUAGES.find(l => l.id === +e.target.value))}>
                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* ── Code tab ── */}
          {rightTab === 'code' && (
            <div className={styles.editorWrap}>
              <Editor
                height="100%"
                language={lang.monaco}
                theme="vs-dark"
                value={code}
                onChange={v => setCode(v || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  padding: { top: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                }}
              />
            </div>
          )}

          {/* ── Result tab ── */}
          {rightTab === 'result' && (
            <div className={styles.resultArea}>

              {/* Custom Input */}
              <div className={styles.inputSection}>
                <label className={styles.inputLabel}>Custom Input</label>
                <textarea
                  className={styles.customInput}
                  placeholder="Enter test input here…"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Run output */}
              {output && output.type === 'run' && (
                <div className={styles.outputBlock}>
                  <div className={styles.outputHeader}>
                    <span className={styles.outputTitle}>Output</span>
                    {output.time && <span className={styles.execTime}>⏱ {output.time}s</span>}
                    {output.memory && <span className={styles.execMem}> {output.memory}KB</span>}
                  </div>
                  {output.compile_output && (
                    <pre className={`${styles.outputPre} ${styles.outputErr}`}>{output.compile_output}</pre>
                  )}
                  {output.stderr && (
                    <pre className={`${styles.outputPre} ${styles.outputErr}`}>{output.stderr}</pre>
                  )}
                  {output.stdout && (
                    <pre className={`${styles.outputPre} ${styles.outputOk}`}>{output.stdout}</pre>
                  )}
                  {!output.stdout && !output.stderr && !output.compile_output && (
                    <pre className={styles.outputPre}>No output</pre>
                  )}
                </div>
              )}

              {output && output.type === 'error' && (
                <div className={`${styles.outputBlock} ${styles.outputErr}`}>
                  <p> {output.message}</p>
                </div>
              )}

              {/* Submit results */}
              {submitResult && (
                <div className={styles.submitResults}>
                  <div className={submitResult.passed === submitResult.total ? styles.verdictPass : styles.verdictFail}>
                    {submitResult.passed === submitResult.total ? ' Accepted' : ' Wrong Answer'}
                    <span className={styles.score}>{submitResult.passed} / {submitResult.total} test cases passed</span>
                  </div>
                  <div className={styles.tcList}>
                    {submitResult.results.map((r, i) => (
                      <div key={i} className={`${styles.tcRow} ${r.passed ? styles.tcPass : styles.tcFail}`}>
                        <span className={styles.tcNum}>Case {i + 1}</span>
                        <span className={styles.tcStatus}>{r.passed ? '✓ Passed' : ' Failed'}</span>
                        {!r.passed && (
                          <div className={styles.tcDetails}>
                            <span>Expected: <code>{r.expected}</code></span>
                            <span>Got: <code>{r.got || r.stderr || '(no output)'}</code></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!output && !submitResult && !running && !submitting && (
                <div className={styles.resultPlaceholder}>
                  <span className={styles.resultIcon}>⚡</span>
                  <p>Run your code or submit to see results</p>
                </div>
              )}

              {(running || submitting) && (
                <div className={styles.resultPlaceholder}>
                  <div className={styles.loadSpinner} />
                  <p>{submitting ? 'Judging your submission…' : 'Running your code…'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}