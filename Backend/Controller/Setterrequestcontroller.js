import ProblemSetterRequest from "../Models/Problemsetterrequest.js";
import Admin from "../Models/Admin.js";
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendRequestReceivedEmail,
} from "../Utils/mailer.js";

const LOGIN_URL = process.env.CLIENT_URL
  ? `${process.env.CLIENT_URL}/admin/login`
  : "http://localhost:5173/admin/login";

// ─── POST /api/setter-requests  (public) ──────────────────────────────────────
export const submitSetterRequest = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  try {
    const existsAdmin = await Admin.findOne({ email });
    if (existsAdmin)
      return res
        .status(400)
        .json({ message: "This email is already registered." });

    const existsReq = await ProblemSetterRequest.findOne({
      email,
      status: "pending",
    });
    if (existsReq)
      return res
        .status(400)
        .json({ message: "A request with this email is already pending." });

    await ProblemSetterRequest.create({ username, email, password });

    // ✅ Mail fail ho toh bhi request save rahegi
    try {
      await sendRequestReceivedEmail(email, username);
    } catch (mailErr) {
      console.error("Acknowledgement email failed:", mailErr.message);
    }

    res
      .status(201)
      .json({ message: "Request submitted! You will be notified via email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/setter-requests  (admin only) ───────────────────────────────────
export const getAllSetterRequests = async (req, res) => {
  try {
    const requests = await ProblemSetterRequest.find()
      .sort({ createdAt: -1 })
      .select("-password");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PATCH /api/setter-requests/:id/approve  (admin only) ────────────────────
export const approveSetterRequest = async (req, res) => {
  try {
    const request = await ProblemSetterRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found." });
    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: `Request already ${request.status}.` });

    const existsAdmin = await Admin.findOne({ email: request.email });
    if (existsAdmin)
      return res
        .status(400)
        .json({ message: "This email already has an admin account." });

    // ✅ Direct insertOne — pre-save hook bypass (password already hashed hai)
    await Admin.collection.insertOne({
      username: request.username,
      email: request.email,
      password: request.password,
      role: "problem-setter",
      createdAt: new Date(),
    });

    request.status = "approved";
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    await request.save();

    // ✅ Mail fail ho toh bhi approve ho — alag try-catch
    try {
      await sendApprovalEmail(request.email, request.username, LOGIN_URL);
    } catch (mailErr) {
      console.error("Approval email failed:", mailErr.message);
    }

    res.json({ message: `${request.username} approved and account created.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PATCH /api/setter-requests/:id/reject  (admin only) ─────────────────────
export const rejectSetterRequest = async (req, res) => {
  try {
    const request = await ProblemSetterRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found." });
    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: `Request already ${request.status}.` });

    request.status = "rejected";
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    await request.save();

    // ✅ Mail fail ho toh bhi reject ho
    try {
      await sendRejectionEmail(request.email, request.username);
    } catch (mailErr) {
      console.error("Rejection email failed:", mailErr.message);
    }

    res.json({ message: `${request.username}'s request rejected.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  console.log("USER:", process.env.EMAIL_USER);
  console.log("PASS:", process.env.EMAIL_PASS);
};
