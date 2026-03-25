import axios from "axios";

export const runCode = async (req, res) => {
  try {
    const { code, language_id, input } = req.body;

    console.log("📩 Incoming Data:", req.body);

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id,
        stdin: input,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API RESPONSE:", response.data);

    return res.json(response.data);

  } catch (error) {
    console.log("❌ ERROR FULL:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Code execution failed",
      details: error.response?.data || error.message,
    });
  }
};