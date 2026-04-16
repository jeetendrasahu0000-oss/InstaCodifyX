import express from "express";
import {
  addQuestion,
  getQuestions,
  editQuestion,
  deleteQuestion,
  scheduleInterview,
  submitAnswers,
  updateStatus,
  getStudentSubmissions,
  getStudentAnswers,
  giveFeedback,
} from "../Controller/hrController.js";
import { getAllSchedules } from "../Controller/hrController.js";
import { protectAdmin } from "../Middleware/adminAuthMiddleware.js";
import { protect } from "../Middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";
import User from "../Models/User.js";

const router = express.Router();

// ─────────────────────────────────────────────
// protectAny — Admin ya User dono ka token accept karta hai
// ─────────────────────────────────────────────
const protectAny = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ message: "Not authorized" });
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// ─────────────────────────────────────────────
// Questions Routes
// ─────────────────────────────────────────────
router.get("/questions", protectAny, getQuestions); // Admin + User
router.post("/add-question", protectAdmin, addQuestion); // Admin only
router.put("/question/:id", protectAdmin, editQuestion); // Admin only
router.delete("/question/:id", protectAdmin, deleteQuestion); // Admin only

// ─────────────────────────────────────────────
// User Routes
// ─────────────────────────────────────────────
router.post("/submit", protect, submitAnswers); // User submits answers

// ─────────────────────────────────────────────
// Admin Review Routes
// ─────────────────────────────────────────────
router.get("/submissions", protectAdmin, getStudentSubmissions); // List of students
router.get("/student-answers/:userId", protectAdmin, getStudentAnswers); // One student's Q&A
router.put("/feedback/:answerId", protectAdmin, giveFeedback); // Give feedback

// ─────────────────────────────────────────────
// Interview Scheduling
// ─────────────────────────────────────────────
router.get("/all-schedules", getAllSchedules); // ← new
router.post("/schedule", protect, scheduleInterview); // ← already exists
router.put("/status/:id", updateStatus);

export default router;
