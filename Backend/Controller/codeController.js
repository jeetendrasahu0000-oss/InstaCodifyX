import axios from "axios";

export const runCode = async (req, res) => {
  try {
    const { code, language_id, input } = req.body;

    console.log("📩 Incoming Data:", req.body);

    // ✅ Encode
    const encodedCode = Buffer.from(code).toString("base64");
    const encodedInput = Buffer.from(input || "").toString("base64");

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
      {
        source_code: encodedCode,
        language_id,
        stdin: encodedInput,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;

   
    const decode = (str) =>
      str ? Buffer.from(str, "base64").toString("utf-8") : "";

    console.log(" API RESPONSE:", result);

    return res.json({
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
      time: result.time,
      memory: result.memory,
    });

  } catch (error) {
    console.log(" ERROR FULL:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Code execution failed",
      details: error.response?.data || error.message,
    });
  }
};