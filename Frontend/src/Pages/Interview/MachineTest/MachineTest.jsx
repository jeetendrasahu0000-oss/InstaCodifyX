import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../../../utils/api.js";
import styles from "./MachineTest.module.css";

const MachineTest = () => {

  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState(63);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    try {
      setLoading(true);
      setOutput("Running... 🚀");

      const res = await api.post("/code/run", {
        code,
        language_id: language,
        input
      });

      setOutput(
        res.data.stdout ||
        res.data.stderr ||
        res.data.compile_output ||
        "No Output"
      );

    } catch (err) {
      console.error(err);
      setOutput(
        err.response?.data?.message || "❌ Error running code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <h2 className={styles.title}>Reverse String</h2>
        <p className={styles.desc}>
          Write a function to reverse a string.
        </p>

        <div className={styles.example}>
          <h4>Example:</h4>
          <pre>
            Input: hello
            Output: olleh
          </pre>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel}>

        {/* Top Bar */}
        <div className={styles.topBar}>
          <select
            className={styles.select}
            value={language}
            onChange={(e) => setLanguage(Number(e.target.value))}
          >
            <option value={63}>JavaScript</option>
            <option value={54}>C++</option>
            <option value={71}>Python</option>
          </select>
        </div>

        {/* Code Editor */}
        <Editor
          height="300px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />

        {/* Input Box */}
        <textarea
          className={styles.inputBox}
          placeholder="Custom Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Run Button */}
        <button
          className={styles.runBtn}
          onClick={runCode}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Code"}
        </button>

        {/* Output */}
        <div className={styles.outputBox}>
          <h4>Output:</h4>
          <pre>{output}</pre>
        </div>

      </div>

    </div>
  );
};

export default MachineTest;