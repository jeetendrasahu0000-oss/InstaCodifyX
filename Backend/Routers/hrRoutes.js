// Backend/Routers/hrRoutes.js
import express from "express";
import {
  addQuestion,
  getQuestions,
  scheduleInterview,
  submitAnswers,
  updateStatus,
} from "../Controller/hrController.js";
import { protectAdmin } from "../Middleware/adminAuthMiddleware.js";
import { protect } from "../Middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";
import User from "../Models/User.js";

const router = express.Router();

// ─────────────────────────────────────────────
// protectAny — Admin ya User dono ka token
// accept karta hai, dono me se koi bhi ho
// ─────────────────────────────────────────────
const protectAny = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pehle Admin table mein dhundo
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      return next(); // ✅ Admin hai
    }

    // Admin nahi mila — User table mein dhundo
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      return next(); // ✅ User hai
    }

    return res.status(401).json({ message: "Not authorized" });
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// ─────────────────────────────────────────────
// ✅ GET /questions — Admin (HrAdmin panel) +
//    User (StartInterview) dono access kar sakte
// ─────────────────────────────────────────────
router.get("/questions", protectAny, getQuestions);

// ─────────────────────────────────────────────
// ✅ User Only
// ─────────────────────────────────────────────
router.post("/submit", protect, submitAnswers);

// ─────────────────────────────────────────────
// ✅ Admin Only
// ─────────────────────────────────────────────
router.post("/add-question", protectAdmin, addQuestion);
router.post("/schedule", protectAdmin, scheduleInterview);
router.put("/status/:id", protectAdmin, updateStatus);

export default router;