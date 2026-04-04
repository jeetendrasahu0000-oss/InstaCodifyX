import React, { useState, useCallback } from "react";
import api from "../../utils/api";
import styles from "./CodeEditor.module.css";

export const LANGUAGES = [
  { id: 63,  name: "JavaScript (Node.js 12)" },
  { id: 71,  name: "Python 3" },
  { id: 54,  name: "C++ (GCC 9.2)" },
  { id: 50,  name: "C (GCC 9.2)" },
  { id: 62,  name: "Java (OpenJDK 13)" },
  { id: 72,  name: "Ruby 2.7" },
  { id: 68,  name: "PHP 7.4" },
  { id: 74,  name: "TypeScript 3.7" },
  { id: 60,  name: "Go 1.13" },
  { id: 73,  name: "Rust 1.40" },
];

const DEFAULT_CODE = {
  63:  `// JavaScript\nconsole.log("Hello, World!");`,
  71:  `# Python 3\nprint("Hello, World!")`,
  54:  `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  50:  `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  62:  `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
};

const CodeEditor = ({
  initialCode = "",
  onCodeChange,
  questionLabel = "",
  showSubmit = false,
  onSubmitCode,
}) => {
  const [langId, setLangId]       = useState(63);
  const [code, setCode]           = useState(initialCode || DEFAULT_CODE[63]);
  const [stdin, setStdin]         = useState("");
  const [output, setOutput]       = useState(null);
  const [running, setRunning]     = useState(false);
  const [activeTab, setActiveTab] = useState("output"); // output | input

  const handleLangChange = (e) => {
    const id = Number(e.target.value);
    setLangId(id);
    if (!initialCode) setCode(DEFAULT_CODE[id] || "// Start coding here");
    onCodeChange?.({ code, language_id: id, language: LANGUAGES.find(l => l.id === id)?.name });
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    onCodeChange?.({ code: e.target.value, language_id: langId, language: LANGUAGES.find(l => l.id === langId)?.name });
  };

  const handleRun = useCallback(async () => {
    if (!code.trim()) return;
    setRunning(true);
    setOutput(null);
    setActiveTab("output");

    try {
      const { data } = await api.post("/code/run", {
        code,
        language_id: langId,
        stdin,
      });
      setOutput(data);
    } catch (err) {
      setOutput({ stderr: err.response?.data?.message || "Execution failed. Please try again." });
    } finally {
      setRunning(false);
    }
  }, [code, langId, stdin]);

  const handleKeyDown = (e) => {
    // Tab key inserts spaces instead of losing focus
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const newVal = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd);
      setCode(newVal);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "";
    const id = status.id;
    if (id === 3) return styles.statusOk;
    if ([4, 5].includes(id)) return styles.statusWrong;
    if ([6, 7, 8, 9, 10, 11, 12].includes(id)) return styles.statusError;
    return styles.statusInfo;
  };

  const hasError = output && (output.stderr || output.compile_output ||
    (output.status && output.status.id !== 3));

  return (
    <div className={styles.editorWrap}>
      {questionLabel && (
        <div className={styles.questionLabel}>{questionLabel}</div>
      )}

      {/* ── TOOLBAR ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.dot} style={{ background: "#ff5f57" }} />
          <div className={styles.dot} style={{ background: "#febc2e" }} />
          <div className={styles.dot} style={{ background: "#28c840" }} />
          <span className={styles.toolbarLabel}>code.editor</span>
        </div>
        <div className={styles.toolbarRight}>
          <select
            className={styles.langSelect}
            value={langId}
            onChange={handleLangChange}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <button
            className={`${styles.runBtn} ${running ? styles.runBtnActive : ""}`}
            onClick={handleRun}
            disabled={running}
          >
            {running ? (
              <><span className={styles.spinner} /> Running...</>
            ) : (
              <><span className={styles.playIcon}>▶</span> Run</>
            )}
          </button>
          {showSubmit && (
            <button
              className={styles.submitCodeBtn}
              onClick={() => onSubmitCode?.({ code, language_id: langId })}
            >
              Save Answer
            </button>
          )}
        </div>
      </div>

      {/* ── CODE TEXTAREA ── */}
      <textarea
        className={styles.codeArea}
        value={code}
        onChange={handleCodeChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        placeholder="// Start coding here..."
      />

      {/* ── BOTTOM PANEL ── */}
      <div className={styles.bottomPanel}>
        <div className={styles.panelTabs}>
          <button
            className={`${styles.panelTab} ${activeTab === "input" ? styles.panelTabActive : ""}`}
            onClick={() => setActiveTab("input")}
          >
            stdin
          </button>
          <button
            className={`${styles.panelTab} ${activeTab === "output" ? styles.panelTabActive : ""} ${hasError ? styles.panelTabError : ""}`}
            onClick={() => setActiveTab("output")}
          >
            output {hasError && <span className={styles.errorDot} />}
          </button>
        </div>

        <div className={styles.panelBody}>
          {activeTab === "input" && (
            <textarea
              className={styles.stdinArea}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Custom input (stdin)..."
              spellCheck={false}
            />
          )}

          {activeTab === "output" && (
            <div className={styles.outputArea}>
              {running && (
                <div className={styles.outputRunning}>
                  <span className={styles.spinner} /> Executing code...
                </div>
              )}

              {!running && !output && (
                <span className={styles.outputPlaceholder}>
                  Press Run to execute your code
                </span>
              )}

              {!running && output && (
                <>
                  {output.status && (
                    <div className={`${styles.statusBadge} ${getStatusColor(output.status)}`}>
                      {output.status.description}
                      {output.time && <span className={styles.timeInfo}> · {output.time}s</span>}
                      {output.memory && <span className={styles.timeInfo}> · {output.memory}KB</span>}
                    </div>
                  )}
                  {output.stdout && (
                    <pre className={styles.outputText}>{output.stdout}</pre>
                  )}
                  {output.compile_output && (
                    <pre className={`${styles.outputText} ${styles.errorText}`}>
                      {output.compile_output}
                    </pre>
                  )}
                  {output.stderr && (
                    <pre className={`${styles.outputText} ${styles.errorText}`}>
                      {output.stderr}
                    </pre>
                  )}
                  {!output.stdout && !output.stderr && !output.compile_output && (
                    <span className={styles.outputPlaceholder}>No output</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;