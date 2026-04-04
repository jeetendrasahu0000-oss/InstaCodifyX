// Backend/Controller/hrController.js
import HrQuestion from "../Models/HrQuestion.js";
import InterviewSchedule from "../Models/InterviewSchedule.js";
import { sendInterviewMail } from "../Utils/sendEmailInterviewSchedule.js";
import { createGoogleMeet } from "../Utils/googleMeet.js";

// ───────────────────────────────
// Add HR Question (ADMIN ONLY)
// ───────────────────────────────
export const addQuestion = async (req, res) => {
  try {
    const { question, experienceLevel } = req.body;

    if (!question || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: "Question and experience level are required",
      });
    }

    const newQuestion = await HrQuestion.create({
      question,
      experienceLevel,
      createdBy: req.admin._id, // ✅ strictly admin
    });

    res.status(201).json({
      success: true,
      question: newQuestion,
    });
  } catch (err) {
    console.error("Add Question Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────
// Get HR Questions (ADMIN ONLY)
// ───────────────────────────────
export const getQuestions = async (req, res) => {
  try {
    const { experience } = req.query;

    const filter = experience ? { experienceLevel: experience } : {};

    const questions = await HrQuestion.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err) {
    console.error("Get Questions Error:", err);
    res.status(500).json({ message: "Error fetching questions" });
  }
};

// ───────────────────────────────
// Schedule Interview (ADMIN ONLY)
// ───────────────────────────────
export const scheduleInterview = async (req, res) => {
  try {
    const { name, date, time, accessToken, email } = req.body;

    if (!name || !date || !time || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!accessToken) {
      return res.status(400).json({ message: "Google not connected" });
    }

    // Create Google Meet
    const meetLink = await createGoogleMeet({
      summary: `Interview with ${name}`,
      date,
      time,
      accessToken,
    });

    // Save interview schedule
    const schedule = await InterviewSchedule.create({
      candidateName: name,
      email,
      date,
      time,
      meetingLink: meetLink,
      createdBy: req.admin._id, // ✅ strictly admin
      status: "scheduled",
    });

    // Send email to candidate
    await sendInterviewMail({
      to: email,
      candidateName: name,
      date,
      time,
      meetingLink: meetLink,
    });

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (err) {
    console.error("Schedule Interview Error:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to schedule interview" });
  }
};

// ───────────────────────────────
// Update Interview Status (ADMIN ONLY)
// ───────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body;

    const updated = await InterviewSchedule.findByIdAndUpdate(
      req.params.id,
      { status, meetingLink },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.status(200).json({
      success: true,
      updated,
    });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────
// Submit User Answers (USER ONLY)
// ───────────────────────────────
import InterviewAnswer from "../Models/InterviewAnswer.js"; // ensure ye model hai

export const submitAnswers = async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    if (!questionId || !answer) {
      return res
        .status(400)
        .json({ message: "Question ID and answer required" });
    }

    const newAnswer = await InterviewAnswer.create({
      question: questionId,
      answer,
      user: req.user._id, // ✅ user id from auth middleware
    });

    res.status(201).json({
      success: true,
      message: "Answer submitted successfully",
      answer: newAnswer,
    });
  } catch (err) {
    console.error("Submit Answers Error:", err);
    res.status(500).json({ message: err.message });
  }
};
