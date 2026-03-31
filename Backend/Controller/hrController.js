// Controller/hrController.js
import HrQuestion from '../Models/HrQuestion.js'
import InterviewSchedule from '../Models/InterviewSchedule.js'
import InterviewAnswer from '../Models/InterviewAnswer.js'
import User from '../Models/User.js'
import { sendInterviewMail } from '../Utils/sendEmailInterviewSchedule.js'
import { createGoogleMeet } from '../Utils/googleMeet.js'

// ── HR: Add Question ─────────────────────────────────────────────────────────
export const addQuestion = async (req, res) => {
  try {
    const question = await HrQuestion.create({ ...req.body, createdBy: req.user._id })
    res.json({ success: true, question })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get Questions ────────────────────────────────────────────────────────────
export const getQuestions = async (req, res) => {
  try {
    const { experience } = req.query
    const questions = await HrQuestion.find({ experienceLevel: experience })
    res.json(questions)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions' })
  }
}

// ── Submit Answers ───────────────────────────────────────────────────────────
export const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body
    const result = await InterviewAnswer.create({ userId: req.user._id, answers })
    res.json({ success: true, result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Schedule Interview ───────────────────────────────────────────────────────
export const scheduleInterview = async (req, res) => {
  try {
    const { name, date, time, accessToken, email } = req.body;

    // ✅ validation
    if (!name || !date || !time || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Google not connected. Please login again.",
      });
    }

    // ✅ 1. Create Meet link
    const meetLink = await createGoogleMeet({
      summary: `Interview with ${name}`,
      date,
      time,
      accessToken,
    });

    // ✅ 2. Save in DB (optional but recommended)
    const schedule = await InterviewSchedule.create({
      userId: req.user._id,
      candidateName: name,
      email,
      date,
      time,
      meetingLink: meetLink,
    });

    // ✅ 3. Send Email
    await sendInterviewMail({
      to: email,
      candidateName: name,
      date,
      time,
      meetingLink: meetLink, // ✅ direct pass (no regen)
    });

    // ✅ 4. Response
    res.status(200).json({
      success: true,
      meetingLink: meetLink,
    });

  } catch (error) {
    console.error("Schedule Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to schedule interview",
    });
  }
};

// ── Update Status ────────────────────────────────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body
    const updated = await InterviewSchedule.findByIdAndUpdate(
      req.params.id,
      { status, meetingLink },
      { new: true }
    )
    if (!updated) return res.status(404).json({ message: 'Interview not found' })
    res.json(updated)
  } catch (err) {
    console.error('updateStatus error:', err)
    res.status(500).json({ message: err.message })
  }
}