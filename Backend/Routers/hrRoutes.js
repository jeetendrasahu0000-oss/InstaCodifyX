import express from "express";
import {
  addQuestion,
  getQuestions,
  submitAnswers,
  scheduleInterview,
  updateStatus,
} from "../Controller/hrController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

// HR
router.post("/add-question", protect, addQuestion);

// User
router.get("/questions", protect, getQuestions);
router.post("/submit", protect, submitAnswers);
router.post("/schedule", protect, scheduleInterview);

// HR action
router.put("/status/:id", protect, updateStatus);

export default router;